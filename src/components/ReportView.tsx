import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck2,
  QrCode as QrCodeIcon,
  Upload,
  Bot,
  Building2,
  ExternalLink,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { OIMLTestReport } from '../types/oiml';

interface ReportViewProps {
  report: OIMLTestReport;
  onOpenVerificationModal: (reportId: string) => void;
  onOpenAiAssistant: () => void;
  onSaveToRepository: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  onOpenVerificationModal,
  onOpenAiAssistant,
  onSaveToRepository,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<string[]>([
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
  ]);

  const isPass = report.overallVerdict === 'PASS';

  // Construct Verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://legalmetrology.gov.in';
  const verifyUrl = `${origin}/verify?report_id=${report.id}`;

  useEffect(() => {
    QRCode.toDataURL(
      verifyUrl,
      {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [verifyUrl, report.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSaveToRepository();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachments((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // SVG Chart Calculation for Weighing Performance Error Curve
  const maxCap = report.instrument.maxCapacity || 1;
  const maxErrorMagnitude = Math.max(
    ...report.weighingTest.map((p) => Math.max(Math.abs(p.errorIncreasing), Math.abs(p.errorDecreasing), p.mpe)),
    0.01
  );

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 4: Standardized OIML R-76 Test Report & QR Verification
            </h2>
            <p className="text-xs text-slate-500">
              Official legal certificate ready for Model Approval, Stamping, and Digital Verification.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="print-report-btn"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            type="button"
            id="save-repo-btn"
            onClick={handleSave}
            className={`px-3.5 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{saveSuccess ? '✓ Saved to National Repository' : 'Save to Repository'}</span>
          </button>

          <button
            type="button"
            id="open-verify-modal-btn"
            onClick={() => onOpenVerificationModal(report.id)}
            className="px-3.5 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Simulate QR Verification Scan</span>
          </button>

          <button
            type="button"
            id="ask-ai-report-btn"
            onClick={onOpenAiAssistant}
            className="px-3.5 py-2 bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Ask AI Assistant to Explain</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* OFFICIAL OIML R-76 STANDARDIZED TEST CERTIFICATE (Printable) */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="printable-report"
        className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-slate-300 shadow-sm max-w-5xl mx-auto text-slate-900 print:border-none print:shadow-none print:p-2"
      >
        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-double border-slate-700 p-6 sm:p-8 rounded-xl relative">
          {/* Official Emblem & Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            {/* Ashoka Emblem Representation */}
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-amber-400 flex flex-col items-center justify-center font-bold shadow-xs">
                <span className="text-xl leading-none">🇮🇳</span>
                <span className="text-[7px] tracking-tighter uppercase font-serif text-slate-200 mt-0.5">
                  सत्यमेव जयते
                </span>
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-widest font-serif font-bold text-slate-700">
              GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
            </h3>
            <h4 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wide mt-0.5">
              DEPARTMENT OF CONSUMER AFFAIRS (DoCA) — LEGAL METROLOGY DIVISION
            </h4>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              {report.environment.labName} • {report.environment.labLocation}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300">
              <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-slate-900 font-serif">
                TEST REPORT FOR PATTERN EVALUATION OF NON-AUTOMATIC WEIGHING INSTRUMENT (NAWI)
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 font-mono">
                Issued in accordance with OIML Recommendation R 76-1 (Edition 2006) &amp; Legal Metrology Act, 2009
              </p>
            </div>
          </div>

          {/* Certificate Metadata Top Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Report / Certificate ID:</span>
              <span className="font-mono font-bold text-sm text-indigo-950">{report.id}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Testing Date:</span>
              <span className="font-bold text-slate-900">{report.environment.testingDate}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Evaluation Protocol:</span>
              <span className="font-bold text-slate-900 capitalize">
                {report.verificationType === 'initial' ? 'Initial Type Approval (1.0× MPE)' : 'In-Service Stamping (2.0× MPE)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Reference Weights Cert:</span>
              <span className="font-mono text-slate-800 text-[11px] font-medium">
                {report.environment.standardWeightsCertNo}
              </span>
            </div>
          </div>

          {/* SECTION 1: INSTRUMENT SPECIFICATIONS & LAB CONDITIONS */}
          <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Machine Specs */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>1. Instrument Technical Description</span>
                <span className="font-mono font-semibold text-indigo-700">{report.instrument.accuracyClass}</span>
              </h5>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-500">Manufacturer:</span>{' '}
                  <strong className="text-slate-900">{report.instrument.manufacturer}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Model:</span>{' '}
                  <strong className="text-slate-900">{report.instrument.model}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Serial Number:</span>{' '}
                  <strong className="font-mono text-slate-900">{report.instrument.serialNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>{' '}
                  <strong className="text-slate-900">{report.instrument.deviceType}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Max Capacity (Max):</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {report.instrument.maxCapacity} {report.instrument.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Min Capacity (Min):</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {report.instrument.minCapacity} {report.instrument.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Verification Interval (e):</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {report.instrument.scaleIntervalE} {report.instrument.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Actual Scale Interval (d):</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {report.instrument.scaleIntervalD} {report.instrument.unit}
                  </strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Total Scale Intervals (n = Max/e):</span>{' '}
                  <strong className="font-mono text-indigo-900 font-bold">
                    {Math.round(report.instrument.maxCapacity / report.instrument.scaleIntervalE).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right: Lab Environment & Officer */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>2. Laboratory Ambient Conditions &amp; Metrologist</span>
                <span className="text-emerald-700 font-semibold">Standard Controlled Environment</span>
              </h5>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-500">Ambient Temperature:</span>{' '}
                  <strong className="font-mono text-slate-900">{report.environment.temperature} °C</strong>
                </div>
                <div>
                  <span className="text-slate-500">Relative Humidity:</span>{' '}
                  <strong className="font-mono text-slate-900">{report.environment.humidity} %RH</strong>
                </div>
                <div>
                  <span className="text-slate-500">Atmospheric Pressure:</span>{' '}
                  <strong className="font-mono text-slate-900">{report.environment.pressure || 1013.2} hPa</strong>
                </div>
                <div>
                  <span className="text-slate-500">Testing Date:</span>{' '}
                  <strong className="text-slate-900">{report.environment.testingDate}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Evaluating Officer:</span>{' '}
                  <strong className="text-slate-900">{report.environment.officerName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Officer Registration / ID:</span>{' '}
                  <strong className="font-mono text-slate-900">{report.environment.officerId}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Accredited Laboratory:</span>{' '}
                  <strong className="text-slate-900">
                    {report.environment.labName}, {report.environment.labLocation}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TEST 1 - WEIGHING PERFORMANCE TEST TABLE */}
          <div className="my-5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Test 1: Weighing Performance (OIML R-76 clause A.4.4)
              </h5>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  report.weighingTestPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {report.weighingTestPassed ? 'PASS' : 'FAIL'}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-sm">
              <table className="w-full text-left text-[11px] border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-1.5 px-2 border-r border-slate-300">Load (L)</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Indicated Inc (I↑)</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Indicated Dec (I↓)</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Error Inc (E↑)</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Error Dec (E↓)</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Hysteresis</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Permissible MPE</th>
                    <th className="py-1.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.weighingTest.map((p, idx) => (
                    <tr key={idx} className={!p.passOverall ? 'bg-rose-50' : ''}>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300 font-medium">
                        {p.nominalLoad} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300">
                        {p.indicatedIncreasing} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300">
                        {p.indicatedDecreasing} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300">
                        <span className={p.passIncreasing ? 'text-slate-800' : 'text-rose-700 font-bold'}>
                          {p.errorIncreasing > 0 ? `+${p.errorIncreasing}` : p.errorIncreasing}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300">
                        <span className={p.passDecreasing ? 'text-slate-800' : 'text-rose-700 font-bold'}>
                          {p.errorDecreasing > 0 ? `+${p.errorDecreasing}` : p.errorDecreasing}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300">
                        {p.hysteresis} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-300 font-semibold text-slate-900">
                        ±{p.mpe} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold">
                        {p.passOverall ? (
                          <span className="text-emerald-700">PASS</span>
                        ) : (
                          <span className="text-rose-700">FAIL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual SVG Chart: Error Curve vs MPE Envelope */}
          <div className="my-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Metrological Error Curve vs. OIML R-76 MPE Tolerance Envelope
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-blue-700 font-medium">
                  <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span> Error Increasing (E↑)
                </span>
                <span className="flex items-center gap-1 text-purple-700 font-medium">
                  <span className="w-2.5 h-0.5 bg-purple-600 inline-block"></span> Error Decreasing (E↓)
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-rose-600 inline-block"></span> ±MPE Limit
                </span>
              </div>
            </div>

            {/* Simple Responsive SVG Chart */}
            <div className="w-full h-32 bg-white rounded border border-slate-200 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* Zero Center Line */}
                <line x1="40" y1="60" x2="490" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <text x="5" y="63" fontSize="8" fill="#64748b" fontFamily="monospace">
                  0.0
                </text>

                {/* Positive MPE Line & Negative MPE Line */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points={report.weighingTest
                    .map((p) => {
                      const x = 40 + (p.nominalLoad / maxCap) * 440;
                      const y = 60 - (p.mpe / maxErrorMagnitude) * 45;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points={report.weighingTest
                    .map((p) => {
                      const x = 40 + (p.nominalLoad / maxCap) * 440;
                      const y = 60 + (p.mpe / maxErrorMagnitude) * 45;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Error Increasing Curve */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  points={report.weighingTest
                    .map((p) => {
                      const x = 40 + (p.nominalLoad / maxCap) * 440;
                      const y = 60 - (p.errorIncreasing / maxErrorMagnitude) * 45;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Points for Error Inc */}
                {report.weighingTest.map((p, i) => {
                  const x = 40 + (p.nominalLoad / maxCap) * 440;
                  const y = 60 - (p.errorIncreasing / maxErrorMagnitude) * 45;
                  return (
                    <circle
                      key={`inc-${i}`}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={p.passIncreasing ? '#2563eb' : '#dc2626'}
                    />
                  );
                })}

                {/* Error Decreasing Curve */}
                <polyline
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  strokeDasharray="3 1"
                  points={report.weighingTest
                    .map((p) => {
                      const x = 40 + (p.nominalLoad / maxCap) * 440;
                      const y = 60 - (p.errorDecreasing / maxErrorMagnitude) * 45;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          </div>

          {/* SECTION 3: TEST 2 - ECCENTRICITY / CORNER LOAD TEST */}
          <div className="my-6 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Test 2: Eccentricity / Corner Load Test (OIML R-76 clause 3.6.2)
              </h5>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  report.eccentricityTestPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {report.eccentricityTestPassed ? 'PASS' : 'FAIL'}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-sm">
              <table className="w-full text-left text-[11px] border-collapse min-w-[580px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 border-r border-slate-300">Position / Corner</th>
                    <th className="py-2 px-3 border-r border-slate-300">Nominal Load (L)</th>
                    <th className="py-2 px-3 border-r border-slate-300">Indicated Reading (I)</th>
                    <th className="py-2 px-3 border-r border-slate-300">Observed Error (E = I - L)</th>
                    <th className="py-2 px-3 border-r border-slate-300">Permissible MPE</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.eccentricityTest.map((p, idx) => (
                    <tr key={idx} className={!p.pass ? 'bg-rose-50' : 'hover:bg-slate-50/50'}>
                      <td className="py-1.5 px-3 font-medium border-r border-slate-300 text-slate-900">{p.position}</td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300 text-slate-700">
                        {p.appliedLoad} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300 font-medium text-slate-800">
                        {p.indicatedValue} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300 font-bold">
                        <span className={p.pass ? 'text-slate-800' : 'text-rose-700'}>
                          {p.error > 0 ? `+${p.error}` : p.error} {report.instrument.unit}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300 font-semibold text-slate-700">
                        ±{p.mpe} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold">
                        {p.pass ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">PASS</span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px]">FAIL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              <div>
                Maximum corner difference (|Max - Min|):{' '}
                <strong className="font-mono text-slate-900">{report.eccentricityMaxDiff} {report.instrument.unit}</strong>
              </div>
              <div>
                Statutory Limit (Must not exceed MPE):{' '}
                <strong className="font-mono text-slate-900">±{report.eccentricityTest[0]?.mpe || 0} {report.instrument.unit}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 4: TEST 3 - REPEATABILITY TEST */}
          <div className="my-6 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Test 3: Repeatability Test (OIML R-76 clause 3.6.1)
              </h5>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  report.repeatabilityTestPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {report.repeatabilityTestPassed ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Repeatability Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block font-medium">Applied Test Load (50% Max):</span>
                <div className="font-mono font-bold text-slate-900">
                  {report.repeatabilityTest.appliedLoad} {report.instrument.unit}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-medium">Observed Range (|Max - Min|):</span>
                <div className={`font-mono font-bold ${report.repeatabilityTest.pass ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {report.repeatabilityTest.rangeDifference} {report.instrument.unit}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-medium">Sample Std Dev (σ):</span>
                <div className="font-mono font-bold text-slate-800">
                  {report.repeatabilityTest.stdDev} {report.instrument.unit}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-medium">OIML Tolerance Limit:</span>
                <div className="font-mono font-bold text-slate-800">
                  |Max - Min| ≤ {report.repeatabilityTest.mpe} {report.instrument.unit}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-sm">
              <table className="w-full text-left text-[11px] border-collapse min-w-[580px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 border-r border-slate-300">Run Number</th>
                    <th className="py-2 px-3 border-r border-slate-300">Nominal Load (L)</th>
                    <th className="py-2 px-3 border-r border-slate-300">Indicated Reading (I)</th>
                    <th className="py-2 px-3 border-r border-slate-300">Observed Error (E = I - L)</th>
                    <th className="py-2 px-3 text-center">Observation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.repeatabilityTest.runs.slice(0, 5).map((r) => (
                    <tr key={r.runNumber} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-3 font-mono font-medium border-r border-slate-300 text-slate-900">
                        Run #{r.runNumber}
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300 text-slate-700">
                        {r.appliedLoad} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300 font-bold text-slate-800">
                        {r.indicatedValue} {report.instrument.unit}
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300">
                        <span className={Math.abs(r.error) <= (report.repeatabilityTest.mpe || 0.005) ? 'text-slate-800 font-semibold' : 'text-rose-700 font-bold'}>
                          {r.error > 0 ? `+${r.error}` : r.error} {report.instrument.unit}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              * Statutory Requirement: The difference between the results of several weighings of the same load shall not be greater than the absolute value of the maximum permissible error for that load (OIML R 76-1:2006, clause 3.6.1).
            </div>
          </div>

          {/* SECTION 4: OVERALL VERDICT & DYNAMIC QR VERIFICATION */}
          <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Verdict Stamp */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-serif font-bold text-slate-600">
                  Final Metrological Verdict:
                </span>
                <div
                  className={`px-4 py-2 rounded-lg font-black text-sm uppercase tracking-widest border-2 flex items-center gap-2 ${
                    isPass
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600'
                      : 'bg-rose-50 text-rose-900 border-rose-600'
                  }`}
                >
                  {isPass ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                  <span>{isPass ? 'CERTIFIED: CONFORMS TO OIML R-76' : 'REJECTED: NON-CONFORMING'}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-serif">
                {isPass
                  ? `It is certified that the Non-Automatic Weighing Instrument described above has satisfied all type evaluation requirements prescribed in OIML Recommendation R-76 and the Legal Metrology (General) Rules, 2011 for Class ${report.instrument.accuracyClass}. Stamping and model verification authorized.`
                  : `NOTICE OF METROLOGICAL REJECTION: The instrument fails to satisfy the prescribed Maximum Permissible Error (MPE) tolerances under OIML R-76. Corrective adjustment, mechanical alignment, and re-testing are mandatory before commercial transaction approval.`}
              </p>

              {/* Digital Hash and Security Token */}
              <div className="text-[10px] text-slate-500 font-mono space-y-0.5 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400">Cryptographic Register Hash:</span>{' '}
                  <strong className="text-slate-800">{report.verificationHash}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Digital Signoff Timestamp:</span>{' '}
                  <strong className="text-slate-800">
                    {report.digitalSignatureTimestamp || `${report.environment.testingDate} 10:45:00 IST`}
                  </strong>
                </div>
              </div>
            </div>

            {/* Dynamic QR Code Box */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-300 text-center">
              {qrDataUrl ? (
                <div className="relative group cursor-pointer" onClick={() => onOpenVerificationModal(report.id)}>
                  <img
                    src={qrDataUrl}
                    alt="OIML Verification QR Code"
                    className="w-32 h-32 rounded-lg border border-slate-200 bg-white p-1 shadow-xs"
                  />
                  <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span className="bg-indigo-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                      Scan / Click
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-10 h-10 text-slate-400" />
                </div>
              )}

              <span className="text-[10px] font-mono font-bold text-slate-800 mt-2">
                ID: {report.id}
              </span>
              <span className="text-[9px] text-slate-500 leading-tight">
                Scan with smartphone to verify authenticity on National DoCA Portal
              </span>
            </div>
          </div>

          {/* Signatures & Laboratory Stamp Row */}
          <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center">
            <div>
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-700 font-semibold border-b border-slate-400 pb-1">
                {report.environment.officerName}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Evaluating Metrologist / Officer ID: {report.environment.officerId}
              </span>
            </div>

            <div className="hidden sm:block">
              <div className="h-10 flex items-center justify-center border-b border-slate-400 pb-1">
                <div className="w-14 h-9 rounded-full border-2 border-dashed border-indigo-700/40 text-indigo-900/60 font-bold text-[8px] flex items-center justify-center uppercase tracking-tighter">
                  RRSL SEAL
                </div>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Official Laboratory Seal &amp; Stamping
              </span>
            </div>

            <div>
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-700 font-semibold border-b border-slate-400 pb-1">
                Dr. Anand Verma
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Director / Authorized Signatory (DoCA)
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Attachments Section */}
        <div className="mt-6 pt-4 border-t border-slate-200 no-print">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Supporting Test Evidence &amp; Instrument Photographs</span>
            </h5>
            <label className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer transition-colors flex items-center gap-1">
              <span>+ Upload Scale Photo / Evidence</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            {attachments.map((imgUrl, i) => (
              <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-300">
                <img
                  src={imgUrl}
                  alt={`Evidence ${i + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                  Evidence #{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
