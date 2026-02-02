import { useState, useEffect } from 'react';
import { Cpu, Wifi } from 'lucide-react';

interface Props {
  connectionState: 'idle' | 'connecting' | 'connected';
  onConnect: (target: string) => void;
}

export function ConnectTargetPanel({ connectionState, onConnect }: Props) {
  const [value, setValue] = useState('');

  return (
    <div className="glass-panel rounded-lg p-6 min-h-[260px]">
      <h3 className="font-orbitron text-sm text-primary mb-6">
        Connect App / Device
      </h3>

      {/* IDLE */}
      {connectionState === 'idle' && (
        <>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="e.g. WhatsApp, iPhone, Bank App"
            className="
              w-full px-4 py-2 rounded-md
              bg-black/40 border border-border
              text-foreground
              focus:border-primary focus:outline-none
            "
          />

          <button
            onClick={() => onConnect(value)}
            disabled={!value}
            className="
              mt-4 w-full py-2 rounded-md
              bg-primary text-black
              font-semibold
              hover:opacity-90
            "
          >
            Connect
          </button>
        </>
      )}

      {/* CONNECTING */}
      {connectionState === 'connecting' && (
        <div className="py-10 text-center space-y-6">
          <Wifi className="mx-auto text-cyan-400 animate-pulse" />

          <p className="text-sm tracking-wide">
            Connecting <span className="text-cyan-400 font-semibold">Layer 9</span>…
          </p>

          {/* ✅ PURE CSS LOADING BAR */}
          <div className="w-full max-w-md mx-auto">
            <div className="h-3 rounded-full bg-black/60 overflow-hidden border border-cyan-500/30">
              <div className="layer9-loader h-full rounded-full" />
            </div>

            <p className="mt-2 text-[11px] text-cyan-400 font-mono">
              Establishing secure channel…
            </p>
          </div>
        </div>
      )}

      {/* CONNECTED */}
      {connectionState === 'connected' && (
        <div className="py-10 text-center space-y-3">
          <Cpu className="mx-auto text-secure" />
          <p className="text-secure text-sm font-semibold">
            Layer 9 Connected Secure Channel Established...
          </p>
        </div>
      )}
    </div>
  );
}
