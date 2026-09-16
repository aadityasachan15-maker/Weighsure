import React from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  Gauge,
  UserCheck,
  Cpu,
  HelpCircle,
  Scale,
  ShieldCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AccuracyClass, InstrumentSpecs, LabEnvironment, UnitOfMeasure } from '../types/oiml';
import { getMpeTierEnvelopes, validateInstrumentSpecs } from '../utils/oimlEngine';

interface RegistrationModuleProps {
  instrument: InstrumentSpecs;
  environment: LabEnvironment;
  verificationType: 'initial' | 'in_service';
  onUpdateInstrument: (specs: InstrumentSpecs) => void;
  onUpdateEnvironment: (env: LabEnvironment) => void;
  onUpdateVerificationType: (type: 'initial' | 'in_service') => void;
  onProceedToTests: () => void;
}

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({
  instrument,
  environment,
  verificationType,
  onUpdateInstrument,
  onUpdateEnvironment,
  onUpdateVerificationType,
  onProceedToTests,
}) => {
  const validation = validateInstrumentSpecs(instrument);
  const isInService = verificationType === 'in_service';
  const mpeTiers = getMpeTierEnvelopes(instrument, isInService);

  const handleInstrumentChange = (field: keyof InstrumentSpecs, value: any) => {
    onUpdateInstrument({
      ...instrument,
      [field]: value,
    });
  };

  const handleEnvironmentChange = (field: keyof LabEnvironment, value: any) => {
    onUpdateEnvironment({
      ...environment,
      [field]: value,
    });
  };

  const handleClassChange = (newClass: AccuracyClass) => {
    // Set typical defaults based on class
    let updated = { ...instrument, accuracyClass: newClass };
    if (newClass === AccuracyClass.CLASS_I) {
      updated.unit = 'g';
      updated.maxCapacity = 320;
      updated.minCapacity = 0.02;
      updated.scaleIntervalE = 0.001;
      updated.scaleIntervalD = 0.0001;
      updated.deviceType = 'Analytical Precision Balance (Class I)';
    } else if (newClass === AccuracyClass.CLASS_II) {
      updated.unit = 'g';
      updated.maxCapacity = 620;
      updated.minCapacity = 0.5;
      updated.scaleIntervalE = 0.01;
      updated.scaleIntervalD = 0.001;
      updated.deviceType = 'High Precision Gold & Lab Scale (Class II)';
    } else if (newClass === AccuracyClass.CLASS_III) {
      updated.unit = 'kg';
      updated.maxCapacity = 30;
      updated.minCapacity = 0.1;
      updated.scaleIntervalE = 0.005;
      updated.scaleIntervalD = 0.005;
      updated.deviceType = 'Electronic Retail Computing Counter Scale (Class III)';
    } else if (newClass === AccuracyClass.CLASS_IV) {
      updated.unit = 'kg';
      updated.maxCapacity = 500;
      updated.minCapacity = 4;
      updated.scaleIntervalE = 0.2;
      updated.scaleIntervalD = 0.2;
      updated.deviceType = 'Heavy Platform / Industrial Scale (Class IV)';
    }
    onUpdateInstrument(updated);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Step 1: Instrument Registration & Lab Profile
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Capture manufacturer details, OIML accuracy classification, capacity parameters, and testing laboratory environment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Verification Protocol:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                id="mode-initial-btn"
                onClick={() => onUpdateVerificationType('initial')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  verificationType === 'initial'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Initial / Type Approval (1.0 × MPE)</span>
              </button>
              <button
                type="button"
                id="mode-inservice-btn"
                onClick={() => onUpdateVerificationType('in_service')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  verificationType === 'in_service'
                    ? 'bg-amber-500 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>In-Service Stamping (2.0 × MPE)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Verification Protocol Status & Legal Mandate Banner */}
        <div
          className={`mt-4 p-4 rounded-xl border transition-all ${
            isInService
              ? 'bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/50 border-amber-300 text-amber-950 shadow-2xs'
              : 'bg-gradient-to-r from-indigo-50 via-indigo-50/70 to-slate-50 border-indigo-200 text-indigo-950 shadow-2xs'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isInService
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {isInService ? <Scale className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm">
                    {isInService
                      ? 'In-Service Verification & Commercial Stamping Protocol (2.0 × MPE)'
                      : 'Initial Verification & Type Approval Protocol (1.0 × MPE Baseline)'}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isInService
                        ? 'bg-amber-200/90 text-amber-900 border border-amber-400/60'
                        : 'bg-indigo-200/80 text-indigo-900 border border-indigo-300'
                    }`}
                  >
                    {isInService ? 'Routine Inspection Active' : 'Factory / Pre-Market Active'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {isInService ? (
                    <>
                      <strong>Legal Metrology Rules 2011 (Rule 14) & OIML R-76-1:2006 (Clause 3.5.1):</strong> For
                      instruments in routine commercial service, Maximum Permissible Errors are legally{' '}
                      <strong className="text-amber-900 underline decoration-amber-400">doubled (2.0× MPE)</strong>{' '}
                      across all 3 tests (Weighing Performance, Eccentricity, and Repeatability) to accommodate normal
                      field aging, mechanical vibration, and load cell hysteresis.
                    </>
                  ) : (
                    <>
                      <strong>Legal Metrology Act 2009 & OIML R-76-1:2006 (Table 6):</strong> Brand-new or repaired
                      weighing instruments must conform to strict{' '}
                      <strong className="text-indigo-900 underline decoration-indigo-400">1.0× baseline MPE limits</strong>{' '}
                      before grant of Model Verification Certificate and legal commercial stamping.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="flex md:flex-col items-center md:items-end justify-between gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Multiplier</span>
              <div
                className={`font-mono text-base font-extrabold px-3 py-1 rounded-lg ${
                  isInService
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {isInService ? '2.0 × MPE' : '1.0 × MPE'}
              </div>
              <span className="text-[10px] font-medium text-slate-600">
                {isInService ? 'Certificate Form VII' : 'Certificate Form VI'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          {/* Column 1: Machine Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-600" />
              1. Instrument Identification
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Manufacturer Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="inst-manufacturer"
                type="text"
                value={instrument.manufacturer}
                onChange={(e) => handleInstrumentChange('manufacturer', e.target.value)}
                placeholder="e.g. Eagle Weighing Systems Ltd."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Model Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="inst-model"
                  type="text"
                  value={instrument.model}
                  onChange={(e) => handleInstrumentChange('model', e.target.value)}
                  placeholder="e.g. EWS-30R"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Serial Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="inst-serial"
                  type="text"
                  value={instrument.serialNumber}
                  onChange={(e) => handleInstrumentChange('serialNumber', e.target.value)}
                  placeholder="e.g. IN-2026-98124"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Instrument Category / Description
              </label>
              <input
                id="inst-category"
                type="text"
                value={instrument.deviceType}
                onChange={(e) => handleInstrumentChange('deviceType', e.target.value)}
                placeholder="e.g. Electronic Retail Computing Scale"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Indicator Model</label>
                <input
                  type="text"
                  value={instrument.indicatorModel || ''}
                  onChange={(e) => handleInstrumentChange('indicatorModel', e.target.value)}
                  placeholder="e.g. DSP-900 Dual Display"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Load Cell Model</label>
                <input
                  type="text"
                  value={instrument.loadCellModel || ''}
                  onChange={(e) => handleInstrumentChange('loadCellModel', e.target.value)}
                  placeholder="e.g. Sensotronics C2G1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Metrological Parameters & Class */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-600" />
                2. OIML Metrological Parameters
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Accuracy Class (OIML R-76) <span className="text-rose-500">*</span>
              </label>
              <select
                id="inst-accuracy-class"
                value={instrument.accuracyClass}
                onChange={(e) => handleClassChange(e.target.value as AccuracyClass)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-indigo-950"
              >
                <option value={AccuracyClass.CLASS_I}>Class I (Special - Gold/Lab Analytical)</option>
                <option value={AccuracyClass.CLASS_II}>Class II (High - Precision/Jewelry/Assay)</option>
                <option value={AccuracyClass.CLASS_III}>Class III (Medium - Retail/Commercial/Grocery)</option>
                <option value={AccuracyClass.CLASS_IV}>Class IV (Ordinary - Heavy Platform/Weighbridge)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Unit of Measure
                </label>
                <select
                  value={instrument.unit}
                  onChange={(e) => handleInstrumentChange('unit', e.target.value as UnitOfMeasure)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="t">Metric Tonnes (t)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Max Capacity (Max) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="inst-max-cap"
                    type="number"
                    step="any"
                    value={instrument.maxCapacity}
                    onChange={(e) => handleInstrumentChange('maxCapacity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">
                    {instrument.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Min Capacity (Min)
                </label>
                <div className="relative">
                  <input
                    id="inst-min-cap"
                    type="number"
                    step="any"
                    value={instrument.minCapacity}
                    onChange={(e) => handleInstrumentChange('minCapacity', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Verification Interval (e)
                </label>
                <input
                  id="inst-interval-e"
                  type="number"
                  step="any"
                  value={instrument.scaleIntervalE}
                  onChange={(e) => handleInstrumentChange('scaleIntervalE', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Actual Interval (d)
                </label>
                <input
                  id="inst-interval-d"
                  type="number"
                  step="any"
                  value={instrument.scaleIntervalD}
                  onChange={(e) => handleInstrumentChange('scaleIntervalD', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>
            </div>

            {/* Scale Interval Math Validation Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Scale Intervals (n = Max / e):</span>
                <span className="font-mono font-bold text-indigo-700">
                  {validation.n.toLocaleString()} intervals
                </span>
              </div>
              {validation.valid ? (
                <div className="flex items-center gap-1 text-emerald-700 font-medium mt-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conforms to OIML {instrument.accuracyClass} limits.
                </div>
              ) : (
                <div className="text-rose-600 font-medium mt-1 text-[11px] space-y-0.5">
                  {validation.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live OIML Table 6 MPE Limits Matrix Card */}
            <div
              className={`rounded-lg border p-3 text-xs transition-all ${
                isInService
                  ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                  : 'bg-indigo-50/30 border-indigo-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  Statutory MPE Step Limits (OIML Table 6)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isInService
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-indigo-600 text-white shadow-2xs'
                  }`}
                >
                  {isInService ? '2.0× In-Service Active' : '1.0× Initial Active'}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                {mpeTiers.map((tier) => (
                  <div
                    key={tier.tierNumber}
                    className={`flex items-center justify-between p-2 rounded border transition-colors ${
                      isInService
                        ? 'bg-white/90 border-amber-200'
                        : 'bg-white/90 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-medium">
                        Tier {tier.tierNumber} ({tier.intervalRange})
                      </span>
                      <span className="font-semibold text-slate-800">{tier.loadRange}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block font-sans">
                        Permissible Error (±MPE)
                      </span>
                      <span
                        className={`font-bold text-xs ${
                          isInService ? 'text-amber-800' : 'text-indigo-700'
                        }`}
                      >
                        ±{tier.activeMpe} {instrument.unit}
                        <span className="text-[9px] font-medium text-slate-500 ml-1">
                          ({tier.activeFactor})
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] flex items-center justify-between text-slate-600">
                <span>
                  Base $e$: <strong>{instrument.scaleIntervalE} {instrument.unit}</strong>
                </span>
                <span className="font-medium">
                  {isInService ? (
                    <span className="text-amber-800 font-semibold">
                      ⚡ Allowable error doubled vs initial verification
                    </span>
                  ) : (
                    <span className="text-indigo-700 font-semibold">
                      ✓ Baseline standard verification limits
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Lab Environment & Officer Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-indigo-600" />
              3. Laboratory Environment & Officer
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-500" />
                    Temp (°C)
                  </span>
                </label>
                <input
                  id="env-temp"
                  type="number"
                  step="0.1"
                  value={environment.temperature}
                  onChange={(e) => handleEnvironmentChange('temperature', parseFloat(e.target.value) || 0)}
                  placeholder="23.4"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    Humidity (%RH)
                  </span>
                </label>
                <input
                  id="env-humidity"
                  type="number"
                  step="0.5"
                  value={environment.humidity}
                  onChange={(e) => handleEnvironmentChange('humidity', parseFloat(e.target.value) || 0)}
                  placeholder="52.0"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Testing Laboratory (RRSL / Designated Laboratory)
              </label>
              <input
                type="text"
                value={environment.labName}
                onChange={(e) => handleEnvironmentChange('labName', e.target.value)}
                placeholder="Regional Reference Standards Laboratory (RRSL)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Officer / Inspector Name
                </label>
                <input
                  id="env-officer-name"
                  type="text"
                  value={environment.officerName}
                  onChange={(e) => handleEnvironmentChange('officerName', e.target.value)}
                  placeholder="S. K. Sharma"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Officer ID / Reg No.
                </label>
                <input
                  id="env-officer-id"
                  type="text"
                  value={environment.officerId}
                  onChange={(e) => handleEnvironmentChange('officerId', e.target.value)}
                  placeholder="LM-DOCA-IND-8841"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Testing Date
                  </span>
                </label>
                <input
                  type="date"
                  value={environment.testingDate}
                  onChange={(e) => handleEnvironmentChange('testingDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Standard Weights Cert No.
                </label>
                <input
                  type="text"
                  value={environment.standardWeightsCertNo}
                  onChange={(e) => handleEnvironmentChange('standardWeightsCertNo', e.target.value)}
                  placeholder="NPLI/WEIGHTS/2026/0419"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Statutory Verification Category & Certificate Card */}
            <div
              className={`rounded-lg border p-3 text-xs transition-all ${
                isInService
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Statutory Scheme & Certificate Format
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isInService ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {isInService ? 'Form VII - Re-Verification' : 'Form VI - Initial Verification'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-700">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">Legal Stamping Type:</span>
                  <span className="font-semibold text-right">
                    {isInService
                      ? 'Periodic Mandatory Re-Verification (Rule 14)'
                      : 'Type Approval & Initial Verification (Rule 12)'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">Inspection Officer Role:</span>
                  <span className="font-medium text-right text-slate-800">
                    {isInService
                      ? 'Inspector of Legal Metrology (ILM / Field Inspector)'
                      : 'Metrologist / Type Approval Officer (RRSL Lab)'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 pt-0.5">
                  <span className="text-slate-500">Legal Recertification Period:</span>
                  <span className="font-medium text-right text-slate-800">
                    {isInService
                      ? 'Valid for 12 / 24 Months (Annual Stamping Seal)'
                      : 'Valid for New Scale Commissioning'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Footer Action to jump to Tests */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <div
              className={`p-1 rounded-full shrink-0 ${
                isInService ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isInService ? <Scale className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </div>
            <span>
              Profile configured for{' '}
              <strong className={isInService ? 'text-amber-800 font-bold' : 'text-indigo-800 font-bold'}>
                {isInService ? 'In-Service Stamping (2.0× MPE tolerances)' : 'Initial Verification (1.0× MPE tolerances)'}
              </strong>
              . MPE limits will be enforced on all test observations.
            </span>
          </div>

          <button
            type="button"
            id="proceed-tests-btn"
            onClick={onProceedToTests}
            className={`px-4 py-2 text-white rounded-lg text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
              isInService
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>Proceed to Test Observations</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isInService ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
              }`}
            >
              Step 2 & 3 →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
