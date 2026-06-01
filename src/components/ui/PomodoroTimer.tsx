import { useState, useEffect, useRef, useCallback } from 'react';
import { useOS } from '@/store/OSContext';

type Phase = 'idle' | 'working' | 'break' | 'longBreak';

export default function PomodoroTimer() {
  const { state, sendNotification } = useOS();
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [workDuration] = useState(25);
  const [breakDuration] = useState(5);
  const [longBreakDuration] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore */ }
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playBeep();
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [playBeep]);

  useEffect(() => {
    if (!isRunning) return;
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, startTimer]);

  useEffect(() => {
    if (timeLeft !== 0 || phase === 'idle') return;
    if (phase === 'working') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      const isLong = newSessions % 4 === 0;
      setPhase(isLong ? 'longBreak' : 'break');
      setTimeLeft(isLong ? longBreakDuration * 60 : breakDuration * 60);
      sendNotification('Pomodoro', 'Work session complete! Take a break 🎉', 'success');
    } else {
      setPhase('working');
      setTimeLeft(workDuration * 60);
      sendNotification('Pomodoro', 'Break over! Time to focus 💪', 'info');
    }
  }, [timeLeft, phase, sessions, breakDuration, longBreakDuration, workDuration, sendNotification]);

  const reset = () => {
    stopTimer();
    setPhase('idle');
    setTimeLeft(workDuration * 60);
    setSessions(0);
  };

  const skip = () => {
    stopTimer();
    if (phase === 'working') {
      const isLong = (sessions + 1) % 4 === 0;
      setPhase(isLong ? 'longBreak' : 'break');
      setTimeLeft(isLong ? longBreakDuration * 60 : breakDuration * 60);
    } else {
      setPhase('working');
      setTimeLeft(workDuration * 60);
    }
  };

  const format = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const accent = state.settings.accentColor || '#7aa2f7';
  const phaseColor = phase === 'working' ? '#f87171' : phase === 'break' ? '#4ade80' : phase === 'longBreak' ? '#60a5fa' : accent;

  const circumference = 2 * Math.PI * 54;
  const progress = (1 - timeLeft / (phase === 'working' ? workDuration * 60 : phase === 'break' ? breakDuration * 60 : phase === 'longBreak' ? longBreakDuration * 60 : workDuration * 60)) * circumference;

  return (
    <div className="fixed bottom-20 right-6 w-56 rounded-2xl overflow-hidden shadow-2xl z-50"
      style={{ background: 'rgba(15,15,25,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-medium" style={{ color: phaseColor }}>Pomodoro</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sessions}/4</span>
      </div>

      <div className="flex flex-col items-center py-5 gap-3">
        {/* Circle timer */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={phaseColor}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tracking-wider" style={{ color: phaseColor, fontFamily: 'monospace' }}>
              {format(timeLeft)}
            </span>
            <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {phase === 'idle' ? 'Ready' : phase === 'working' ? 'Focus' : phase === 'break' ? 'Break' : 'Long Break'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={isRunning ? stopTimer : startTimer}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
            style={{ background: phaseColor, color: '#000' }}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={reset}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            title="Reset"
          >
            ↺
          </button>
          {phase !== 'idle' && (
            <button
              onClick={skip}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              title="Skip"
            >
              ⏭
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
