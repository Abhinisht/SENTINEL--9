import { forwardRef } from 'react';
import { SimulationMode, SecurityState } from '@/types/aegis';
import { cn } from '@/lib/utils';
import { 
  User, 
  AlertTriangle, 
  Heart, 
  Sparkles,
  RotateCcw,
  Power
} from 'lucide-react';

interface SimulationControlsProps {
  currentMode: SimulationMode;
  securityState: SecurityState;
  onModeChange: (mode: SimulationMode) => void;
  onReset: () => void;
  onRestart: () => void;
  connectionState?: 'idle' | 'connecting' | 'connected';
}

const simulationModes: { mode: SimulationMode; label: string; icon: React.ElementType; description: string }[] = [
  { 
    mode: 'normal', 
    label: 'Normal User', 
    icon: User,
    description: 'Baseline behavior'
  },
  { 
    mode: 'stress', 
    label: 'Stress Attack', 
    icon: AlertTriangle,
    description: 'Simulated threat'
  },
  { 
    mode: 'injury', 
    label: 'Injury Mode', 
    icon: Heart,
    description: 'Compensation active'
  },
];

export const SimulationControls = forwardRef<HTMLDivElement, SimulationControlsProps>(
  function SimulationControls({
    currentMode,
    securityState,
    onModeChange,
    onReset,
    onRestart,
    connectionState = 'idle',
  }, ref) {
    const isLocked = securityState === 'locked';

    return (
      <div ref={ref} className="glass-panel rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-secondary" />
          <h3 className="font-orbitron text-xs font-semibold text-secondary uppercase tracking-wider">
            Simulation Controls
          </h3>
        </div>

        {/* Simulation mode buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {simulationModes.map(({ mode, label, icon: Icon, description }) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              disabled={isLocked}
              className={cn(
                'flex-1 min-w-[100px] p-3 rounded border transition-all duration-300',
                'flex flex-col items-center gap-1',
                currentMode === mode 
                  ? 'border-secondary bg-secondary/20 text-secondary' 
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-secondary/50',
                isLocked && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] opacity-70">{description}</span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={isLocked || connectionState !== 'connected'}
            className={cn(
              'flex-1 cyber-btn flex items-center justify-center gap-2 text-sm',
              (isLocked || connectionState !== 'connected') && 'opacity-40'
            )}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            disabled={connectionState !== 'connected'}
            className={cn(
              'flex-1 cyber-btn cyber-btn-danger flex items-center justify-center gap-2 text-sm',
              (isLocked || connectionState !== 'connected') && 'opacity-40'
            )}
          >
            <Power className="w-4 h-4" />
            <span>Restart Session</span>
          </button>
        </div>

        {/* Info text */}
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Reset clears modules • Restart requires PassKey verification
        </p>
      </div>
    );
  }
);
