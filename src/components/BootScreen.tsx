import { useOS } from '@/store/OSContext';
import { useEffect, useRef, useState } from 'react';

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Scramble a string — returns array of frames for animation
function scrambleText(text: string, progress: number, glitchChance = 0.15): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charProgress = (i / text.length) * progress;
    if (charProgress >= 1 || Math.random() < glitchChance) {
      result += text[i];
    } else {
      result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
  }
  return result;
}

const BOOT_LINES = [
  { phase: 1, text: 'BIOS Axier v2.1.0', sub: 'Detecting primary master' },
  { phase: 2, text: 'Loading kernel axier-5.15.0-custom', sub: 'Memory: 8192MB OK' },
  { phase: 3, text: 'Mounting root filesystem', sub: '/dev/sda1 on / type ext4 (rw)' },
  { phase: 4, text: 'Starting Axier Desktop Environment', sub: 'Loading modules' },
  { phase: 5, text: 'System ready', sub: 'Welcome to Axier OS' },
];

export default function BootScreen() {
  const { state } = useOS();
  const [displayLines, setDisplayLines] = useState<{ phase: number; text: string; sub: string | null; glitchText: string; glitchSub: string }[]>(
    BOOT_LINES.map(l => ({ ...l, glitchText: '', glitchSub: '' }))
  );
  const [scanOffset, setScanOffset] = useState(0);
  const [flashPhase, setFlashPhase] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Boot phase progress (0 → 1 per phase)
  const PHASE_DURATION = 700; // ms per phase

  useEffect(() => {
    const interval = setInterval(() => {
      setScanOffset(Math.random() * 100);
      if (Math.random() < 0.1) setFlashPhase(f => !f);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    startTimeRef.current = performance.now();

    function tick(now: number) {
      if (startTimeRef.current === null) return;
      const elapsed = now - startTimeRef.current!;

      const newLines = BOOT_LINES.map((line) => {
        const phaseStart = (line.phase - 1) * PHASE_DURATION;
        const phaseEnd = line.phase * PHASE_DURATION;
        const lineElapsed = elapsed - phaseStart;

        if (elapsed < phaseStart) {
          // Not started yet
          return { ...line, glitchText: '', glitchSub: '' };
        } else if (elapsed >= phaseEnd) {
          // Phase done — fully resolved
          return { ...line, glitchText: line.text, glitchSub: line.sub || '' };
        } else {
          // In progress — scramble
          const progress = lineElapsed / PHASE_DURATION;
          const glitchText = scrambleText(line.text, progress);
          const glitchSub = line.sub ? scrambleText(line.sub, progress * 0.8) : '';
          return { ...line, glitchText, glitchSub };
        }
      });

      setDisplayLines(newLines);

      // Stop when all 5 phases done
      const totalDuration = BOOT_LINES.length * PHASE_DURATION;
      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.bootPhase]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.3) 2px, rgba(0,255,0,0.3) 4px)',
          backgroundSize: '100% 4px',
        }} />

      {/* Glitch scan bar */}
      <div
        className="pointer-events-none absolute left-0 w-full h-[2px] bg-cyan-400 opacity-30"
        style={{ top: `${scanOffset}%`, boxShadow: '0 0 8px #22d3ee, 0 0 20px #22d3ee' }}
      />

      {/* Flash overlay on phase change */}
      {flashPhase && (
        <div className="pointer-events-none absolute inset-0 bg-white opacity-[0.03]" />
      )}

      <div className="w-full max-w-2xl px-8 relative z-10">
        {/* ASCII Logo with glitch */}
        <pre className="text-[9px] sm:text-[11px] leading-[1.1] text-cyan-500 mb-8 hidden sm:block"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            textShadow: '0 0 6px #06b6d4',
            animation: 'logoGlitch 4s infinite',
          }}>
{`    _    _       _     __  __       _
   / \\  / \\     / \\   |  \\/  |     | |
  / _ \\/ _ \\   / _ \\  | |\\/| | ___ | |_
 / ___/ ___ \\ / ___ \\ | |  | |/ _ \\| __|
/_/  _\\_/   \\_\\_/   \\_\\|_|  |_|(_)| |\\__|
   |_|                          |___|`}
        </pre>

        {/* Boot lines */}
        <div className="space-y-1">
          {displayLines.map((line) => {
            const isActive = state.bootPhase === line.phase;
            const isDone = state.bootPhase > line.phase;
            const isPending = state.bootPhase < line.phase;

            return (
              <div key={line.phase} className="relative">
                <div className="flex items-center gap-3">
                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
                    isDone ? 'bg-green-400' :
                    isActive ? 'bg-cyan-400' :
                    'bg-gray-700'
                  }`}
                    style={isActive ? { boxShadow: '0 0 6px #22d3ee, 0 0 12px #22d3ee', animation: 'dotPulse 0.6s ease-in-out infinite alternate' } : {}}
                  />

                  {/* Main text with glitch */}
                  <span className={`text-xs sm:text-sm ${isDone ? 'text-green-400' : isActive ? 'text-cyan-300' : 'text-gray-700'}`}
                    style={
                      isActive ? { textShadow: '0 0 4px #67e8f9' } :
                      isDone ? { textShadow: '0 0 4px #4ade80' } : {}
                    }>
                    <span className="text-gray-500">[{String(line.phase).padStart(2, '0')}]</span>{' '}
                    {isPending ? (
                      <span className="opacity-30">{line.text.split('').map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]).join('')}</span>
                    ) : (
                      <span className={isActive ? 'animate-pulse' : ''}>{line.glitchText}</span>
                    )}
                    {isActive && line.phase < 5 && (
                      <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse"
                        style={{ boxShadow: '0 0 6px #22d3ee' }} />
                    )}
                  </span>
                </div>

                {/* Sub text */}
                {line.glitchSub && (
                  <div
                    className={`ml-6 text-[10px] sm:text-xs mt-0.5 transition-opacity duration-300 ${
                      isDone ? 'text-gray-500' : 'text-gray-600'
                    }`}
                    style={isDone ? { opacity: 1 } : { opacity: 0.6 }}
                  >
                    {'>'} {line.glitchSub}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar with glow */}
        <div className="mt-8 w-full h-[2px] bg-gray-900 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${(state.bootPhase / 5) * 100}%`,
              background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
              boxShadow: '0 0 8px #22d3ee, 0 0 20px #06b6d4',
            }}
          />
        </div>

        {/* Percentage */}
        <div className="mt-2 text-right text-[10px] text-cyan-600"
          style={{ fontFamily: "'Courier New', monospace" }}>
          {Math.round((state.bootPhase / 5) * 100)}%
        </div>

        {/* Ready message */}
        {state.bootPhase >= 5 && (
          <div className="mt-6 text-center text-xs text-cyan-600 animate-pulse"
            style={{ textShadow: '0 0 8px #06b6d4' }}>
            [ PRESS ANY KEY TO CONTINUE ]
          </div>
        )}
      </div>

      <style>{`
        @keyframes dotPulse {
          from { opacity: 1; box-shadow: 0 0 4px #22d3ee; }
          to { opacity: 0.5; box-shadow: 0 0 12px #22d3ee, 0 0 20px #22d3ee; }
        }
        @keyframes logoGlitch {
          0%, 92%, 100% { transform: none; filter: none; }
          93% { transform: translateX(-2px); filter: hue-rotate(90deg); }
          94% { transform: translateX(2px); }
          95% { transform: translateX(0); filter: hue-rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
