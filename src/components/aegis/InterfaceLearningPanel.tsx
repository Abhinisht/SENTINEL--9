import type { InterfaceModule, SecurityState } from '@/types/aegis';
import { cn } from '@/lib/utils';
import {
  Brain,
  Network,
  Keyboard,
  Eye,
  Mic,
  KeyRound,
  ChevronRight
} from 'lucide-react';

type StateColors = {
  [key in SecurityState]: {
    text: string;
    indicator: string;
    glow: string;
    activeIndicator: string;
  };
};

const stateColors: StateColors = {
  secure: {
    text: 'text-primary',
    indicator: 'bg-secure',
    glow: 'shadow-[0_0_10px_hsl(var(--secure))]',
    activeIndicator: 'bg-primary'
  },
  threat: {
    text: 'text-threat',
    indicator: 'bg-threat',
    glow: 'shadow-[0_0_10px_hsl(var(--threat))]',
    activeIndicator: 'bg-threat'
  },
  learning: {
    text: 'text-learning',
    indicator: 'bg-learning',
    glow: 'shadow-[0_0_10px_hsl(var(--learning))]',
    activeIndicator: 'bg-learning'
  },
  locked: {
    text: 'text-muted-foreground',
    indicator: 'bg-muted-foreground',
    glow: '',
    activeIndicator: 'bg-muted-foreground'
  }
};

interface InterfaceLearningPanelProps {
  modules: InterfaceModule[];
  securityState: SecurityState;
  simulationMode?: string | null;
  onModuleClick?: (moduleId: string) => void;
}

const moduleIcons: Record<string, React.ElementType> = {
  brain: Brain,
  interface: Network,
  keyboard: Keyboard,
  eye: Eye,
  voice: Mic,
  passkey: KeyRound,
};

export function InterfaceLearningPanel({
  modules,
  securityState,
  simulationMode,
  onModuleClick
}: InterfaceLearningPanelProps) {
  const isLocked = securityState === 'locked';
  const colors = stateColors[securityState] || stateColors.secure;

  return (
    <div className="glass-panel rounded-lg p-6 h-full">
      <h2 className={cn(
        "font-orbitron text-sm font-semibold mb-6 uppercase tracking-wider flex items-center gap-2",
        colors.text
      )}>
        <Network className="w-4 h-4" />
        Interface Learning
      </h2>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-primary/50 via-secondary/30 to-transparent" />

        {/* Module tree */}
        <div className="space-y-2">
          {modules.map((module, index) => {
            const Icon = moduleIcons[module.id] || Brain;
            const isActive = module.active;
            const indent = index === 0 ? 0 : index;

            return (
              <button
                key={module.id}
                onClick={() => !isLocked && onModuleClick?.(module.id)}
                disabled={isLocked}
                className={cn(
                  'w-full group relative flex items-center gap-3 px-3 py-3 rounded transition-all duration-300',
                  'hover:bg-muted/50',
                  isActive && !isLocked && 'node-active',
                  isLocked && 'opacity-40 cursor-not-allowed'
                )}
                style={{ paddingLeft: `${12 + indent * 12}px` }}
              >
                {/* Connection node */}
                {index > 0 && (
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center">
                    <div className="w-3 h-px bg-border" />
                    <ChevronRight className="w-3 h-3 text-muted-foreground -ml-1" />
                  </div>
                )}

                {/* Status indicator */}
                <div
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    isActive ? colors.indicator : 'bg-muted-foreground/30',
                    isActive && colors.glow,
                    isActive && securityState === 'threat' && 'animate-pulse'
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded flex items-center justify-center transition-all duration-300',
                    isActive
                      ? `${colors.indicator}/20 text-${colors.indicator.split('-')[1]}`
                      : 'bg-muted text-muted-foreground',
                    isActive && securityState === 'threat' && module.confidence < 70 && 'shadow-[0_0_8px_hsl(var(--threat))]',
                    simulationMode === 'stress' && module.confidence < 50 && 'animate-pulse shadow-[0_0_12px_hsl(var(--threat))] bg-threat/30'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <div className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {module.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Confidence: {module.confidence.toFixed(0)}%
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className={cn(
                    "w-1.5 h-8 rounded-full",
                    colors.activeIndicator
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
