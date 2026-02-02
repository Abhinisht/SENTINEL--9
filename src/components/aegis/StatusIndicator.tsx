import { SecurityState } from '@/types/aegis';
import { cn } from '@/lib/utils';
import { Shield, Brain, AlertTriangle, Lock } from 'lucide-react';

interface StatusIndicatorProps {
  state: SecurityState;
  size?: 'sm' | 'md' | 'lg';
}

const stateConfig = {
  secure: {
    label: 'SECURE',
    icon: Shield,
    colorClass: 'text-secure',
    bgClass: 'bg-secure/20',
    borderClass: 'border-secure',
    glowClass: 'glow-green',
  },
  learning: {
    label: 'LEARNING',
    icon: Brain,
    colorClass: 'text-learning',
    bgClass: 'bg-learning/20',
    borderClass: 'border-learning',
    glowClass: 'glow-cyan',
  },
  threat: {
    label: 'THREAT DETECTED',
    icon: AlertTriangle,
    colorClass: 'text-threat',
    bgClass: 'bg-threat/20',
    borderClass: 'border-threat',
    glowClass: 'glow-red',
  },
  locked: {
    label: 'SYSTEM LOCKED',
    icon: Lock,
    colorClass: 'text-locked',
    bgClass: 'bg-locked/20',
    borderClass: 'border-locked',
    glowClass: '',
  },
};

const sizeConfig = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function StatusIndicator({ state, size = 'md' }: StatusIndicatorProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded font-orbitron font-semibold uppercase tracking-wider',
        'border transition-all duration-300',
        config.bgClass,
        config.borderClass,
        config.colorClass,
        config.glowClass,
        sizeConfig[size]
      )}
    >
      <Icon className={cn('animate-pulse', size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />
      <span>{config.label}</span>
    </div>
  );
}
