import { useEffect, useState } from 'react';

function getCPU() {
  // Simulate CPU usage with slight randomness
  return Math.round(20 + Math.random() * 40);
}
function getRAM() {
  // Simulate RAM ~38% usage
  return 38 + Math.round((Math.random() - 0.5) * 6);
}
function getUptime() {
  const s = Math.round(performance.now() / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function SystemMonitor() {
  const [cpu, setCpu] = useState(getCPU);
  const [ram, setRam] = useState(getRAM);
  const [uptime, setUptime] = useState(getUptime());

  useEffect(() => {
    const icpu = setInterval(() => setCpu(getCPU()), 2000);
    const iram = setInterval(() => setRam(getRAM()), 5000);
    const iup = setInterval(() => setUptime(getUptime()), 30000);
    return () => { clearInterval(icpu); clearInterval(iram); clearInterval(iup); };
  }, []);

  const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-white/30 w-6">{label}</span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[9px] text-white/40 w-7 text-right tabular-nums">{value}%</span>
    </div>
  );

  return (
    <div
      className="fixed bottom-3 left-3 z-50 rounded-xl px-3 py-2 flex flex-col gap-1.5"
      style={{
        background: 'rgba(8, 8, 18, 0.72)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.32)',
        minWidth: '130px',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/30 uppercase tracking-wider">System</span>
        <span className="text-[9px] text-white/20">{uptime}</span>
      </div>
      <Bar label="CPU" value={cpu} color="linear-gradient(90deg, #7aa2f7, #89b4fa)" />
      <Bar label="RAM" value={ram} color="linear-gradient(90deg, #a6e3a1, #94e2d5)" />
    </div>
  );
}
