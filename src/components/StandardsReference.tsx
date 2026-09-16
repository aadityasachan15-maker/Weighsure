import React from 'react';
import {
  BookOpen,
  Scale,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Award,
  ExternalLink,
} from 'lucide-react';

export const StandardsReference: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              OIML Recommendation R 76-1 (Edition 2006) &amp; Legal Metrology Act, 2009 Standards Guide
            </h2>
            <p className="text-xs text-slate-500">
              Prescribed statutory metrological limits for Non-Automatic Weighing Instruments (NAWI) Model Approval and Stamping.
            </p>
          </div>
        </div>

        {/* MPE Table 6 */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>1. Maximum Permissible Errors (MPE) on Initial Verification (Table 6)</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              OIML R-76 clause 3.5.1
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 border-r border-slate-200">MPE Limit (±)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Class I (Special)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Class II (High)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 bg-indigo-50/50 text-indigo-950 font-black">
                    Class III (Medium - Retail)
                  </th>
                  <th className="py-2.5 px-3">Class IV (Ordinary)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/40 border-r border-slate-200">
                    ±0.5 e
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200">0 ≤ m ≤ 50,000 e</td>
                  <td className="py-2.5 px-3 border-r border-slate-200">0 ≤ m ≤ 5,000 e</td>
                  <td className="py-2.5 px-3 border-r border-slate-200 bg-indigo-50/30 font-bold text-indigo-900">
                    0 ≤ m ≤ 500 e
                  </td>
                  <td className="py-2.5 px-3">0 ≤ m ≤ 50 e</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-amber-800 bg-amber-50/40 border-r border-slate-200">
                    ±1.0 e
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200">50,000 e &lt; m ≤ 200,000 e</td>
                  <td className="py-2.5 px-3 border-r border-slate-200">5,000 e &lt; m ≤ 20,000 e</td>
                  <td className="py-2.5 px-3 border-r border-slate-200 bg-indigo-50/30 font-bold text-indigo-900">
                    500 e &lt; m ≤ 2,000 e
                  </td>
                  <td className="py-2.5 px-3">50 e &lt; m ≤ 200 e</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-purple-800 bg-purple-50/40 border-r border-slate-200">
                    ±1.5 e
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200">200,000 e &lt; m</td>
                  <td className="py-2.5 px-3 border-r border-slate-200">20,000 e &lt; m ≤ 100,000 e</td>
                  <td className="py-2.5 px-3 border-r border-slate-200 bg-indigo-50/30 font-bold text-indigo-900">
                    2,000 e &lt; m ≤ 10,000 e
                  </td>
                  <td className="py-2.5 px-3">200 e &lt; m ≤ 1,000 e</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Note: For in-service inspection/annual verification, Maximum Permissible Errors are doubled (2.0 × MPE) as per clause 3.5.2.
          </p>
        </div>

        {/* 3 Core Tests Explained */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase">1. Weighing Performance</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tested at minimum 5-6 points from Min to Max with increasing load (L↑) and decreasing load (L↓).
            </p>
            <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
              Error: E = I - L<br />
              Hysteresis: |E_dec - E_inc| ≤ MPE<br />
              Rule: |E| ≤ MPE
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase">2. Eccentricity Test</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tested by applying ≈ 1/3 Max in center and 4 corners to detect corner-load torque or strain gauge mismatch.
            </p>
            <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
              Positions: Center + 4 Corners<br />
              Max Diff: (Max - Min) ≤ MPE<br />
              Rule: At each corner |E| ≤ MPE
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase">3. Repeatability Test</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applying identical load (≈ 50% Max) 3 to 10 consecutive times under identical ambient conditions.
            </p>
            <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
              Runs: 3 to 10 loading cycles<br />
              Range: (Max - Min) ≤ |MPE|<br />
              Std Dev: σ = √[ Σ(I - I_avg)² / (n - 1) ]
            </div>
          </div>
        </div>

        {/* Legal Metrology Act 2009 Context */}
        <div className="mt-8 p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2 text-xs text-indigo-950">
          <h4 className="font-bold flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-700" />
            Statutory Mandate under The Legal Metrology Act, 2009 (Govt. of India)
          </h4>
          <p className="leading-relaxed text-slate-700">
            Under Section 22 and Section 24 of the Legal Metrology Act, 2009 read with the Legal Metrology (General) Rules, 2011, no commercial weighing scale may be manufactured, sold, or used for transactions without prior <strong>Model Approval (Type Evaluation)</strong> by an accredited laboratory (e.g. RRSL Faridabad, Ahmedabad, Bangalore, Bhubaneswar, Guwahati) and stamping with a verifiable verification certificate.
          </p>
        </div>
      </div>
    </div>
  );
};
