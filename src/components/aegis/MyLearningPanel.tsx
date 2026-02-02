import { UserBaseline, RadarMetrics, LearningMode, SecurityState, SimulationMode } from '@/types/aegis';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Clock, 
  AlertCircle, 
  BookOpen,
  TrendingUp,
  Heart,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface MyLearningPanelProps {
  baseline: UserBaseline;
  metrics: RadarMetrics;
  learningMode: LearningMode;
  simulationMode?: SimulationMode;
  securityState: SecurityState;
}

const modeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  normal: { label: 'Normal', icon: Activity, color: 'text-secure' },
  injury: { label: 'Injury Compensation', icon: Heart, color: 'text-learning' },
  recovery: { label: 'Recovery Mode', icon: RefreshCw, color: 'text-secondary' },
  stress: { label: 'Stress Attack', icon: AlertCircle, color: 'text-threat' },
};

export function MyLearningPanel({ 
  baseline, 
  metrics, 
  learningMode,
  simulationMode,
  securityState 
}: MyLearningPanelProps) {
  // Prefer `simulationMode` for display when present (stress/injury override)
  const displayMode = simulationMode ? simulationMode : learningMode;
  const modeInfo = modeConfig[displayMode] || modeConfig[learningMode] || modeConfig['normal'];
  const ModeIcon = modeInfo.icon;
  const isLocked = securityState === 'locked';

  const anomalyScore = Math.max(
    0,
    Math.min(100, (metrics.stressLevel + (100 - metrics.cognitiveMatch)) / 2)
  );

  return (
    <div className={cn(
      'glass-panel rounded-lg p-6 h-full',
      isLocked && 'opacity-50'
    )}>
      <h2 className="font-orbitron text-sm font-semibold text-primary mb-6 uppercase tracking-wider flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        My Learning
      </h2>

      <div className="space-y-6">
        {/* Learning Mode */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Learning Mode</span>
            <ModeIcon className={cn('w-4 h-4', modeInfo.color)} />
          </div>
          <div className={cn('font-orbitron font-semibold', modeInfo.color)}>
            {modeInfo.label}
          </div>
        </div>

        {/* Baseline Stats */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Avg Typing Speed</div>
              <div className="font-mono text-lg text-foreground">
                {baseline.averageTypingSpeed} <span className="text-xs text-muted-foreground">WPM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Last Verification</div>
              <div className="font-mono text-foreground">
                {format(baseline.lastVerification, 'HH:mm:ss')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(baseline.lastVerification, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-threat/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-threat" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Anomaly Score</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all duration-500',
                      anomalyScore < 30 ? 'bg-secure' : 
                      anomalyScore < 60 ? 'bg-learning' : 'bg-threat'
                    )}
                    style={{ width: `${anomalyScore}%` }}
                  />
                </div>
                <span className={cn(
                  'font-mono text-sm',
                  anomalyScore < 30 ? 'text-secure' : 
                  anomalyScore < 60 ? 'text-learning' : 'text-threat'
                )}>
                  {anomalyScore.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Verifications */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Verifications
            </span>
            <span className="font-orbitron text-2xl font-bold text-primary">
              {baseline.totalVerifications}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
