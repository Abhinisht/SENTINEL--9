// Security States
export type SecurityState = 'secure' | 'learning' | 'threat' | 'locked';

// Learning Modes
export type LearningMode = 'normal' | 'injury' | 'recovery';

// Interface Learning Modules
export interface InterfaceModule {
  id: string;
  name: string;
  active: boolean;

  // 🔽 Current live confidence (changes in stress/injury)
  confidence: number;

  // ✅ BASELINE confidence (used to restore)
  baseConfidence: number;

  lastUpdated: Date;
}

// Radar Metrics
export interface RadarMetrics {
  keyboardSpeed: number;
  eyeScanConfidence: number;
  voiceStability: number;
  stressLevel: number;
  cognitiveMatch: number;
}

// User Baseline
export interface UserBaseline {
  averageTypingSpeed: number;
  typingRhythm: number[];
  voiceFrequency: number;
  stressThreshold: number;
  lastVerification: Date;
  totalVerifications: number;
}

// System State
export interface AegisState {
  securityState: SecurityState;
  learningMode: LearningMode;
  metrics: RadarMetrics;
  baseline: UserBaseline;
  modules: InterfaceModule[];
  isLocked: boolean;
  lockoutEndTime: Date | null;
  failedAttempts: number;
  maxAttempts: number;
  sessionStartTime: Date;
  currentCommand: string;
}

// Simulation Mode
export type SimulationMode = 'normal' | 'stress' | 'injury' | null;
