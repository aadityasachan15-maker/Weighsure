import React from 'react';
import {
  Scale,
  FileCheck2,
  Bot,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { AccuracyClass } from '../types/oiml';

interface NavbarProps {
  activeTab: 'wizard' | 'report' | 'ai' | 'repository' | 'standards';
  setActiveTab: (tab: 'wizard' | 'report' | 'ai' | 'repository' | 'standards') => void;
  onLoadPreset: (presetIndex: number) => void;
  onNewTest: () => void;
  reportCount: number;
  currentVerdict: 'PASS' | 'FAIL';
  currentReportId: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLoadPreset,
  onNewTest,
  reportCount,
  currentVerdict,
  currentReportId,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      {/* Top Gov Info Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
            🇮🇳
          </span>
          <span className="font-semibold text-slate-200">
            Government of India • Ministry of Consumer Affairs, Food & Public Distribution
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Department of Consumer Affairs (DoCA) — Legal Metrology Division
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            RRSL Online Verification Node Active
          </span>
          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-medium">
            SIH-2026 • PS-26035
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  WeighSure
                  <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    OIML R-76
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Non-Automatic Weighing Instruments (NAWI) Automated Verification Suite
              </p>
            </div>
          </div>

          {/* Preset Demonstrator Dropdown / Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Demo Presets:
            </span>
            <button
              id="preset-pass-btn"
              onClick={() => onLoadPreset(0)}
              title="Load 30kg Retail Scale that passes all OIML tests"
              className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Retail Scale (PASS)
            </button>

            <button
              id="preset-fail-btn"
              onClick={() => onLoadPreset(1)}
              title="Load 15kg Scale with Corner 4 Eccentricity defect (+8g error)"
              className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Corner Failure (FAIL)
            </button>

            <button
              id="preset-class2-btn"
              onClick={() => onLoadPreset(2)}
              title="Load Class II High Precision Laboratory / Gold Balance"
              className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Lab Gold Balance (Class II)
            </button>

            <button
              id="new-test-btn"
              onClick={onNewTest}
              className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              New Test
            </button>
          </div>

          {/* Current Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                currentVerdict === 'PASS'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentVerdict === 'PASS' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
              {currentVerdict === 'PASS' ? 'OIML Compliant' : 'Non-Conforming'}
            </div>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              #{currentReportId}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 border-t border-slate-100 py-1 overflow-x-auto">
          <button
            id="tab-wizard-btn"
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'wizard'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>1. Test Entry Wizard</span>
            <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">
              Steps 1-3
            </span>
          </button>

          <button
            id="tab-report-btn"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'report'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>2. Standardized OIML Report & QR</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
              Step 4
            </span>
          </button>

          <button
            id="tab-ai-btn"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'ai'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>3. AI Explainability Assistant</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-purple-600" />
              Step 5
            </span>
          </button>

          <button
            id="tab-repo-btn"
            onClick={() => setActiveTab('repository')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'repository'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>National Repository</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
              {reportCount}
            </span>
          </button>

          <button
            id="tab-standards-btn"
            onClick={() => setActiveTab('standards')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'standards'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>OIML R-76 & DoCA Standards</span>
          </button>

          <div className="ml-auto flex items-center pl-2">
            <a
              id="download-sih-ppt-pdf-btn"
              href="/SIH_2026_PS35_WeighSure_Presentation.pdf"
              download="SIH_2026_PS35_WeighSure_Presentation.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs border border-amber-600 transition-all cursor-pointer whitespace-nowrap"
              title="Download SIH 2026 Official 6-Slide Presentation Deck PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>SIH PPT Deck (PDF)</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};
