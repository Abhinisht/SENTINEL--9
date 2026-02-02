import { cn } from '@/lib/utils';

interface Props {
  phase: 'idle' | 'connecting' | 'connected';
}

export function Layer9ConnectionStatus({ phase }: Props) {
  if (phase === 'idle') return null;

  return (
    <div
      className={cn(
        'mt-4 p-4 rounded-lg border text-center',
        'glass-panel',
        phase === 'connected'
          ? 'border-secure text-secure glow-green'
          : 'border-primary text-primary glow-cyan'
      )}
    >
      {/* STATUS TEXT */}
      <p className="font-orbitron text-sm tracking-wider mb-3">
        {phase === 'connecting'
          ? 'Layer 9 Connecting…'
          : 'Layer 9 Connected'}
      </p>

      {/* LOADING BAR */}
      {phase === 'connecting' && (
        <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
          <div className="h-full w-full animate-layer9-bar" />
        </div>
      )}

      {/* CONNECTED BADGE */}
      {phase === 'connected' && (
        <p className="text-xs text-muted-foreground mt-2">
          Secure channel established
        </p>
      )}
    </div>
  );
}
