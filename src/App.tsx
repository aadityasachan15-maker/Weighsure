import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileCheck2,
  Bot,
  Layers,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { RegistrationModule } from './components/RegistrationModule';
import { TestForms } from './components/TestForms';
import { ReportView } from './components/ReportView';
import { AiAssistant } from './components/AiAssistant';
import { RepositoryView } from './components/RepositoryView';
import { StandardsReference } from './components/StandardsReference';
import { VerificationModal } from './components/VerificationModal';
import {
  AccuracyClass,
  EccentricityPoint,
  InstrumentSpecs,
  LabEnvironment,
  OIMLTestReport,
  RepeatabilityTestResult,
  WeighingPoint,
} from './types/oiml';
import {
  SAMPLE_REPORTS,
  calculateMPE,
  evaluateEccentricityPoints,
  evaluateOverallReportStatus,
  evaluateRepeatabilityTest,
  evaluateWeighingPoint,
  generateRecommendedLoads,
  recalculateReportWithVerificationType,
} from './utils/oimlEngine';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'wizard' | 'report' | 'ai' | 'repository' | 'standards'>('wizard');
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  // Active Report State (defaults to pre-populated Passing Retail Scale for seamless demo)
  const [currentReport, setCurrentReport] = useState<OIMLTestReport>(SAMPLE_REPORTS[0]);
  const [reportsList, setReportsList] = useState<OIMLTestReport[]>(SAMPLE_REPORTS);
  const [verificationModalId, setVerificationModalId] = useState<string | null>(null);

  // Fetch all reports from server on mount
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverReports) => {
        if (Array.isArray(serverReports) && serverReports.length > 0) {
          setReportsList(serverReports);
        }
      })
      .catch(() => {
        // Local in-memory fallback
      });
  }, []);

  // Update overall report status whenever child test points change
  const updateReportData = (partial: Partial<OIMLTestReport>) => {
    setCurrentReport((prev) => {
      const updated = { ...prev, ...partial };
      const status = evaluateOverallReportStatus(updated);
      const overall = status.overallVerdict;

      const cleanId = updated.id.replace(/[^a-zA-Z0-9]/g, '');
      let verificationHash = updated.verificationHash;
      let notes = updated.notes;

      if (overall === 'PASS') {
        if (!verificationHash || verificationHash.includes('FAIL')) {
          verificationHash = `SHA256-OIML76-CERTIFIED-${cleanId}`;
        }
        if (!notes || notes.startsWith('REJECTED')) {
          notes = `Verified compliant with OIML R-76 (${updated.verificationType === 'in_service' ? 'In-Service, Rule 14' : 'Initial Verification'}) requirements. All test tolerances satisfied.`;
        }
      } else {
        if (!verificationHash || verificationHash.includes('CERTIFIED')) {
          verificationHash = `SHA256-FAIL-NONCONFORMING-${cleanId}`;
        }
        notes = `REJECTED: Instrument fails Maximum Permissible Error (MPE) tolerances under OIML R-76 in: ${status.failingModules.join(', ')}.`;
      }

      const finalReport: OIMLTestReport = {
        ...updated,
        weighingTestPassed: status.weighingPassed,
        eccentricityTestPassed: status.eccentricityPassed,
        repeatabilityTestPassed: status.repeatabilityPassed,
        overallVerdict: overall,
        verificationHash,
        notes,
      };

      // Real-time synchronization with National Repository list
      setReportsList((list) =>
        list.map((r) => (r.id === finalReport.id ? finalReport : r))
      );

      // Background persistence so /api/verify/:id and /api/reports reflect updates
      fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalReport),
      }).catch(() => {});

      return finalReport;
    });
  };

  // ----------------------------------------------------------------
  // PRESET DEMO LOADERS
  // ----------------------------------------------------------------
  const handleLoadPreset = (index: number) => {
    if (SAMPLE_REPORTS[index]) {
      const preset = JSON.parse(JSON.stringify(SAMPLE_REPORTS[index]));
      setCurrentReport(preset);
      setReportsList((list) =>
        list.map((r) => (r.id === preset.id ? preset : r))
      );
      setWizardStep(1);
      setActiveTab('wizard');
    }
  };

  const handleNewTest = () => {
    const newId = `RRSL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const blankSpecs: InstrumentSpecs = {
      manufacturer: '',
      model: '',
      serialNumber: '',
      accuracyClass: AccuracyClass.CLASS_III,
      maxCapacity: 30,
      minCapacity: 0.1,
      scaleIntervalE: 0.005,
      scaleIntervalD: 0.005,
      unit: 'kg',
      deviceType: 'Electronic Retail Counter Scale',
    };

    const blankEnv: LabEnvironment = {
      temperature: 23.0,
      humidity: 50.0,
      pressure: 1013.25,
      testingDate: new Date().toISOString().split('T')[0],
      officerName: 'S. K. Sharma',
      officerId: 'LM-DOCA-IND-8841',
      labName: 'Regional Reference Standards Laboratory (RRSL)',
      labLocation: 'Faridabad, Haryana',
      standardWeightsCertNo: 'NPLI/WEIGHTS/2026/0419',
    };

    // Auto-generate test points for 30kg / 5g
    const loads = generateRecommendedLoads(blankSpecs);
    const initialWeighing: WeighingPoint[] = loads.map((l) =>
      evaluateWeighingPoint(l, l, l, blankSpecs, false)
    );

    const cornerLoad = 10;
    const cornerPositions = [
      'Center (1)',
      'Front-Left (2)',
      'Back-Left (3)',
      'Back-Right (4)',
      'Front-Right (5)',
    ] as const;
    const initialCorners = evaluateEccentricityPoints(
      cornerPositions.map((p) => ({ position: p, indicated: cornerLoad })),
      cornerLoad,
      blankSpecs,
      false
    );

    const initialRep = evaluateRepeatabilityTest(
      [1, 2, 3, 4, 5].map((i) => ({ runNumber: i, indicated: 15 })),
      15,
      blankSpecs,
      false
    );

    const blankReport: OIMLTestReport = {
      id: newId,
      createdAt: new Date().toISOString(),
      verificationType: 'initial',
      instrument: blankSpecs,
      environment: blankEnv,
      weighingTest: initialWeighing,
      weighingTestPassed: true,
      eccentricityTest: initialCorners.points,
      eccentricityTestPassed: true,
      eccentricityMaxDiff: 0,
      repeatabilityTest: initialRep,
      repeatabilityTestPassed: true,
      overallVerdict: 'PASS',
      verificationHash: `SHA256-${newId}-PENDING`,
    };

    setCurrentReport(blankReport);
    setReportsList((prev) => [blankReport, ...prev]);
    setWizardStep(1);
    setActiveTab('wizard');
  };

  // ----------------------------------------------------------------
  // REPOSITORY OPERATIONS
  // ----------------------------------------------------------------
  const handleSaveToRepository = async () => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentReport),
      });
      if (res.ok) {
        const data = await res.json();
        const savedReport: OIMLTestReport = (data && data.report) ? data.report : data;
        setReportsList((prev) => {
          const exists = prev.some((r) => r.id === savedReport.id);
          if (exists) {
            return prev.map((r) => (r.id === savedReport.id ? savedReport : r));
          }
          return [savedReport, ...prev];
        });
      }
    } catch {
      // Offline fallback
      setReportsList((prev) => {
        const exists = prev.some((r) => r.id === currentReport.id);
        if (exists) {
          return prev.map((r) => (r.id === currentReport.id ? currentReport : r));
        }
        return [currentReport, ...prev];
      });
    }
  };

  const handleEditReport = (rep: OIMLTestReport) => {
    setCurrentReport(rep);
    setWizardStep(2);
    setActiveTab('wizard');
  };

  const handleResetRepository = async () => {
    try {
      const res = await fetch('/api/reports/reset', { method: 'POST' });
      if (res.ok) {
        const resetList: OIMLTestReport[] = await res.json();
        setReportsList(resetList);
        const match = resetList.find((r) => r.id === currentReport.id);
        if (match) setCurrentReport(match);
        return;
      }
    } catch {
      // fallback
    }
    const defaults = JSON.parse(JSON.stringify(SAMPLE_REPORTS));
    setReportsList(defaults);
    setCurrentReport(defaults[0]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Header & Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadPreset={handleLoadPreset}
        onNewTest={handleNewTest}
        reportCount={reportsList.length}
        currentVerdict={currentReport.overallVerdict}
        currentReportId={currentReport.id}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step Indicator Progress Bar (Shown only when in wizard mode) */}
        {activeTab === 'wizard' && (
          <div className="no-print mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              {/* Step 1 Pill */}
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`flex items-center gap-3 text-left transition-all ${
                  wizardStep === 1 ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    wizardStep === 1
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  1
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                    Step 1
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Instrument Registration &amp; Lab Environment
                  </span>
                </div>
              </button>

              <div className="hidden sm:block flex-1 mx-6 h-0.5 bg-slate-200" />

              {/* Step 2 & 3 Pill */}
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className={`flex items-center gap-3 text-left transition-all ${
                  wizardStep === 2 ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    wizardStep === 2
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  2 &amp; 3
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                    Step 2 &amp; 3
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    OIML Math Engine &amp; 3 Test Forms
                  </span>
                </div>
              </button>

              <div className="hidden sm:block flex-1 mx-6 h-0.5 bg-slate-200" />

              {/* Step 4 Pill */}
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className="flex items-center gap-3 text-left opacity-60 hover:opacity-100 transition-all"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-700">
                  4
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                    Step 4
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Official OIML Report &amp; QR
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Test Entry Wizard */}
        {activeTab === 'wizard' && (
          <div>
            {wizardStep === 1 ? (
              <RegistrationModule
                instrument={currentReport.instrument}
                environment={currentReport.environment}
                verificationType={currentReport.verificationType}
                onUpdateInstrument={(specs) => updateReportData({ instrument: specs })}
                onUpdateEnvironment={(env) => updateReportData({ environment: env })}
                onUpdateVerificationType={(vType) =>
                  setCurrentReport((prev) => recalculateReportWithVerificationType(prev, vType))
                }
                onProceedToTests={() => setWizardStep(2)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between no-print">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Instrument Profile (Step 1)</span>
                  </button>
                  <span className="text-xs text-slate-500 font-mono">
                    Evaluating: {currentReport.instrument.manufacturer} {currentReport.instrument.model} (
                    {currentReport.instrument.accuracyClass})
                  </span>
                </div>

                <TestForms
                  instrument={currentReport.instrument}
                  verificationType={currentReport.verificationType}
                  weighingTest={currentReport.weighingTest}
                  eccentricityTest={currentReport.eccentricityTest}
                  repeatabilityTest={currentReport.repeatabilityTest}
                  onUpdateWeighingTest={(pts) => updateReportData({ weighingTest: pts })}
                  onUpdateEccentricityTest={(pts, maxDiff, passed) =>
                    updateReportData({
                      eccentricityTest: pts,
                      eccentricityMaxDiff: maxDiff,
                      eccentricityTestPassed: passed,
                    })
                  }
                  onUpdateRepeatabilityTest={(repResult) =>
                    updateReportData({
                      repeatabilityTest: repResult,
                      repeatabilityTestPassed: repResult.pass,
                    })
                  }
                  onProceedToReport={() => setActiveTab('report')}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Standardized Report View & QR */}
        {activeTab === 'report' && (
          <ReportView
            report={currentReport}
            onOpenVerificationModal={(id) => setVerificationModalId(id)}
            onOpenAiAssistant={() => setActiveTab('ai')}
            onSaveToRepository={handleSaveToRepository}
            onEditInWizard={() => {
              setWizardStep(2);
              setActiveTab('wizard');
            }}
          />
        )}

        {/* Tab 3: AI Assistant */}
        {activeTab === 'ai' && <AiAssistant report={currentReport} />}

        {/* Tab 4: National Repository */}
        {activeTab === 'repository' && (
          <RepositoryView
            reports={reportsList}
            onSelectReport={(rep) => {
              setCurrentReport(rep);
              setActiveTab('report');
            }}
            onEditReport={handleEditReport}
            onResetRepository={handleResetRepository}
            onOpenVerificationModal={(id) => setVerificationModalId(id)}
          />
        )}

        {/* Tab 5: OIML Standards Reference */}
        {activeTab === 'standards' && <StandardsReference />}
      </main>

      {/* Public Digital Verification Modal */}
      {verificationModalId && (
        <VerificationModal
          reportId={verificationModalId}
          report={currentReport}
          onClose={() => setVerificationModalId(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 px-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">WeighSure OIML R-76 NAWI Verification Suite</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Smart India Hackathon (SIH-2026) Problem Statement 26035</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Legal Metrology Act, 2009</span>
            <span>•</span>
            <span>DoCA / RRSL Certified Architecture</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">100% Deterministic OIML Core</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
