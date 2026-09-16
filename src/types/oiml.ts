export enum AccuracyClass {
  CLASS_I = 'Class I (Special)',
  CLASS_II = 'Class II (High)',
  CLASS_III = 'Class III (Medium)',
  CLASS_IV = 'Class IV (Ordinary)',
}

export type UnitOfMeasure = 'g' | 'kg' | 'mg' | 't';

export interface InstrumentSpecs {
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: AccuracyClass;
  maxCapacity: number; // in unit
  minCapacity: number; // in unit
  scaleIntervalE: number; // Verification scale interval 'e'
  scaleIntervalD: number; // Actual scale interval 'd'
  unit: UnitOfMeasure;
  deviceType: string; // e.g. "Electronic Retail Counter Scale", "Platform Scale", "Precision Balance"
  indicatorModel?: string;
  loadCellModel?: string;
}

export interface LabEnvironment {
  temperature: number; // °C
  humidity: number; // %RH
  pressure?: number; // hPa
  testingDate: string;
  officerName: string;
  officerId: string;
  labName: string;
  labLocation: string;
  standardWeightsCertNo: string;
}

export interface WeighingPoint {
  id: string;
  nominalLoad: number; // L
  indicatedIncreasing: number; // I_inc
  indicatedDecreasing: number; // I_dec
  errorIncreasing: number; // E_inc = I_inc - L
  errorDecreasing: number; // E_dec = I_dec - L
  hysteresis: number; // |E_dec - E_inc|
  mpe: number; // ± Maximum Permissible Error
  passIncreasing: boolean;
  passDecreasing: boolean;
  passOverall: boolean;
}

export interface EccentricityPoint {
  position: 'Center (1)' | 'Front-Left (2)' | 'Back-Left (3)' | 'Back-Right (4)' | 'Front-Right (5)';
  appliedLoad: number; // typically 1/3 Max
  indicatedValue: number;
  error: number;
  mpe: number;
  pass: boolean;
  notes?: string;
}

export interface RepeatabilityRun {
  runNumber: number;
  appliedLoad: number; // typically 50% Max or Max
  indicatedValue: number;
  error: number;
}

export interface RepeatabilityTestResult {
  appliedLoad: number;
  runs: RepeatabilityRun[];
  maxReading: number;
  minReading: number;
  rangeDifference: number; // Max - Min
  mpe: number;
  pass: boolean;
  stdDev: number;
}

export interface EvidenceAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
  uploadedAt: string;
  caption?: string;
}

export interface OIMLTestReport {
  id: string; // e.g., "RRSL-2026-0042"
  createdAt: string;
  instrument: InstrumentSpecs;
  environment: LabEnvironment;
  verificationType: 'initial' | 'in_service'; // initial verification = 1.0 MPE, in_service = 2.0 MPE
  weighingTest: WeighingPoint[];
  weighingTestPassed: boolean;
  eccentricityTest: EccentricityPoint[];
  eccentricityTestPassed: boolean;
  eccentricityMaxDiff: number;
  repeatabilityTest: RepeatabilityTestResult;
  repeatabilityTestPassed: boolean;
  overallVerdict: 'PASS' | 'FAIL';
  verificationHash: string;
  digitalSignatureTimestamp?: string;
  attachments?: EvidenceAttachment[];
  notes?: string;
  aiAnalysis?: string;
}
