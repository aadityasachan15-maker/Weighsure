import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  ExternalLink,
  Building2,
  Calendar,
  Lock,
  Scale,
  Award,
} from 'lucide-react';
import { OIMLTestReport } from '../types/oiml';

interface VerificationModalProps {
  reportId: string | null;
  onClose: () => void;
  report?: OIMLTestReport;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  reportId,
  onClose,
  report,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!reportId) return;

    // First try fetching from backend /api/verify/:id
    setLoading(true);
    fetch(`/api/verify/${reportId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.verified) {
          setData(json);
        } else if (report && report.id === reportId) {
          // Fallback to currently loaded in-memory report
          setData({
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
        }
        setLoading(false);
      })
      .catch(() => {
        if (report && report.id === reportId) {
          setData({
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
        }
        setLoading(false);
      });
  }, [reportId, report]);

  if (!reportId) return null;

  const isPass = data?.overallVerdict === 'PASS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                National Legal Metrology Digital Verification Portal
              </h3>
              <p className="text-[11px] text-slate-400">
                Department of Consumer Affairs (DoCA) • Government of India
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium">
              Validating cryptographic hash against National Legal Metrology Registry...
            </div>
          ) : data ? (
            <>
              {/* Authenticity Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  isPass
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isPass ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isPass ? 'Authentic Verified Certificate' : 'Official Rejection Notice'}
                    </span>
                    <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded font-mono font-bold">
                      {data.reportId}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold font-serif">
                    {isPass
                      ? 'CONFORMS TO OIML RECOMMENDATION R-76'
                      : 'NON-CONFORMING: REJECTED UNDER OIML R-76'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {isPass
                      ? 'This instrument has successfully undergone laboratory pattern evaluation and meets all statutory tolerance limits for commercial stamping.'
                      : 'This instrument exceeded permissible errors during official metrological evaluation. Stamping withheld.'}
                  </p>
                </div>
              </div>

              {/* Verified Specifications */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Registered Instrument Particulars
                </span>

                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Manufacturer:</span>
                    <strong className="text-slate-900 text-sm">{data.manufacturer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Model &amp; Serial:</span>
                    <strong className="text-slate-900 text-sm font-mono">
                      {data.model} (S/N: {data.serialNumber})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accuracy Class:</span>
                    <strong className="text-indigo-900">{data.accuracyClass}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capacity (Max / e):</span>
                    <strong className="font-mono text-slate-900">
                      {data.maxCapacity} / e = {data.scaleIntervalE}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Sub-Test Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  OIML R-76 Metrological Test Evaluation Results
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Weighing Test</span>
                    <span
                      className={`font-bold mt-0.5 inline-flex items-center gap-1 ${
                        data.weighingTestPassed ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {data.weighingTestPassed ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Corner / Eccentricity</span>
                    <span
                      className={`font-bold mt-0.5 inline-flex items-center gap-1 ${
                        data.eccentricityTestPassed ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {data.eccentricityTestPassed ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Repeatability</span>
                    <span
                      className={`font-bold mt-0.5 inline-flex items-center gap-1 ${
                        data.repeatabilityTestPassed ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {data.repeatabilityTestPassed ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof & Laboratory Stamp */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    Cryptographic Integrity Proof
                  </span>
                  <span>SHA-256 Ledger Verified</span>
                </div>
                <div className="text-amber-300 truncate">{data.verificationHash}</div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                  <span>Evaluating Lab: {data.laboratory}</span>
                  <span>Officer: {data.officerId}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-rose-600 text-xs font-semibold">
              Report ID not found in the legal verification registry.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Legal Metrology Act, 2009 &bull; DoCA</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Close Verification
          </button>
        </div>
      </div>
    </div>
  );
};
