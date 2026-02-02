import { useNavigate, useLocation } from 'react-router-dom';
import { useAegisState } from '@/hooks/useAegisState';
import { StatusIndicator } from './StatusIndicator';
import { RadarChart } from './RadarChart';
import { InterfaceLearningPanel } from './InterfaceLearningPanel';
import { MyLearningPanel } from './MyLearningPanel';
import { CommandInput } from './CommandInput';
import { SimulationControls } from './SimulationControls';
import { PassKeyModal } from './PassKeyModal';
import { InjuryPassKeyModal } from './InjuryPassKeyModal';
import { ThreatModal } from './ThreatModal';
import SecureModal from './SecureModal';
import { LockoutOverlay } from './LockoutOverlay';
import { ConnectTargetPanel } from './ConnectTargetPanel';
import { Shield, Cpu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logAuditEvent } from '@/lib/auditLogger';

export function AegisDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    state,
    simulationMode,

    // modals & flow
    isPassKeyModalOpen,
    passKeyTimer,
    isInjuryPassKeyModalOpen,
    injuryPassKeyTimer,
    isThreatModalOpen,
    closeThreatModal,
    isSecureModalOpen,
    closeSecureModal,

    // analysis
    isAnalyzing,

    // connection
    connectionState,
    connectTarget,

    // actions
    setModuleActive,
    handleReset,
    initiateRestart,
    handlePassKeySubmit,
    cancelPassKey,
    handleSecurityLockout,
    handleInjuryPassKeySuccess,
    handleInjuryPassKeyLockout,
    cancelInjuryPassKey,
    verifyIntent,
    setCommand,
    setSimulationMode,
  } = useAegisState();

  const handleModuleClick = (moduleId: string) => {
    const module = state.modules.find(m => m.id === moduleId);
    if (module) {
      setModuleActive(moduleId, !module.active);
    }
  };

  /* 🔐 LOGOUT WITH AUDIT (SAFE) */
  const handleLogout = () => {
    logAuditEvent('LOGOUT', 'User logged out from Sentinel 9', {
      route: location.pathname,
      securityState: state.securityState,
      activeModules: state.modules.filter(m => m.active).map(m => m.id),
      failedAttempts: state.failedAttempts,
      timestamp: new Date().toISOString(),
    });

    logAuditEvent('REDIRECT', 'Redirected to login page', {
      route: '/login',
      timestamp: new Date().toISOString(),
    });

    localStorage.removeItem('sentinel9-auth');
    localStorage.removeItem('sentinel9-attempts');
    localStorage.removeItem('sentinel9-lockout');

    navigate('/login');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <LockoutOverlay
        isLocked={state.isLocked}
        lockoutEndTime={state.lockoutEndTime}
      />

      <PassKeyModal
        isOpen={isPassKeyModalOpen}
        timer={passKeyTimer}
        maxAttempts={state.maxAttempts}
        onSuccess={handleReset}     // ✅ restart session on success
        onLockout={handleSecurityLockout}     // 🔒 security lockdown
        onCancel={cancelPassKey}
      />

      <InjuryPassKeyModal
        isOpen={isInjuryPassKeyModalOpen}
        timer={injuryPassKeyTimer}
        maxAttempts={state.maxAttempts}
        onSuccess={handleInjuryPassKeySuccess}     // ✅ injury unlocked
        onLockout={handleInjuryPassKeyLockout}     // 🔒 injury lockout
        onCancel={cancelInjuryPassKey}
      />

      <ThreatModal
        isOpen={isThreatModalOpen}
        message="Potential malicious intent detected. Actions are restricted."
        onClose={closeThreatModal}
      />

      <SecureModal
        isOpen={isSecureModalOpen}
        message="Intent verified as secure. Actions permitted."
        onClose={closeSecureModal}
      />

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                'bg-primary/20 border border-primary',
                state.securityState === 'secure' && 'glow-cyan',
                state.securityState === 'threat' &&
                  'glow-red border-threat bg-threat/20'
              )}
            >
              <Shield className="w-6 h-6 text-primary" />
            </div>

            <div>
              <h1 className="font-orbitron text-xl font-bold">Sentinel 9</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                Brain Interface • Layer 9
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIndicator state={state.securityState} size="lg" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs
                         border border-border text-muted-foreground
                         hover:text-primary hover:border-primary transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <InterfaceLearningPanel
              modules={state.modules}
              securityState={state.securityState}
              onModuleClick={handleModuleClick}
            />
          </div>

          <div className="lg:col-span-6">
            <div className="glass-panel rounded-lg p-6 scan-line">
              <div className="text-center mb-4">
                <h2 className="font-orbitron text-sm font-semibold text-primary uppercase">
                  Brain Core
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cognitive Metrics Analysis
                </p>
              </div>

              <div className="relative w-full h-[480px]">
                <RadarChart
                  metrics={state.metrics}
                  securityState={state.securityState}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <MyLearningPanel
              baseline={state.baseline}
              metrics={state.metrics}
              learningMode={state.learningMode}
              simulationMode={simulationMode}
              securityState={state.securityState}
            />
          </div>
        </div>

        {/* CONNECT + COMMAND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConnectTargetPanel
            connectionState={connectionState}
            onConnect={connectTarget}
          />

          <div className="space-y-6">
            <CommandInput
              securityState={state.securityState}
              onSubmit={verifyIntent}
              onChange={setCommand}
              disabled={state.isLocked}
              isAnalyzing={isAnalyzing}
              connectionState={connectionState}
            />

            <SimulationControls
              currentMode={simulationMode}
              securityState={state.securityState}
              onModeChange={setSimulationMode}
              onReset={handleReset}
              onRestart={initiateRestart}
              connectionState={connectionState}
            />
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground py-4 border-t">
          Sentinel 9 • Semantic Intent Verification System •
          <span className="text-primary ml-1">Layer 9 Active</span>
        </footer>
      </div>
    </div>
  );
}
