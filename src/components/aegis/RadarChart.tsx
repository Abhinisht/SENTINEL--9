import { memo, useMemo } from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { RadarMetrics, SecurityState } from '@/types/aegis';
import { cn } from '@/lib/utils';

interface RadarChartProps {
  metrics: RadarMetrics;
  securityState: SecurityState;
  className?: string;
}

/* ---------------- CONSTANTS ---------------- */

const STATE_COLORS: Record<SecurityState, string> = {
  secure: '#22c55e',
  learning: '#3b82f6',
  threat: '#ef4444',
  locked: '#7f1d1d',
};

const STATE_OPACITY: Record<SecurityState, number> = {
  secure: 0.28,
  learning: 0.32,
  threat: 0.38,
  locked: 0.18,
};

/* ---------------- COMPONENT ---------------- */

export const RadarChart = memo(function RadarChart({
  metrics,
  securityState,
  className,
}: RadarChartProps) {
  /* Memoize chart data (CRITICAL for performance) */
  const data = useMemo(
    () => [
      {
        metric: 'Keyboard Speed',
        value: metrics.keyboardSpeed,
        fullMark: 100,
      },
      {
        metric: 'Eye Scan',
        value: metrics.eyeScanConfidence,
        fullMark: 100,
      },
      {
        metric: 'Voice Stability',
        value: metrics.voiceStability,
        fullMark: 100,
      },
      {
        metric: 'Stress Level',
        value: 100 - metrics.stressLevel, // inverted
        fullMark: 100,
      },
      {
        metric: 'Cognitive Match',
        value: metrics.cognitiveMatch,
        fullMark: 100,
      },
    ],
    [
      metrics.keyboardSpeed,
      metrics.eyeScanConfidence,
      metrics.voiceStability,
      metrics.stressLevel,
      metrics.cognitiveMatch,
    ]
  );

  const color = STATE_COLORS[securityState];
  const fillOpacity = STATE_OPACITY[securityState];

  return (
    <div
      className={cn(
        'relative w-full h-full gpu-accelerated',
        className
      )}
    >
      {/* Soft outer glow (GPU safe) */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Radar sweep (only when NOT locked) */}
      {securityState !== 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[85%] h-[85%] rounded-full"
            style={{
              background: `conic-gradient(
                from 0deg,
                transparent 0deg,
                ${color}55 40deg,
                transparent 80deg
              )`,
              animation: 'radar-rotate 6s linear infinite',
            }}
          />
        </div>
      )}

      {/* Chart container */}
      <div className="relative w-full h-full p-6">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar
            cx="50%"
            cy="50%"
            outerRadius="72%"
            data={data}
          >
            <PolarGrid
              stroke="hsl(230 30% 25%)"
              strokeOpacity={0.45}
            />

            <PolarAngleAxis
              dataKey="metric"
              tick={{
                fill: 'rgba(220,255,230,0.95)',
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
                fontWeight: 600,
              }}
              stroke="rgba(255,255,255,0.05)"
              tickLine={false}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: 'rgba(200,220,210,0.8)',
                fontSize: 10,
              }}
              stroke="rgba(255,255,255,0.04)"
              tickCount={5}
            />

            <Radar
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={fillOpacity}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      {/* Center CORE */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            'border-2 transition-all duration-500',
            securityState === 'threat' && 'animate-pulse'
          )}
          style={{
            borderColor: color,
            backgroundColor: `${color}22`,
            boxShadow: `0 0 28px ${color}66`,
          }}
        >
          <span
            className="font-orbitron text-xs font-bold"
            style={{ color }}
          >
            {securityState === 'locked' ? 'LOCK' : 'CORE'}
          </span>
        </div>
      </div>
    </div>
  );
});
