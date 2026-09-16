import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  Info,
} from 'lucide-react';
import {
  EccentricityPoint,
  InstrumentSpecs,
  RepeatabilityTestResult,
  WeighingPoint,
} from '../types/oiml';
import {
  calculateMPE,
  evaluateEccentricityPoints,
  evaluateRepeatabilityTest,
  evaluateWeighingPoint,
  generateRecommendedLoads,
} from '../utils/oimlEngine';

interface TestFormsProps {
  instrument: InstrumentSpecs;
  verificationType: 'initial' | 'in_service';
  weighingTest: WeighingPoint[];
  eccentricityTest: EccentricityPoint[];
  repeatabilityTest: RepeatabilityTestResult;
  onUpdateWeighingTest: (points: WeighingPoint[]) => void;
  onUpdateEccentricityTest: (points: EccentricityPoint[], maxDiff: number, passed: boolean) => void;
  onUpdateRepeatabilityTest: (result: RepeatabilityTestResult) => void;
  onProceedToReport: () => void;
}

export const TestForms: React.FC<TestFormsProps> = ({
  instrument,
  verificationType,
  weighingTest,
  eccentricityTest,
  repeatabilityTest,
  onUpdateWeighingTest,
  onUpdateEccentricityTest,
  onUpdateRepeatabilityTest,
  onProceedToReport,
}) => {
  const [activeSubTest, setActiveSubTest] = useState<'weighing' | 'eccentricity' | 'repeatability'>('weighing');
  const isInService = verificationType === 'in_service';

  // Overall Status
  const weighingPassed = weighingTest.length > 0 && weighingTest.every((p) => p.passOverall);
  const eccentricityPassed = eccentricityTest.length > 0 && eccentricityTest.every((p) => p.pass);
  const repeatabilityPassed = repeatabilityTest.pass;
  const allTestsPassed = weighingPassed && eccentricityPassed && repeatabilityPassed;

  // ----------------------------------------------------
  // 1. WEIGHING PERFORMANCE TEST HANDLERS
  // ----------------------------------------------------
  const handleGenerateRecommended = () => {
    const loads = generateRecommendedLoads(instrument);
    const newPoints: WeighingPoint[] = loads.map((load) => {
      // Small simulated slight realistic deviation within MPE
      const mpe = calculateMPE(load, instrument.accuracyClass, instrument.scaleIntervalE, isInService);
      const slightDev = Number((mpe * 0.35).toFixed(4));
      const inc = Number((load + slightDev).toFixed(4));
      const dec = Number((load + slightDev * 0.8).toFixed(4));
      return evaluateWeighingPoint(load, inc, dec, instrument, isInService);
    });
    onUpdateWeighingTest(newPoints);
  };

  const handleUpdateWeighingRow = (
    index: number,
    field: 'nominalLoad' | 'indicatedIncreasing' | 'indicatedDecreasing',
    value: number
  ) => {
    const updated = [...weighingTest];
    const current = updated[index];
    const newLoad = field === 'nominalLoad' ? value : current.nominalLoad;
    const newInc = field === 'indicatedIncreasing' ? value : current.indicatedIncreasing;
    const newDec = field === 'indicatedDecreasing' ? value : current.indicatedDecreasing;

    updated[index] = evaluateWeighingPoint(newLoad, newInc, newDec, instrument, isInService);
    onUpdateWeighingTest(updated);
  };

  const handleAddWeighingRow = () => {
    const lastLoad = weighingTest.length > 0 ? weighingTest[weighingTest.length - 1].nominalLoad : 0;
    const nextLoad = Number(Math.min(instrument.maxCapacity, lastLoad + instrument.maxCapacity * 0.2).toFixed(3));
    const newPoint = evaluateWeighingPoint(nextLoad, nextLoad, nextLoad, instrument, isInService);
    onUpdateWeighingTest([...weighingTest, newPoint]);
  };

  const handleDeleteWeighingRow = (index: number) => {
    const updated = weighingTest.filter((_, idx) => idx !== index);
    onUpdateWeighingTest(updated);
  };

  // ----------------------------------------------------
  // 2. ECCENTRICITY TEST HANDLERS
  // ----------------------------------------------------
  const handleUpdateEccentricityReading = (index: number, indicated: number) => {
    const appliedLoad = eccentricityTest[0]?.appliedLoad || Number((instrument.maxCapacity / 3).toFixed(3));
    const rawPoints = eccentricityTest.map((p, idx) => ({
      position: p.position,
      indicated: idx === index ? indicated : p.indicatedValue,
    }));
    const result = evaluateEccentricityPoints(rawPoints, appliedLoad, instrument, isInService);
    onUpdateEccentricityTest(result.points, result.maxDiff, result.allPassed);
  };

  const handleUpdateEccentricityLoad = (newLoad: number) => {
    const rawPoints = eccentricityTest.map((p) => ({
      position: p.position,
      indicated: p.indicatedValue,
    }));
    const result = evaluateEccentricityPoints(rawPoints, newLoad, instrument, isInService);
    onUpdateEccentricityTest(result.points, result.maxDiff, result.allPassed);
  };

  // ----------------------------------------------------
  // 3. REPEATABILITY TEST HANDLERS
  // ----------------------------------------------------
  const handleUpdateRepeatabilityRun = (index: number, indicated: number) => {
    const rawRuns = repeatabilityTest.runs.map((r, idx) => ({
      runNumber: r.runNumber,
      indicated: idx === index ? indicated : r.indicatedValue,
    }));
    const evalResult = evaluateRepeatabilityTest(rawRuns, repeatabilityTest.appliedLoad, instrument, isInService);
    onUpdateRepeatabilityTest(evalResult);
  };

  const handleAddRepeatabilityRun = () => {
    if (repeatabilityTest.runs.length >= 10) return;
    const nextRunNumber = repeatabilityTest.runs.length + 1;
    const rawRuns = [
      ...repeatabilityTest.runs.map((r) => ({ runNumber: r.runNumber, indicated: r.indicatedValue })),
      { runNumber: nextRunNumber, indicated: repeatabilityTest.appliedLoad },
    ];
    const evalResult = evaluateRepeatabilityTest(rawRuns, repeatabilityTest.appliedLoad, instrument, isInService);
    onUpdateRepeatabilityTest(evalResult);
  };

  const handleRemoveRepeatabilityRun = () => {
    if (repeatabilityTest.runs.length <= 3) return; // OIML requires at least 3 runs
    const rawRuns = repeatabilityTest.runs
      .slice(0, -1)
      .map((r) => ({ runNumber: r.runNumber, indicated: r.indicatedValue }));
    const evalResult = evaluateRepeatabilityTest(rawRuns, repeatabilityTest.appliedLoad, instrument, isInService);
    onUpdateRepeatabilityTest(evalResult);
  };

  const handleUpdateRepeatabilityLoad = (newLoad: number) => {
    const rawRuns = repeatabilityTest.runs.map((r) => ({
      runNumber: r.runNumber,
      indicated: r.indicatedValue,
    }));
    const evalResult = evaluateRepeatabilityTest(rawRuns, newLoad, instrument, isInService);
    onUpdateRepeatabilityTest(evalResult);
  };

  return (
    <div className="space-y-6">
      {/* Test Tabs Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                2 & 3
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Core OIML R-76 Mathematical Engine & Test Observations
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter test readings. Real-time deterministic formulas calculate Error ($E = I - L$) and enforce Table 6 MPE limits.
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  isInService
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                    : 'bg-indigo-100 text-indigo-900 border-indigo-200 shadow-2xs'
                }`}
              >
                <Scale className="w-3 h-3" />
                <span>
                  {isInService
                    ? 'In-Service Protocol: 2.0× MPE Tolerances Active (Doubled)'
                    : 'Initial Protocol: 1.0× Baseline MPE Active (Strict)'}
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Class {instrument.accuracyClass} • e = {instrument.scaleIntervalE} {instrument.unit} • Max = {instrument.maxCapacity} {instrument.unit}
              </span>
            </div>
          </div>

          {/* Sub Test Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                id="subtest-weighing-btn"
                onClick={() => setActiveSubTest('weighing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                  activeSubTest === 'weighing'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>1. Weighing</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    weighingPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {weighingPassed ? 'PASS' : 'FAIL'}
                </span>
              </button>

              <button
                id="subtest-eccentricity-btn"
                onClick={() => setActiveSubTest('eccentricity')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                  activeSubTest === 'eccentricity'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>2. Eccentricity</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    eccentricityPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {eccentricityPassed ? 'PASS' : 'FAIL'}
                </span>
              </button>

              <button
                id="subtest-repeatability-btn"
                onClick={() => setActiveSubTest('repeatability')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                  activeSubTest === 'repeatability'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>3. Repeatability</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    repeatabilityPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {repeatabilityPassed ? 'PASS' : 'FAIL'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time OIML Compliance Status Bar */}
      <div
        className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          allTestsPassed
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            : 'bg-rose-50/90 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {allTestsPassed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>
                {allTestsPassed
                  ? 'All OIML R-76 Metrological Tests Passed'
                  : 'Metrological Non-Conformity Detected (FAIL)'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                  allTestsPassed
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-900'
                }`}
              >
                {allTestsPassed ? 'VERDICT: PASS' : 'VERDICT: FAIL'}
              </span>
            </div>
            <div className="text-[11px] mt-0.5 opacity-85 flex flex-wrap items-center gap-2">
              <span className={weighingPassed ? 'text-emerald-800 font-semibold' : 'text-rose-700 font-bold'}>
                1. Weighing: {weighingPassed ? 'PASS' : 'FAIL (exceeds MPE)'}
              </span>
              <span>•</span>
              <span className={eccentricityPassed ? 'text-emerald-800 font-semibold' : 'text-rose-700 font-bold'}>
                2. Eccentricity: {eccentricityPassed ? 'PASS' : 'FAIL (corner load defect)'}
              </span>
              <span>•</span>
              <span className={repeatabilityPassed ? 'text-emerald-800 font-semibold' : 'text-rose-700 font-bold'}>
                3. Repeatability: {repeatabilityPassed ? 'PASS' : 'FAIL (range > MPE)'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onProceedToReport}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer shadow-xs"
          >
            View Report &amp; QR
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TEST 1: WEIGHING PERFORMANCE TEST */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTest === 'weighing' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Weighing Performance Test (Increasing & Decreasing Load)</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    weighingPassed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {weighingPassed ? '✓ WEIGHING TEST: PASS' : '✗ WEIGHING TEST: FAIL'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates linearity and hysteresis from Min to Max. MPE envelope is calculated based on OIML R-76 Table 6 for {instrument.accuracyClass}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateRecommended}
                className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Auto-Generate OIML Test Points
              </button>
              <button
                type="button"
                onClick={handleAddWeighingRow}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Load Point
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Nominal Load (L)</th>
                  <th className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-blue-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Indicated Inc (I↑)
                    </span>
                  </th>
                  <th className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-purple-700">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Indicated Dec (I↓)
                    </span>
                  </th>
                  <th className="py-2.5 px-3">Error Inc (E↑)</th>
                  <th className="py-2.5 px-3">Error Dec (E↓)</th>
                  <th className="py-2.5 px-3">Hysteresis (|E↓ - E↑|)</th>
                  <th className="py-2.5 px-3 text-indigo-900">MPE (± Limit)</th>
                  <th className="py-2.5 px-3 text-center">Compliance Status</th>
                  <th className="py-2.5 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weighingTest.map((point, index) => {
                  return (
                    <tr
                      key={point.id || index}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !point.passOverall ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            value={point.nominalLoad}
                            onChange={(e) =>
                              handleUpdateWeighingRow(index, 'nominalLoad', parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                          <span className="text-slate-400 font-mono text-[11px]">{instrument.unit}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={point.indicatedIncreasing}
                          onChange={(e) =>
                            handleUpdateWeighingRow(
                              index,
                              'indicatedIncreasing',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={point.indicatedDecreasing}
                          onChange={(e) =>
                            handleUpdateWeighingRow(
                              index,
                              'indicatedDecreasing',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-purple-500 bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono font-medium">
                        <span
                          className={
                            point.passIncreasing
                              ? 'text-emerald-700'
                              : 'text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded'
                          }
                        >
                          {point.errorIncreasing > 0 ? `+${point.errorIncreasing}` : point.errorIncreasing}{' '}
                          {instrument.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-medium">
                        <span
                          className={
                            point.passDecreasing
                              ? 'text-emerald-700'
                              : 'text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded'
                          }
                        >
                          {point.errorDecreasing > 0 ? `+${point.errorDecreasing}` : point.errorDecreasing}{' '}
                          {instrument.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {point.hysteresis} {instrument.unit}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-indigo-900 bg-indigo-50/40">
                        ±{point.mpe} {instrument.unit}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {point.passOverall ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                            <XCircle className="w-3 h-3" />
                            FAIL (|E| &gt; MPE)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteWeighingRow(index)}
                            title="Delete Point"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Formula Reference Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>OIML Formula:</strong> Error E = I - L &bull; Hysteresis = |E_dec - E_inc| ≤ MPE &bull; Rule: |E| ≤ MPE implies PASS
              </span>
            </div>
            <span className="font-mono text-slate-500">
              {weighingTest.filter((p) => p.passOverall).length} / {weighingTest.length} Points Compliant
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TEST 2: ECCENTRICITY TEST (CORNER LOAD) */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTest === 'eccentricity' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Eccentricity Test / Corner Loading (OIML R-76 clause 3.6.2)</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    eccentricityPassed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {eccentricityPassed ? '✓ ECCENTRICITY: PASS' : '✗ ECCENTRICITY: FAIL'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Load placed in center and 4 corners to detect asymmetric lever/load-cell sensitivity. Recommended test load is ≈ 1/3 Max.
              </p>
            </div>
          </div>

          {/* Test Load Config */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Applied Test Load (1/3 Max):</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                value={eccentricityTest[0]?.appliedLoad || Number((instrument.maxCapacity / 3).toFixed(3))}
                onChange={(e) => handleUpdateEccentricityLoad(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
              />
              <span className="font-mono text-slate-500">{instrument.unit}</span>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              Permissible Error Limit (MPE):{' '}
              <strong className="font-mono text-indigo-900">
                ±{eccentricityTest[0]?.mpe || 0} {instrument.unit}
              </strong>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              Max Corner Reading Difference:{' '}
              <strong className="font-mono text-indigo-900">
                {Math.max(...eccentricityTest.map((p) => p.indicatedValue)) -
                  Math.min(...eccentricityTest.map((p) => p.indicatedValue)) >
                0
                  ? (
                      Math.max(...eccentricityTest.map((p) => p.indicatedValue)) -
                      Math.min(...eccentricityTest.map((p) => p.indicatedValue))
                    ).toFixed(4)
                  : 0}{' '}
                {instrument.unit}
              </strong>
            </span>
          </div>

          {/* Visual Platform Representation + Table Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Platform Graphic */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-xl border border-slate-300 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Crosshair className="w-4 h-4 text-indigo-600" />
                Scale Pan / Load Receptor Layout
              </span>

              {/* Pan Box */}
              <div className="relative w-64 h-64 bg-white rounded-2xl border-4 border-slate-400 shadow-md p-4 grid grid-cols-3 grid-rows-3 gap-2">
                {/* Pos 3: Back-Left */}
                <div
                  className={`col-start-1 row-start-1 rounded-xl p-2 flex flex-col items-center justify-center border text-center transition-all ${
                    eccentricityTest.find((p) => p.position.includes('Back-Left'))?.pass
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-rose-100 border-rose-500 text-rose-900 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-bold">Pos 3</span>
                  <span className="text-[9px] text-slate-500">Back-Left</span>
                  <span className="text-xs font-mono font-semibold mt-0.5">
                    {eccentricityTest.find((p) => p.position.includes('Back-Left'))?.indicatedValue || '-'}{' '}
                    {instrument.unit}
                  </span>
                </div>

                {/* Pos 4: Back-Right */}
                <div
                  className={`col-start-3 row-start-1 rounded-xl p-2 flex flex-col items-center justify-center border text-center transition-all ${
                    eccentricityTest.find((p) => p.position.includes('Back-Right'))?.pass
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-rose-100 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500'
                  }`}
                >
                  <span className="text-[10px] font-bold">Pos 4</span>
                  <span className="text-[9px] text-slate-500">Back-Right</span>
                  <span className="text-xs font-mono font-semibold mt-0.5">
                    {eccentricityTest.find((p) => p.position.includes('Back-Right'))?.indicatedValue || '-'}{' '}
                    {instrument.unit}
                  </span>
                </div>

                {/* Pos 1: Center */}
                <div
                  className={`col-start-2 row-start-2 rounded-xl p-2 flex flex-col items-center justify-center border text-center shadow-xs transition-all ${
                    eccentricityTest.find((p) => p.position.includes('Center'))?.pass
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                      : 'bg-rose-100 border-rose-500 text-rose-900 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-bold text-indigo-700">Pos 1</span>
                  <span className="text-[9px] text-slate-500">Center</span>
                  <span className="text-xs font-mono font-semibold mt-0.5">
                    {eccentricityTest.find((p) => p.position.includes('Center'))?.indicatedValue || '-'}{' '}
                    {instrument.unit}
                  </span>
                </div>

                {/* Pos 2: Front-Left */}
                <div
                  className={`col-start-1 row-start-3 rounded-xl p-2 flex flex-col items-center justify-center border text-center transition-all ${
                    eccentricityTest.find((p) => p.position.includes('Front-Left'))?.pass
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-rose-100 border-rose-500 text-rose-900 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-bold">Pos 2</span>
                  <span className="text-[9px] text-slate-500">Front-Left</span>
                  <span className="text-xs font-mono font-semibold mt-0.5">
                    {eccentricityTest.find((p) => p.position.includes('Front-Left'))?.indicatedValue || '-'}{' '}
                    {instrument.unit}
                  </span>
                </div>

                {/* Pos 5: Front-Right */}
                <div
                  className={`col-start-3 row-start-3 rounded-xl p-2 flex flex-col items-center justify-center border text-center transition-all ${
                    eccentricityTest.find((p) => p.position.includes('Front-Right'))?.pass
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-rose-100 border-rose-500 text-rose-900 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-bold">Pos 5</span>
                  <span className="text-[9px] text-slate-500">Front-Right</span>
                  <span className="text-xs font-mono font-semibold mt-0.5">
                    {eccentricityTest.find((p) => p.position.includes('Front-Right'))?.indicatedValue || '-'}{' '}
                    {instrument.unit}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 mt-3 text-center">
                Front Edge (Technician View)
              </span>
            </div>

            {/* Table of Readings */}
            <div className="lg:col-span-7">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Position</th>
                    <th className="py-2.5 px-3">Applied Load</th>
                    <th className="py-2.5 px-3">Indicated Value</th>
                    <th className="py-2.5 px-3">Calculated Error</th>
                    <th className="py-2.5 px-3">MPE Limit</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eccentricityTest.map((point, index) => (
                    <tr
                      key={point.position}
                      className={`hover:bg-slate-50 transition-colors ${
                        !point.pass ? 'bg-rose-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-800">{point.position}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {point.appliedLoad} {instrument.unit}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          step="any"
                          value={point.indicatedValue}
                          onChange={(e) =>
                            handleUpdateEccentricityReading(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium">
                        <span
                          className={
                            point.pass
                              ? 'text-emerald-700'
                              : 'text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded'
                          }
                        >
                          {point.error > 0 ? `+${point.error}` : point.error} {instrument.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-indigo-900 font-semibold">
                        ±{point.mpe} {instrument.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {point.pass ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                            <XCircle className="w-3 h-3" />
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!eccentricityPassed && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Corner Tolerance Violation:</strong> One or more positions exceed the permissible MPE limit. Under OIML R-76, this instrument must be calibrated, corner-trimmed, or mechanically adjusted before model approval.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TEST 3: REPEATABILITY TEST */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTest === 'repeatability' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Repeatability Test (OIML R-76 clause 3.6.1)</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    repeatabilityPassed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {repeatabilityPassed ? '✓ REPEATABILITY: PASS' : '✗ REPEATABILITY: FAIL'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Instrument is loaded 3 to 10 consecutive times with the same load (typically ≈ 50% Max or Max). The difference between readings (Max - Min) must not exceed |MPE|.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddRepeatabilityRun}
                disabled={repeatabilityTest.runs.length >= 10}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Run ({repeatabilityTest.runs.length}/10)
              </button>
              <button
                type="button"
                onClick={handleRemoveRepeatabilityRun}
                disabled={repeatabilityTest.runs.length <= 3}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Run
              </button>
            </div>
          </div>

          {/* Configuration Banner */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Applied Test Load:</span>
              <input
                type="number"
                step="any"
                value={repeatabilityTest.appliedLoad}
                onChange={(e) => handleUpdateRepeatabilityLoad(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
              />
              <span className="font-mono text-slate-500">{instrument.unit}</span>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              Permissible Tolerance Limit (|MPE|):{' '}
              <strong className="font-mono text-indigo-900">
                {repeatabilityTest.mpe} {instrument.unit}
              </strong>
            </span>
          </div>

          {/* Results Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Max Reading</span>
              <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
                {repeatabilityTest.maxReading} {instrument.unit}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Min Reading</span>
              <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
                {repeatabilityTest.minReading} {instrument.unit}
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                repeatabilityPassed
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-rose-50/70 border-rose-300'
              }`}
            >
              <span className="text-[11px] font-medium text-slate-600">Range Diff (Max - Min)</span>
              <div
                className={`text-base font-mono font-bold mt-0.5 ${
                  repeatabilityPassed ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {repeatabilityTest.rangeDifference} {instrument.unit}
              </div>
              <span className="text-[10px] text-slate-500">Limit: ≤ {repeatabilityTest.mpe} {instrument.unit}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Std Deviation (σ)</span>
              <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
                {repeatabilityTest.stdDev} {instrument.unit}
              </div>
              <span className="text-[10px] text-slate-500">n = {repeatabilityTest.runs.length} runs</span>
            </div>
          </div>

          {/* Observations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Run #</th>
                  <th className="py-2.5 px-3">Nominal Load</th>
                  <th className="py-2.5 px-3">Indicated Value (I)</th>
                  <th className="py-2.5 px-3">Error (I - L)</th>
                  <th className="py-2.5 px-3">Deviation from Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repeatabilityTest.runs.map((run, index) => {
                  const mean =
                    repeatabilityTest.runs.reduce((a, b) => a + b.indicatedValue, 0) /
                    repeatabilityTest.runs.length;
                  const dev = Number((run.indicatedValue - mean).toFixed(5));

                  return (
                    <tr key={run.runNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-indigo-900">Run {run.runNumber}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {run.appliedLoad} {instrument.unit}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={run.indicatedValue}
                          onChange={(e) =>
                            handleUpdateRepeatabilityRun(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-28 px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className={run.error === 0 ? 'text-slate-600' : 'text-slate-800'}>
                          {run.error > 0 ? `+${run.error}` : run.error} {instrument.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">
                        {dev > 0 ? `+${dev}` : dev} {instrument.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* FINAL STEP 3 BOTTOM VERDICT & ACTION BAR */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              allTestsPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {allTestsPassed ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                OIML R-76 Overall Evaluation Status:
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  allTestsPassed ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}
              >
                {allTestsPassed ? 'CONFORMS TO OIML R-76 (CERTIFIED)' : 'REJECTED (NON-CONFORMING)'}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
              <span>
                Weighing Performance:{' '}
                <strong className={weighingPassed ? 'text-emerald-400' : 'text-rose-400'}>
                  {weighingPassed ? 'PASS' : 'FAIL'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Eccentricity (Corners):{' '}
                <strong className={eccentricityPassed ? 'text-emerald-400' : 'text-rose-400'}>
                  {eccentricityPassed ? 'PASS' : 'FAIL'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Repeatability:{' '}
                <strong className={repeatabilityPassed ? 'text-emerald-400' : 'text-rose-400'}>
                  {repeatabilityPassed ? 'PASS' : 'FAIL'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          id="generate-report-btn"
          onClick={onProceedToReport}
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Step 4: Generate Standardized Report & QR Code</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
