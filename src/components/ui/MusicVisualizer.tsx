import { useEffect, useRef } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MusicVisualizer({ isOpen, onToggle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { currentTheme } = useOS();

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const accent = currentTheme.colors.accent || '#7aa2f7';
    const secondary = currentTheme.colors.info || '#9d7cd8';
    const bars = 48;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background glow
      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, `${accent}22`);
      grad.addColorStop(1, `${secondary}11`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barW = canvas.width / bars;
      const time = Date.now() * 0.002;

      for (let i = 0; i < bars; i++) {
        const h = (Math.sin(time + i * 0.4) * 0.5 + 0.5) * canvas.height * 0.7
                + (Math.sin(time * 1.7 + i * 0.7) * 0.3) * canvas.height * 0.5;

        const barGrad = ctx.createLinearGradient(0, canvas.height - h, 0, canvas.height);
        barGrad.addColorStop(0, accent);
        barGrad.addColorStop(1, `${accent}44`);

        ctx.fillStyle = barGrad;
        ctx.fillRect(i * barW + 1, canvas.height - h, barW - 2, h);

        // Top glow dot
        if (h > 10) {
          ctx.beginPath();
          ctx.arc(i * barW + barW / 2, canvas.height - h, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffffaa';
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isOpen, currentTheme]);

  if (!isOpen) return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
      title="Toggle Visualizer"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="14" width="3" height="6" rx="1"/>
        <rect x="7" y="8" width="3" height="12" rx="1"/>
        <rect x="12" y="4" width="3" height="16" rx="1"/>
        <rect x="17" y="10" width="3" height="10" rx="1"/>
      </svg>
    </button>
  );

  return (
    <div className="mt-2">
      <div className="flex justify-end mb-1">
        <button onClick={onToggle} className="text-xs opacity-60 hover:opacity-100 transition-opacity">Hide</button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: '80px', display: 'block' }}
      />
    </div>
  );
}
