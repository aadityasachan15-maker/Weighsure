import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_REPORTS, evaluateOverallReportStatus } from './src/utils/oimlEngine.ts';
import { OIMLTestReport } from './src/types/oiml.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory reports store initialized with sample OIML reports
const reportsStore: Map<string, OIMLTestReport> = new Map();
SAMPLE_REPORTS.forEach((report) => {
  reportsStore.set(report.id, report);
});

// Lazy Gemini AI Client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'WeighSure - OIML R-76 NAWI Verification System',
    timestamp: new Date().toISOString(),
  });
});

// Download SIH 2026 Presentation PDF
app.get('/SIH_2026_PS35_WeighSure_Presentation.pdf', (req, res) => {
  const pdfPath = path.join(process.cwd(), 'public', 'SIH_2026_PS35_WeighSure_Presentation.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="SIH_2026_PS35_WeighSure_Presentation.pdf"');
  res.sendFile(pdfPath);
});

// Fetch all test reports
app.get('/api/reports', (req, res) => {
  const all = Array.from(reportsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(all);
});

// Fetch single test report
app.get('/api/reports/:id', (req, res) => {
  const report = reportsStore.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

// Create or update a test report
app.post('/api/reports', (req, res) => {
  const report: OIMLTestReport = req.body;
  if (!report || !report.id) {
    return res.status(400).json({ error: 'Invalid report data. Report ID required.' });
  }
  const status = evaluateOverallReportStatus(report);
  const cleanId = report.id.replace(/[^a-zA-Z0-9]/g, '');
  const updatedReport: OIMLTestReport = {
    ...report,
    weighingTestPassed: status.weighingPassed,
    eccentricityTestPassed: status.eccentricityPassed,
    repeatabilityTestPassed: status.repeatabilityPassed,
    overallVerdict: status.overallVerdict,
    verificationHash:
      status.overallVerdict === 'PASS'
        ? (!report.verificationHash || report.verificationHash.includes('FAIL')
            ? `SHA256-OIML76-CERTIFIED-${cleanId}`
            : report.verificationHash)
        : (!report.verificationHash || report.verificationHash.includes('CERTIFIED')
            ? `SHA256-FAIL-NONCONFORMING-${cleanId}`
            : report.verificationHash),
  };
  reportsStore.set(updatedReport.id, updatedReport);
  res.json(updatedReport);
});

// Reset reports to official benchmark presets
app.post('/api/reports/reset', (req, res) => {
  reportsStore.clear();
  SAMPLE_REPORTS.forEach((report) => {
    reportsStore.set(report.id, JSON.parse(JSON.stringify(report)));
  });
  const all = Array.from(reportsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(all);
});

// Public Verification endpoint for QR scan
app.get('/api/verify/:id', (req, res) => {
  const report = reportsStore.get(req.params.id);
  if (!report) {
    return res.status(404).json({
      verified: false,
      message: 'Certificate / Report ID not found in Legal Metrology National Verification Register.',
    });
  }

  res.json({
    verified: true,
    reportId: report.id,
    manufacturer: report.instrument.manufacturer,
    model: report.instrument.model,
    serialNumber: report.instrument.serialNumber,
    accuracyClass: report.instrument.accuracyClass,
    maxCapacity: `${report.instrument.maxCapacity} ${report.instrument.unit}`,
    scaleIntervalE: `${report.instrument.scaleIntervalE} ${report.instrument.unit}`,
    testingDate: report.environment.testingDate,
    testingOfficer: report.environment.officerName,
    officerId: report.environment.officerId,
    laboratory: `${report.environment.labName}, ${report.environment.labLocation}`,
    overallVerdict: report.overallVerdict,
    verificationHash: report.verificationHash,
    digitalSignatureTimestamp: report.digitalSignatureTimestamp || report.createdAt,
    weighingTestPassed: report.weighingTestPassed,
    eccentricityTestPassed: report.eccentricityTestPassed,
    repeatabilityTestPassed: report.repeatabilityTestPassed,
  });
});

// Metrological explanation generator (deterministic fallback when offline or when Gemini service experiences temporary high demand / 503)
function generateDeterministicExplanation(
  question: string,
  reportData: OIMLTestReport,
  language: string,
  temporaryNotice?: string
): string {
  const isPass = reportData.overallVerdict === 'PASS';
  const unit = reportData.instrument.unit || 'kg';
  const qLower = (question || '').toLowerCase();

  // Find worst / highest error in weighing test
  let maxWeighingErr = 0;
  let maxWeighingPoint: any = null;
  reportData.weighingTest?.forEach((p) => {
    const errIncAbs = Math.abs(p.errorIncreasing);
    const errDecAbs = Math.abs(p.errorDecreasing);
    const localMax = Math.max(errIncAbs, errDecAbs);
    if (localMax > maxWeighingErr) {
      maxWeighingErr = localMax;
      maxWeighingPoint = p;
    }
  });

  // Find failed corners
  const failedCorners = reportData.eccentricityTest?.filter((e) => !e.pass) || [];
  const failedWeighingPoints = reportData.weighingTest?.filter((w) => !w.passOverall) || [];
  const repeatabilityFailed = !reportData.repeatabilityTestPassed;

  let text = '';

  if (language === 'hi') {
    // ---------------- HINDI RESPONSE ----------------
    if (qLower.includes('fail') || qLower.includes('point') || qLower.includes('kahan') || qLower.includes('kis')) {
      if (isPass) {
        text = `✅ **कोई विफलता (Failure) नहीं मिली**:\nयह तोलन यंत्र (${reportData.instrument.manufacturer} ${reportData.instrument.model}, Class ${reportData.instrument.accuracyClass}) सभी तीनों OIML R-76 परीक्षणों में उत्तीर्ण (PASS) हुआ है। किसी भी लोड पॉइंट पर एरर MPE सीमा से अधिक नहीं पाया गया।`;
      } else {
        text = `❌ **विफलता विश्लेषण (Failure Diagnosis & Exact Points)**:\n\n`;
        if (failedCorners.length > 0) {
          text += `1. **एक्सेन्ट्रिसिटी / कॉर्नर टेस्ट विफलता**:\n`;
          failedCorners.forEach((c) => {
            text += `   - **${c.position}**: लागू लोड = ${c.appliedLoad} ${unit}, रीडिंग = ${c.indicatedValue} ${unit}, एरर = ${c.error > 0 ? '+' : ''}${c.error} ${unit} (स्वीकार्य सीमा MPE: ±${c.mpe} ${unit})।\n`;
          });
          text += `   - अधिकतम कॉर्नर अंतर: ${reportData.eccentricityMaxDiff} ${unit} (स्वीकार्य सीमा: ${failedCorners[0]?.mpe || 'N/A'} ${unit})।\n\n`;
        }
        if (failedWeighingPoints.length > 0) {
          text += `2. **वेइंग परफॉरमेंस टेस्ट विफलता**:\n`;
          failedWeighingPoints.forEach((w) => {
            text += `   - लोड ${w.nominalLoad} ${unit} पर: बढ़त एरर = ${w.errorIncreasing > 0 ? '+' : ''}${w.errorIncreasing} ${unit}, घटत एरर = ${w.errorDecreasing > 0 ? '+' : ''}${w.errorDecreasing} ${unit} (MPE: ±${w.mpe} ${unit})।\n`;
          });
          text += `\n`;
        }
        if (repeatabilityFailed) {
          text += `3. **रिपीटेबिलिटी टेस्ट विफलता**:\n   - 50% Max लोड (${reportData.repeatabilityTest?.appliedLoad} ${unit}) पर रीडिंग्स का रेंज अंतर ${reportData.repeatabilityTest?.rangeDifference} ${unit} है, जो MPE (±${reportData.repeatabilityTest?.mpe} ${unit}) से अधिक है।\n\n`;
        }
        text += `🔧 **सुझाव (Remedy)**: संबंधित कॉर्नर के नीचे मैकेनिकल स्टॉप्स चेक करें और लोड सेल समिंग बोर्ड पर ट्रिम पोटेंशियोमीटर (trim resistor) को री-एडजस्ट करें।`;
      }
    } else if (qLower.includes('adjust') || qLower.includes('calibrat') || qLower.includes('sudhar') || qLower.includes('theek')) {
      text = `🔧 **अनुशंसित कैलिब्रेशन एवं मैकेनिकल सुधार**:\n\n` +
        `1. **लेवलिंग (Leveling)**: उपकरण के स्पिरिट बबल लेवल (spirit level indicator) को घुमावदार पायों (leveling feet) की सहायता से केंद्र में सेट करें।\n` +
        `2. **कॉर्नर ट्रिमिंग (Corner Trimming)**: यदि किसी कोने (जैसे बैक-राइट या फ्रंट-लेफ्ट) पर असमान वजन आ रहा है, तो लोड सेल समिंग जंक्शन बॉक्स में उस चैनल का पोटेंशियोमीटर एडजस्ट करें या पैन माउंटिंग स्क्रू का टॉर्क चेक करें।\n` +
        `3. **स्पैन कैलिब्रेशन (Span Calibration)**: मानक NPLI ट्रेसिएबल F1/M1 श्रेणी के बॉटों से पूर्ण क्षमता (Max = ${reportData.instrument.maxCapacity} ${unit}) पर स्पैन री-कैलिब्रेट करें।`;
    } else {
      // General summary in Hindi
      text = isPass
        ? `✅ **OIML R-76 तकनीकी सारांश (Technical Summary)**:\n\nउपकरण **${reportData.instrument.manufacturer} ${reportData.instrument.model}** (S/N: ${reportData.instrument.serialNumber}, Class ${reportData.instrument.accuracyClass}) ने OIML Recommendation R-76 और भारतीय विधिक मापविज्ञान नियम 2011 के अनुसार सभी मानकों को पूर्णतः पास कर लिया है।\n\n- **वेइंग टेस्ट**: सभी परीक्षण बिंदुओं पर एरर अनुमेय सीमा (MPE) में हैं।\n- **कॉर्नर टेस्ट**: केंद्र और चारों कोनों का अधिकतम अंतर ${reportData.eccentricityMaxDiff} ${unit} (MPE से कम) है।\n- **रिपीटेबिलिटी**: स्टैंडर्ड डेविएशन = ${reportData.repeatabilityTest?.stdDev || 0} ${unit}।\n\n**अंतिम परिणाम**: वैध (PASS) - मुहर (verification stamp) के लिए स्वीकृत।`
        : `❌ **OIML R-76 विफलता सारांश (Rejection Summary)**:\n\nउपकरण **${reportData.instrument.manufacturer} ${reportData.instrument.model}** OIML R-76 विधिक मापविज्ञान परीक्षण में गैर-अनुरूप (FAIL) पाया गया है।\n\n` +
          (failedCorners.length > 0 ? `• कॉर्नर लोड में विचलन: ${failedCorners.map((c) => c.position).join(', ')} पर MPE का उल्लंघन हुआ।\n` : '') +
          (failedWeighingPoints.length > 0 ? `• वेइंग टेस्ट में विचलन: अधिकतम लोड बिंदुओं पर एरर MPE से अधिक।\n` : '') +
          (repeatabilityFailed ? `• रिपीटेबिलिटी परीक्षण में रीडिंग का अंतर स्वीकार्य सीमा से अधिक।\n` : '') +
          `\n**अंतिम परिणाम**: अस्वीकृत (REJECTED) - उपकरण को सुधार व री-वेरिफिकेशन की आवश्यकता है।`;
    }
  } else if (language === 'hinglish') {
    // ---------------- HINGLISH RESPONSE ----------------
    if (isPass) {
      text = `✅ **OIML Test Report Summary (PASS)**:\n\nYeh weighing machine (${reportData.instrument.manufacturer} ${reportData.instrument.model}) OIML R-76 standards ke mutabik successfully PASS ho chuki hai. Sabhi test points (Weighing, Corner Eccentricity, aur Repeatability) par error MPE (Maximum Permissible Error) limits ke andar hai. Machine stamping aur commercial use ke liye certified hai.`;
    } else {
      text = `❌ **Scale Failure Diagnostics (FAIL)**:\n\nYeh scale OIML R-76 verification mein REJECT hui hai.\n\n`;
      if (failedCorners.length > 0) {
        text += `• **Corner Load (Eccentricity) Issue**: ${failedCorners.map((c) => `${c.position} (Error: ${c.error > 0 ? '+' : ''}${c.error} ${unit}, MPE limit: ±${c.mpe} ${unit})`).join('; ')}.\n`;
      }
      if (failedWeighingPoints.length > 0) {
        text += `• **Weighing Accuracy Issue**: Load points (${failedWeighingPoints.map((w) => `${w.nominalLoad} ${unit}`).join(', ')}) par error tolerance cross kar gaya hai.\n`;
      }
      if (repeatabilityFailed) {
        text += `• **Repeatability Issue**: Repeated load cycles par reading ka difference (Range: ${reportData.repeatabilityTest?.rangeDifference} ${unit}) MPE se zyada paya gaya.\n`;
      }
      text += `\n🔧 **Next Steps / Recommendation**: Leveling bubble check karein aur load cell junction box mein corner resistance trim karke dobara test karein.`;
    }
  } else {
    // ---------------- ENGLISH RESPONSE ----------------
    if (qLower.includes('fail') || qLower.includes('point') || qLower.includes('where') || qLower.includes('which test')) {
      if (isPass) {
        text = `✅ **No Compliance Failures Detected**:\n\nInstrument **${reportData.instrument.manufacturer} ${reportData.instrument.model}** (Accuracy Class ${reportData.instrument.accuracyClass}, Max: ${reportData.instrument.maxCapacity} ${unit}, e: ${reportData.instrument.scaleIntervalE} ${unit}) conforms to all statutory provisions of OIML Recommendation R-76-1:2006 (E).\n\n- **Weighing Performance**: All ${reportData.weighingTest?.length || 0} tested points satisfied $|E| \\le MPE$.\n- **Corner Load (Eccentricity)**: Center and 4 quadrant positions satisfied error tolerance with Max Difference = ${reportData.eccentricityMaxDiff} ${unit}.\n- **Repeatability**: Range spread = ${reportData.repeatabilityTest?.rangeDifference ?? 0} ${unit} (Within limit of ${reportData.repeatabilityTest?.mpe ?? '±1.0e'} ${unit}).`;
      } else {
        text = `❌ **Identified Failure Points & Diagnostic Breakdown**:\n\nUnder OIML R-76 Table 6 compliance rules, the following non-conformities were flagged:\n\n`;
        if (failedCorners.length > 0) {
          text += `1. **Eccentricity / Corner Loading Non-Conformance**:\n`;
          failedCorners.forEach((c) => {
            text += `   - **Position**: ${c.position}\n   - **Applied Load**: ${c.appliedLoad} ${unit}\n   - **Indicated Reading**: ${c.indicatedValue} ${unit}\n   - **Observed Error**: ${c.error > 0 ? '+' : ''}${c.error} ${unit} (Permissible MPE: ±${c.mpe} ${unit}) $\\rightarrow$ **EXCEEDED BY ${Math.abs(c.error) - c.mpe} ${unit}**\n`;
          });
          text += `   - Maximum Corner Difference: ${reportData.eccentricityMaxDiff} ${unit} (Limit: ${failedCorners[0]?.mpe} ${unit})\n\n`;
        }
        if (failedWeighingPoints.length > 0) {
          text += `2. **Weighing Performance Non-Conformance**:\n`;
          failedWeighingPoints.forEach((w) => {
            text += `   - **Nominal Load**: ${w.nominalLoad} ${unit}\n   - **Increasing Error**: ${w.errorIncreasing > 0 ? '+' : ''}${w.errorIncreasing} ${unit} | **Decreasing Error**: ${w.errorDecreasing > 0 ? '+' : ''}${w.errorDecreasing} ${unit} (MPE: ±${w.mpe} ${unit})\n`;
          });
          text += `\n`;
        }
        if (repeatabilityFailed) {
          text += `3. **Repeatability Failure**:\n   - Applied Load: ${reportData.repeatabilityTest?.appliedLoad} ${unit}\n   - Range Difference $(Max - Min)$: ${reportData.repeatabilityTest?.rangeDifference} ${unit} > Permissible $|MPE|$ (${reportData.repeatabilityTest?.mpe} ${unit})\n\n`;
        }
        text += `🔧 **Recommended Corrective Action**: Re-level the spirit bubble, check mechanical stops under the pan platter, adjust corner trim potentiometers on the load cell summing PCB, and perform a full zero/span re-calibration.`;
      }
    } else if (qLower.includes('highest error') || qLower.includes('max error') || qLower.includes('maximum')) {
      text = `📊 **Maximum Measurement Error Analysis**:\n\n` +
        (maxWeighingPoint
          ? `- **Weighing Test Peak Error**: Load = ${maxWeighingPoint.nominalLoad} ${unit}, Error = ${maxWeighingErr} ${unit} (Permissible MPE: ±${maxWeighingPoint.mpe} ${unit}).\n`
          : '') +
        `- **Eccentricity Max Corner Difference**: ${reportData.eccentricityMaxDiff} ${unit}.\n` +
        `- **Repeatability Range Difference**: ${reportData.repeatabilityTest?.rangeDifference || 0} ${unit} (Std Dev: ${reportData.repeatabilityTest?.stdDev || 0} ${unit}).\n\n` +
        `Overall Compliance Verdict: **${reportData.overallVerdict}**.`;
    } else if (qLower.includes('adjust') || qLower.includes('calibrat') || qLower.includes('correct')) {
      text = `🔧 **Metrological Adjustment & Maintenance Procedures**:\n\n` +
        `1. **Mechanical Leveling**: Verify that the circular spirit level indicator is centered. An unlevel platter introduces cosine torque error on strain gauge sensors.\n` +
        `2. **Corner Load Balancing**: For corner error discrepancies (e.g. Back-Right), inspect platter support pins for friction against the enclosure, and adjust the corner trim resistor in the junction box to balance bridge sensitivity.\n` +
        `3. **Span Calibration**: Perform multi-point span calibration using calibrated standard test weights compliant with OIML R-111 (Class F1/M1).\n` +
        `4. **Zero-Tracking Check**: Verify automatic zero-setting and zero-tracking device (OIML R-76 clause 4.5.3) is within $\\le 0.5 d/s$.`;
    } else {
      // General summary in English
      text = isPass
        ? `✅ **Technical Metrology Summary (OIML R-76)**:\n\nInstrument **${reportData.instrument.manufacturer} ${reportData.instrument.model}** (S/N: ${reportData.instrument.serialNumber}, Class ${reportData.instrument.accuracyClass}) **PASSED** all statutory evaluation tests conducted at ${reportData.environment.labName}.\n\n- **Weighing Accuracy**: All ${reportData.weighingTest?.length || 0} loading and unloading points complied with MPE step-envelope limits.\n- **Corner Load (Eccentricity)**: Evaluated at center and 4 corners (${reportData.eccentricityTest?.[0]?.appliedLoad || '1/3 Max'} ${unit}). Maximum corner difference is ${reportData.eccentricityMaxDiff} ${unit}, well within legal tolerance.\n- **Repeatability**: 5 consecutive cycles at 50% capacity showed consistent readings with range difference of ${reportData.repeatabilityTest?.rangeDifference ?? 0} ${unit}.\n\n**Statutory Recommendation**: Approved for official stamping and verification certificate issuance.`
        : `❌ **Metrological Non-Conformance Summary (OIML R-76)**:\n\nInstrument **${reportData.instrument.manufacturer} ${reportData.instrument.model}** has been **REJECTED (FAIL)** due to errors exceeding statutory MPE envelopes.\n\n` +
          (failedCorners.length > 0 ? `• **Corner Load Failure**: Detected on ${failedCorners.map((c) => c.position).join(', ')}.\n` : '') +
          (failedWeighingPoints.length > 0 ? `• **Weighing Accuracy Failure**: High-capacity loading exceeded permissible error.\n` : '') +
          (repeatabilityFailed ? `• **Repeatability Failure**: Excessive reading scatter under identical load cycles.\n` : '') +
          `\n**Statutory Recommendation**: Issue Rejection Notice. Machine requires recalibration and mechanical maintenance before re-submission.`;
    }
  }

  if (temporaryNotice) {
    return `${temporaryNotice}\n\n${text}`;
  }
  return text;
}

// Helper to run promise with strict timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('REQUEST_TIMEOUT'));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Helper to call Gemini with retry, timeout, and fallback across supported flash models
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  userPrompt: string,
  systemInstruction: string
): Promise<{ text: string; model: string }> {
  // Fast flash models in order of priority
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (const model of models) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      // Bound each remote call to 5 seconds so user is never stalled by upstream service spikes
      const response = await withTimeout(generatePromise, 5000);

      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch {
      // Upstream service spike (503), rate limit (429), or timeout: gracefully continue to next model
      continue;
    }
  }

  throw new Error('MODELS_UNAVAILABLE');
}

// AI Assistant / Explainability Layer endpoint
app.post('/api/gemini/explain', async (req, res) => {
  const { question, reportData, language = 'en' } = req.body;

  if (!reportData) {
    return res.status(400).json({ error: 'reportData is required for metrological explanation.' });
  }

  const ai = getGeminiClient();

  const contextDataStr = JSON.stringify(
    {
      reportId: reportData.id,
      verdict: reportData.overallVerdict,
      instrument: reportData.instrument,
      environment: reportData.environment,
      weighingTestSummary: {
        passed: reportData.weighingTestPassed,
        points: reportData.weighingTest?.map((p: any) => ({
          load: p.nominalLoad,
          errInc: p.errorIncreasing,
          errDec: p.errorDecreasing,
          mpe: p.mpe,
          pass: p.passOverall,
        })),
      },
      eccentricitySummary: {
        passed: reportData.eccentricityTestPassed,
        maxDiff: reportData.eccentricityMaxDiff,
        points: reportData.eccentricityTest?.map((p: any) => ({
          pos: p.position,
          load: p.appliedLoad,
          indicated: p.indicatedValue,
          err: p.error,
          mpe: p.mpe,
          pass: p.pass,
        })),
      },
      repeatabilitySummary: {
        passed: reportData.repeatabilityTestPassed,
        appliedLoad: reportData.repeatabilityTest?.appliedLoad,
        rangeDiff: reportData.repeatabilityTest?.rangeDifference,
        mpe: reportData.repeatabilityTest?.mpe,
        stdDev: reportData.repeatabilityTest?.stdDev,
      },
    },
    null,
    2
  );

  const systemInstruction = `You are the WeighSure AI Metrology Assistant, built for Indian Legal Metrology Officers (DoCA) and testing technicians evaluating Non-Automatic Weighing Instruments (NAWIs) according to OIML Recommendation R-76.

CRITICAL RULES:
1. YOU ARE NOT THE COMPLIANCE DECISION-MAKER. The mathematical engine has already calculated the deterministic Errors, MPE, and Pass/Fail verdicts. Your job is ONLY to explain, summarize, and diagnose observations clearly and traceably based on the provided report data.
2. Read the actual stored report data carefully. Never invent or guess numbers.
3. If the user asks in Hindi or Hinglish or requests Hindi, provide the explanation in Hindi/Hinglish (Devanagari or Romanized Hindi as appropriate) so technicians in Indian labs can immediately understand.
4. Keep explanations clear, technical yet easy to understand for testing technicians and hackathon evaluators. Always mention specific points where discrepancies or errors occurred (e.g. Back-Right corner, 15 kg weighing point, etc.).
5. If information is missing or not tested, state that clearly without guessing.`;

  const userPrompt = `Here is the verified OIML R-76 Test Report Data:
\`\`\`json
${contextDataStr}
\`\`\`

User Question / Task:
"${question || 'Provide a concise technical summary of this test report, explaining why it passed or failed and detailing any critical error points.'}"

Requested Language Mode: ${language}`;

  if (!ai) {
    // Client-side fallback if no GEMINI_API_KEY is configured
    const explanation = generateDeterministicExplanation(question, reportData, language);
    return res.json({
      text: explanation,
      source: 'deterministic_engine',
    });
  }

  try {
    const result = await callGeminiWithFallback(ai, userPrompt, systemInstruction);
    res.json({
      text: result.text,
      source: 'gemini_api',
      modelUsed: result.model,
    });
  } catch {
    // Seamless fallback to deterministic engine without unhandled exceptions or noisy error logs
    const deterministicText = generateDeterministicExplanation(question, reportData, language);
    res.json({
      text: deterministicText,
      source: 'deterministic_engine',
    });
  }
});

// ----------------------------------------------------
// VITE & STATIC SERVING
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeighSure Server running on port ${PORT}`);
  });
}

start();
