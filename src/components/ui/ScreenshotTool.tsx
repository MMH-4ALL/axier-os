import { useState } from 'react';
import html2canvas from 'html2canvas';
import { useOS } from '@/store/OSContext';

interface Props {
  onClose: () => void;
}

export default function ScreenshotTool({ onClose }: Props) {
  const { currentTheme } = useOS();
  const [status, setStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const capture = async () => {
    setStatus('capturing');
    setError('');
    try {
      // Capture the desktop (body/root element)
      const target = document.getElementById('root') || document.body;
      const canvas = await html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a14',
        scale: window.devicePixelRatio || 1,
        logging: false,
        removeContainer: true,
      });

      canvas.toBlob(blob => {
        if (!blob) { setStatus('error'); setError('Failed to create image'); return; }
        // Try to download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screenshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('success');
        setTimeout(onClose, 1500);
      }, 'image/png');
    } catch (e: unknown) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Capture failed');
    }
  };

  const copyToClipboard = async () => {
    setStatus('capturing');
    setError('');
    try {
      const target = document.getElementById('root') || document.body;
      const canvas = await html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a14',
        scale: window.devicePixelRatio || 1,
        logging: false,
        removeContainer: true,
      });
      canvas.toBlob(async blob => {
        if (!blob) { setStatus('error'); setError('Failed to create image'); return; }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setStatus('success');
          setTimeout(onClose, 1500);
        } catch {
          // Fallback to download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `screenshot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          setStatus('success');
          setTimeout(onClose, 1500);
        }
      }, 'image/png');
    } catch (e: unknown) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Capture failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-2xl p-6 w-80 text-center"
        style={{
          background: currentTheme.colors.surface,
          border: `1px solid ${currentTheme.colors.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          color: currentTheme.colors.text,
        }}
      >
        <div className="text-4xl mb-3">📸</div>
        <h2 className="text-base font-semibold mb-1">Screenshot</h2>
        <p className="text-xs opacity-60 mb-5">Capture your desktop</p>

        {status === 'capturing' && (
          <div className="mb-4 text-xs opacity-70">Capturing...</div>
        )}
        {status === 'success' && (
          <div className="mb-4 text-xs" style={{ color: currentTheme.colors.textSecondary }}>✓ Saved to Downloads!</div>
        )}
        {status === 'error' && (
          <div className="mb-4 text-xs" style={{ color: '#ef4444' }}>{error}</div>
        )}

        <div className="flex flex-col gap-2">
          <button
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: currentTheme.colors.primary, color: '#fff' }}
            onClick={capture}
            disabled={status === 'capturing'}
          >
            💾 Save to Downloads
          </button>
          <button
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: `${currentTheme.colors.primary}33`, color: currentTheme.colors.primary, border: `1px solid ${currentTheme.colors.primary}40` }}
            onClick={copyToClipboard}
            disabled={status === 'capturing'}
          >
            📋 Copy to Clipboard
          </button>
          <button
            className="w-full py-2 rounded-xl text-xs opacity-60 hover:opacity-80 transition-opacity"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
