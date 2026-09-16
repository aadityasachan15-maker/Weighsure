import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  QrCode,
  Download,
  Filter,
  Building2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { OIMLTestReport } from '../types/oiml';

interface RepositoryViewProps {
  reports: OIMLTestReport[];
  onSelectReport: (report: OIMLTestReport) => void;
  onOpenVerificationModal: (reportId: string) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  reports,
  onSelectReport,
  onOpenVerificationModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.instrument.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.instrument.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.instrument.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.environment.officerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === 'all' || r.instrument.accuracyClass === filterClass;
    const matchesStatus = filterStatus === 'all' || r.overallVerdict === filterStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                National Legal Metrology Digital Verification Repository
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Centrally synchronized database of evaluated Non-Automatic Weighing Instruments (NAWI) across RRSL centers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Total Registered:</span>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {reports.length} Reports
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Report ID, Manufacturer, Model, Serial, or Officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Accuracy Classes</option>
              <option value="Class I">Class I (Special)</option>
              <option value="Class II">Class II (High)</option>
              <option value="Class III">Class III (Medium)</option>
              <option value="Class IV">Class IV (Ordinary)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Statuses (PASS &amp; FAIL)</option>
              <option value="PASS">Conforms / PASS Only</option>
              <option value="FAIL">Rejected / FAIL Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-3">Manufacturer &amp; Model</th>
                <th className="py-3 px-3">Accuracy Class</th>
                <th className="py-3 px-3">Capacity (Max / e)</th>
                <th className="py-3 px-3">Laboratory</th>
                <th className="py-3 px-3">Testing Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const isPass = r.overallVerdict === 'PASS';

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                      {r.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{r.instrument.manufacturer}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {r.instrument.model} • S/N: {r.instrument.serialNumber}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{r.instrument.accuracyClass}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {r.instrument.maxCapacity} {r.instrument.unit} / e={r.instrument.scaleIntervalE}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="truncate max-w-[160px]">{r.environment.labName}</div>
                      <div className="text-[10px] text-slate-400">{r.environment.officerName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {r.environment.testingDate}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isPass
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectReport(r)}
                          title="View Official Certificate"
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenVerificationModal(r.id)}
                          title="Verify QR Code"
                          className="p-1 text-slate-500 hover:text-amber-700 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
