import { useOS } from '@/store/OSContext';
import { useEffect, useState } from 'react';

export default function BootScreen() {
  const { state } = useOS();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const bootLines = [
    { phase: 1, text: 'BIOS Axier v2.1.0', sub: 'Detecting primary master' },
    { phase: 2, text: 'Loading kernel axier-5.15.0-custom', sub: 'Memory: 8192MB OK' },
    { phase: 3, text: 'Mounting root filesystem', sub: '/dev/sda1 on / type ext4 (rw)' },
    { phase: 4, text: 'Starting Axier Desktop Environment', sub: 'Loading modules' },
    { phase: 5, text: 'System ready', sub: 'Welcome to Axier OS' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-sm"
      style={{ fontFamily: 'var(--font-mono)' }}>
      <div className="w-full max-w-2xl px-8">
        {/* ASCII Logo */}
        <pre className="text-[10px] sm:text-xs leading-[1.1] text-gray-500 mb-8 boot-flicker hidden sm:block" style={{ fontFamily: 'var(--font-mono)' }}>
{`    _    _
   / \\  / \\    __ _  ___ ______ _ _ __ ___   _____      _____
  / _ \\/ _ \\  / _\`|/ _ \\____| | '_ \` _ \\ / _ \\ \\ /\\ / / _ \\
 / ___/ ___ \\ | (_| | (_) |   | | | | | | | (_) \\ V  V / (_) |
/_/  /_/   \\_\\ \\__, |\\___/    |_|_| |_| |_|\\___/ \\_/\\_/ \\___/
                |___/`}
        </pre>

        <div className="space-y-1">
          {bootLines.map((line) => (
            <div
              key={line.phase}
              className={`transition-all duration-300 ${
                state.bootPhase >= line.phase ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  state.bootPhase > line.phase ? 'bg-green-500' :
                  state.bootPhase === line.phase ? 'bg-green-400 boot-pulse' : 'bg-gray-700'
                }`} />
                <span className={`${
                  state.bootPhase >= line.phase ? 'text-green-400' : 'text-gray-700'
                }`}>
                  [{line.phase < 10 ? `0${line.phase}` : line.phase}] {line.text}
                  {state.bootPhase === line.phase && line.phase < 5 ? dots : ''}
                </span>
              </div>
              {state.bootPhase >= line.phase && line.sub && (
                <div className="ml-5 text-xs text-gray-600 mt-0.5">
                  {'>'} {line.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-700 ease-out"
            style={{ width: `${(state.bootPhase / 5) * 100}%` }}
          />
        </div>

        {state.bootPhase >= 5 && (
          <div className="mt-6 text-center text-gray-500 text-xs boot-pulse">
            Press any key to continue
          </div>
        )}
      </div>
    </div>
  );
}
