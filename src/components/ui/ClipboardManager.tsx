import { useOS } from '@/store/OSContext';

interface Props {
  onClose: () => void;
}

export default function ClipboardManager({ onClose }: Props) {
  const { state, dispatch, copyToClipboard } = useOS();
  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setTimeout(() => onClose(), 150);
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_CLIPBOARD' });
  };

  const accent = state.settings.accentColor || '#7aa2f7';

  return (
    <div
      className="fixed bottom-20 right-6 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
      style={{ background: 'rgba(15,15,25,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: accent }}>Clipboard History</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${accent}22`, color: accent }}>
            {state.clipboard.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {state.clipboard.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              title="Clear all"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="max-h-64 overflow-y-auto">
        {state.clipboard.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No clipboard history
          </div>
        ) : (
          state.clipboard.map(item => (
            <div
              key={item.id}
              className="px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => handleCopy(item.text)}
            >
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {item.text}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Click to re-copy</span>
      </div>
    </div>
  );
}
