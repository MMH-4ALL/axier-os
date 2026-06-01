import { useState, useEffect } from 'react';
import { useOS } from '@/store/OSContext';

export default function ClipboardHUD() {
  const { state } = useOS();
  const [visible, setVisible] = useState(false);
  const [lastItem, setLastItem] = useState<string>('');

  useEffect(() => {
    if (state.clipboard.length > 0) {
      const latest = state.clipboard[0];
      if (latest.text !== lastItem) {
        setLastItem(latest.text);
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(t);
      }
    }
  }, [state.clipboard]);

  if (!visible) return null;

  const truncated = lastItem.length > 80 ? lastItem.slice(0, 80) + '…' : lastItem;
  const isMultiLine = lastItem.includes('\n');

  return (
    <div
      className="fixed bottom-20 right-6 z-[100]"
      style={{ animation: 'clip-pop 0.25s cubic-bezier(0.22,1,0.36,1)' }}
    >
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 max-w-xs"
        style={{
          background: 'rgba(8, 8, 18, 0.88)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div className="text-lg">📋</div>
        <div>
          <div className="text-xs font-medium text-white/80">Copied</div>
          <div className="text-[11px] text-white/40 mt-0.5 leading-relaxed"
            style={{ whiteSpace: isMultiLine ? 'pre-line' : 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {truncated}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes clip-pop {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
