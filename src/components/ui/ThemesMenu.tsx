import { useEffect, useRef } from 'react';
import { useOS } from '@/store/OSContext';
import { themes } from '@/themes';

interface Props {
  onClose: () => void;
}

const THEME_PREVIEWS: Record<string, { bg: string; accent: string; text: string; secondary: string }> = {
  axier:    { bg: '#0a0a1a', accent: '#7aa2f7', text: '#c0caf5', secondary: '#9d7cd8' },
  nord:     { bg: '#2e3440', accent: '#88c0d0', text: '#eceff4', secondary: '#81a1c1' },
  dracula:  { bg: '#282a36', accent: '#bd93f9', text: '#f8f8f2', secondary: '#ff79c6' },
  gruvbox:  { bg: '#282828', accent: '#fabd2f', text: '#ebdbb2', secondary: '#fb4934' },
  monokai:  { bg: '#272822', accent: '#f92672', text: '#f8f8f2', secondary: '#a6e22e' },
  solarized:{ bg: '#002b36', accent: '#268bd2', text: '#839496', secondary: '#2aa198' },
};

export default function ThemesMenu({ onClose }: Props) {
  const { state, dispatch } = useOS();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const currentThemeId = state.settings.theme;

  return (
    <div
      ref={ref}
      className="absolute top-full right-4 mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl z-[200]"
      style={{ background: 'rgba(20,20,30,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="px-4 py-2.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        Appearance
      </div>
      <div className="py-2">
        {Object.entries(themes).map(([id, theme]) => {
          const preview = THEME_PREVIEWS[id] || THEME_PREVIEWS.axier;
          const isActive = currentThemeId === id;
          return (
            <button
              key={id}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
              onClick={() => {
                dispatch({ type: 'UPDATE_SETTINGS', settings: { theme: id } });
                onClose();
              }}
            >
              {/* Color swatches */}
              <div className="flex items-center gap-1 w-12">
                <div className="w-5 h-5 rounded-full" style={{ background: preview.bg, border: '2px solid rgba(255,255,255,0.15)' }} />
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: preview.accent }} />
                <div className="w-3 h-3 rounded-full" style={{ background: preview.secondary }} />
              </div>
              <span className="flex-1 text-left text-sm" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                {theme.name || id.charAt(0).toUpperCase() + id.slice(1)}
              </span>
              {isActive && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={preview.accent} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
