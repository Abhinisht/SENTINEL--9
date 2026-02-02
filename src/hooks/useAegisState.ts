import { useState, useCallback, useEffect } from 'react';
import { classifyIntent } from '@/lib/intentClassifier';
import { AegisState, RadarMetrics, SimulationMode } from '@/types/aegis';
import { logAuditEvent } from '@/lib/auditLogger';

/* -------------------- METRICS -------------------- */

const defaultMetrics: RadarMetrics = {
  keyboardSpeed: 85,
  eyeScanConfidence: 90,
  voiceStability: 88,
  stressLevel: 15,
  cognitiveMatch: 92,
};

const stressMetrics: RadarMetrics = {
  keyboardSpeed: 45,
  eyeScanConfidence: 55,
  voiceStability: 40,
  stressLevel: 85,
  cognitiveMatch: 35,
};

const injuryMetrics: RadarMetrics = {
  keyboardSpeed: 60,
  eyeScanConfidence: 75,
  voiceStability: 70,
  stressLevel: 45,
  cognitiveMatch: 65,
};

const LOCKOUT_DURATION = 2 * 60 * 1000; // 2 minutes

/* -------------------- LOCKOUT PERSISTENCE -------------------- */

const LOCKOUT_STORAGE_KEY = 'sentinel9-lockout';

interface PersistedLockout {
  isLocked: boolean;
  lockoutEndTime: string | null;
}

const saveLockoutState = (isLocked: boolean, lockoutEndTime: Date | null) => {
  const lockoutData: PersistedLockout = {
    isLocked,
    lockoutEndTime: lockoutEndTime ? lockoutEndTime.toISOString() : null,
  };
  localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(lockoutData));
};

const loadLockoutState = (): { isLocked: boolean; lockoutEndTime: Date | null } => {
  try {
    const stored = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!stored) return { isLocked: false, lockoutEndTime: null };

    const parsed: PersistedLockout = JSON.parse(stored);
    const lockoutEndTime = parsed.lockoutEndTime ? new Date(parsed.lockoutEndTime) : null;

    // Check if lockout has expired
    if (parsed.isLocked && lockoutEndTime && lockoutEndTime <= new Date()) {
      // Lockout has expired, clear storage and return unlocked state
      localStorage.removeItem(LOCKOUT_STORAGE_KEY);
      return { isLocked: false, lockoutEndTime: null };
    }

    return { isLocked: parsed.isLocked, lockoutEndTime };
  } catch (error) {
    console.error('Error loading lockout state:', error);
    localStorage.removeItem(LOCKOUT_STORAGE_KEY);
    return { isLocked: false, lockoutEndTime: null };
  }
};

const clearLockoutState = () => {
  localStorage.removeItem(LOCKOUT_STORAGE_KEY);
};

/* -------------------- INITIAL STATE -------------------- */

const getInitialState = (): AegisState => {
  const { isLocked, lockoutEndTime } = loadLockoutState();

  return {
    securityState: isLocked ? 'locked' : 'secure',
    learningMode: 'normal',
    metrics: defaultMetrics,
    baseline: {
      averageTypingSpeed: 75,
      typingRhythm: [120, 115, 125, 118, 122],
      voiceFrequency: 180,
      stressThreshold: 60,
      lastVerification: new Date(),
      totalVerifications: 47,
    },
    modules: [
      { id: 'brain', name: 'Neural Interface', active: true, confidence: 92, baseConfidence: 92, lastUpdated: new Date() },
      { id: 'interface', name: 'System Interface', active: true, confidence: 88, baseConfidence: 88, lastUpdated: new Date() },
      { id: 'keyboard', name: 'Keyboard Patterns', active: false, confidence: 85, baseConfidence: 85, lastUpdated: new Date() },
      { id: 'eye', name: 'Eye Tracking', active: false, confidence: 90, baseConfidence: 90, lastUpdated: new Date() },
      { id: 'voice', name: 'Voice Analysis', active: false, confidence: 88, baseConfidence: 88, lastUpdated: new Date() },
      { id: 'passkey', name: 'Passkey Security', active: false, confidence: 95, baseConfidence: 95, lastUpdated: new Date() },
    ],
    isLocked,
    lockoutEndTime,
    failedAttempts: 0,
    maxAttempts: 2,
    sessionStartTime: new Date(),
    currentCommand: '',
  };
};

/* ==================== HOOK ==================== */

export function useAegisState() {
  const [state, setState] = useState<AegisState>(getInitialState());
  const [simulationMode, setSimulationMode] = useState<SimulationMode>(null);
  const [injuryLocked, setInjuryLocked] = useState(false);

  const [connectionState, setConnectionState] =
    useState<'idle' | 'connecting' | 'connected'>('idle');

  /* ---------- PASSKEY MODALS ---------- */
  const [isPassKeyModalOpen, setIsPassKeyModalOpen] = useState(false);
  const [passKeyTimer, setPassKeyTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [isInjuryPassKeyModalOpen, setIsInjuryPassKeyModalOpen] = useState(false);
  const [injuryPassKeyTimer, setInjuryPassKeyTimer] = useState(120);
  const [isInjuryTimerActive, setIsInjuryTimerActive] = useState(false);

  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isSecureModalOpen, setIsSecureModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /* -------------------- TIMERS -------------------- */

  useEffect(() => {
    if (!isTimerActive || passKeyTimer <= 0) return;
    const i = setInterval(() => setPassKeyTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [isTimerActive, passKeyTimer]);

  useEffect(() => {
    if (!isInjuryTimerActive || injuryPassKeyTimer <= 0) return;
    const i = setInterval(() => setInjuryPassKeyTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [isInjuryTimerActive, injuryPassKeyTimer]);

  /* -------------------- AUTO UNLOCK -------------------- */

  useEffect(() => {
    if (!state.isLocked || !state.lockoutEndTime) return;

    const timeout = setTimeout(() => {
      // Full system restart after lockdown
      clearLockoutState();
      setState(getInitialState());
      setSimulationMode(null);
      setInjuryLocked(false);
      setConnectionState('idle');
    }, state.lockoutEndTime.getTime() - Date.now());

    return () => clearTimeout(timeout);
  }, [state.isLocked, state.lockoutEndTime]);

  /* -------------------- MODE EFFECT (CONFIDENCE DROP FIXED) -------------------- */

  useEffect(() => {
    if (!simulationMode) return;

    setState(prev => ({
      ...prev,
      metrics:
        simulationMode === 'stress'
          ? stressMetrics
          : simulationMode === 'injury'
          ? injuryMetrics
          : defaultMetrics,

      securityState:
        simulationMode === 'stress'
          ? 'threat'
          : simulationMode === 'injury'
          ? 'learning'
          : 'secure',

      learningMode: simulationMode === 'injury' ? 'injury' : 'normal',

      modules: prev.modules.map(module => {
        let drop = 0;
        let jitter = 0;

        if (simulationMode === 'stress') {
          drop =
            module.id === 'brain' ? 35 :
            module.id === 'interface' ? 30 :
            module.id === 'keyboard' ? 40 :
            module.id === 'eye' ? 28 :
            module.id === 'voice' ? 32 :
            25;
          jitter = Math.random() * 12 - 6;
        }

        if (simulationMode === 'injury') {
          drop =
            module.id === 'brain' ? 40 :
            module.id === 'interface' ? 30 :
            module.id === 'keyboard' ? 20 :
            module.id === 'eye' ? 25 :
            module.id === 'voice' ? 28 :
            20;
          jitter = Math.random() * 6 - 3;
        }

        const target = module.baseConfidence - drop + jitter;
        const smooth = module.confidence + (target - module.confidence) * 0.3;

        return {
          ...module,
          confidence: Math.max(10, Math.min(100, smooth)),
          lastUpdated: new Date(),
        };
      }),
    }));
  }, [simulationMode]);

  /* -------------------- PROGRESSIVE STRESS DEGRADATION -------------------- */

  useEffect(() => {
    if (simulationMode !== 'stress') return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        modules: prev.modules.map(module => {
          if (!module.active) return module;

          const progressiveDrop = 1 + Math.random() * 2; // 1-3 points
          const newConfidence = Math.max(10, module.confidence - progressiveDrop);

          return {
            ...module,
            confidence: newConfidence,
            lastUpdated: new Date(),
          };
        }),
      }));
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [simulationMode]);

  /* -------------------- RESTART SESSION -------------------- */

  const initiateRestart = useCallback(() => {
    if (state.isLocked) return;
    logAuditEvent('RESTART_INITIATED', 'User initiated session restart', {
      timestamp: new Date().toISOString(),
    });
    setIsPassKeyModalOpen(true);
    setPassKeyTimer(120);
    setIsTimerActive(true);
  }, [state.isLocked]);

  /* -------------------- PASSKEY SUBMIT -------------------- */

  const handlePassKeySubmit = useCallback(
    (passKey: string) => {
      if (state.isLocked) return false;

      if (passKey.toUpperCase() === 'AEGIS9') {
        logAuditEvent('PASSKEY_SUCCESS', 'Restart passkey entered successfully', {
          timestamp: new Date().toISOString(),
        });
        setIsPassKeyModalOpen(false);
        setIsTimerActive(false);
        setInjuryLocked(false);
        clearLockoutState();
        setState(getInitialState());
        return true;
      }

      logAuditEvent('PASSKEY_FAILURE', 'Restart passkey entered incorrectly', {
        attemptsLeft: state.maxAttempts - (state.failedAttempts + 1),
        timestamp: new Date().toISOString(),
      });

      setState(prev => {
        const attempts = prev.failedAttempts + 1;
        if (attempts >= prev.maxAttempts) {
          return {
            ...prev,
            failedAttempts: prev.maxAttempts,
            isLocked: true,
            lockoutEndTime: new Date(Date.now() + LOCKOUT_DURATION),
            securityState: 'locked',
          };
        }
        return { ...prev, failedAttempts: attempts };
      });

      return false;
    },
    [state.isLocked, state.failedAttempts, state.maxAttempts]
  );

  /* -------------------- INTENT VERIFICATION -------------------- */

  const verifyIntent = useCallback(
    (command: string) => {
      if (connectionState !== 'connected' || state.isLocked || injuryLocked)
        return;

      logAuditEvent('COMMAND_SUBMITTED', 'User submitted command for analysis', {
        command: command,
        timestamp: new Date().toISOString(),
      });

      setIsAnalyzing(true);

      setTimeout(() => {
        const risk = classifyIntent(command);

        if (risk === 'safe') {
          logAuditEvent('COMMAND_VERIFIED', 'Command verified as safe', {
            command: command,
            risk: risk,
            timestamp: new Date().toISOString(),
          });
          // Exit injury or stress mode on safe commands
          if ((simulationMode === 'injury' && !injuryLocked) || simulationMode === 'stress') {
            setSimulationMode('normal');
          } else {
            setSimulationMode('normal');
          }
          setIsSecureModalOpen(true);
        }

        if (risk === 'suspicious') {
          logAuditEvent('COMMAND_VERIFIED', 'Command verified as suspicious', {
            command: command,
            risk: risk,
            timestamp: new Date().toISOString(),
          });
          // If in injury mode, switch to stress mode and stay there
          if (simulationMode === 'injury' && !injuryLocked) {
            setSimulationMode('stress');
          } else if (simulationMode === 'stress') {
            // Stay in stress mode
          } else {
            setSimulationMode('stress');
          }
          setIsThreatModalOpen(true);
        }

        if (risk === 'critical') {
          logAuditEvent('COMMAND_VERIFIED', 'Command verified as critical', {
            command: command,
            risk: risk,
            timestamp: new Date().toISOString(),
          });
          setSimulationMode('injury');
          setInjuryLocked(true);
          setIsInjuryPassKeyModalOpen(true);
          setInjuryPassKeyTimer(120);
          setIsInjuryTimerActive(true);
        }

        setIsAnalyzing(false);
      }, 1200);
    },
    [connectionState, state.isLocked, injuryLocked, simulationMode]
  );

  /* -------------------- HELPERS -------------------- */

  const setModuleActive = useCallback((id: string, active: boolean) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === id ? { ...m, active, lastUpdated: new Date() } : m
      ),
    }));
  }, []);

  const handleReset = useCallback(() => {
    clearLockoutState();
    setState(getInitialState());
    setSimulationMode(null);
    setInjuryLocked(false);
    setConnectionState('idle');
  }, []);

  const setCommand = useCallback((command: string) => {
    setState(prev => ({ ...prev, currentCommand: command }));
  }, []);

  const connectTarget = useCallback(() => {
    setConnectionState('connecting');
    setTimeout(() => setConnectionState('connected'), 2000);
  }, []);

  /* -------------------- SECURITY LOCKOUT -------------------- */

  const handleSecurityLockout = useCallback(() => {
    logAuditEvent('SECURITY_LOCKOUT', 'System locked due to passkey failures', {
      lockoutDuration: LOCKOUT_DURATION / 1000,
      timestamp: new Date().toISOString(),
    });
    setState(prev => ({
      ...prev,
      isLocked: true,
      lockoutEndTime: new Date(Date.now() + LOCKOUT_DURATION),
      securityState: 'locked',
    }));
    setIsPassKeyModalOpen(false);
    setIsTimerActive(false);
  }, []);

  /* -------------------- INJURY PASSKEY SUCCESS -------------------- */

  const handleInjuryPassKeySuccess = useCallback(() => {
    logAuditEvent('INJURY_PASSKEY_SUCCESS', 'Injury passkey entered successfully', {
      timestamp: new Date().toISOString(),
    });
    setInjuryLocked(false);
    // Stay in injury mode after successful passkey
    setIsInjuryPassKeyModalOpen(false);
    setIsInjuryTimerActive(false);
    setState(prev => ({
      ...prev,
      securityState: 'learning', // Keep learning state for injury mode
      learningMode: 'injury',
      metrics: injuryMetrics, // Keep injury metrics
    }));
    setIsSecureModalOpen(true); // Show Secure/Threat popup after injury passkey success
  }, []);

  /* -------------------- INJURY PASSKEY LOCKOUT -------------------- */

  const handleInjuryPassKeyLockout = useCallback(() => {
    const lockoutEndTime = new Date(Date.now() + LOCKOUT_DURATION);
    saveLockoutState(true, lockoutEndTime);
    setState(prev => ({
      ...prev,
      isLocked: true,
      lockoutEndTime,
      securityState: 'locked',
    }));
    setIsInjuryPassKeyModalOpen(false);
    setIsInjuryTimerActive(false);
  }, []);

  /* -------------------- EXPORT -------------------- */

  return {
    state,
    simulationMode,
    connectionState,

    isPassKeyModalOpen,
    passKeyTimer,
    isAnalyzing,

    isInjuryPassKeyModalOpen,
    injuryPassKeyTimer,

    initiateRestart,
    handlePassKeySubmit,
    cancelPassKey: () => setIsPassKeyModalOpen(false),

    handleSecurityLockout,
    handleInjuryPassKeySuccess,
    handleInjuryPassKeyLockout,
    cancelInjuryPassKey: () => setIsInjuryPassKeyModalOpen(false),

    verifyIntent,
    setSimulationMode,

    isThreatModalOpen,
    closeThreatModal: () => setIsThreatModalOpen(false),
    isSecureModalOpen,
    closeSecureModal: () => setIsSecureModalOpen(false),

    setModuleActive,
    handleReset,
    setCommand,
    connectTarget,
  };
}
