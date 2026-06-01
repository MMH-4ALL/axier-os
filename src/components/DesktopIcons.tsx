import React, { useState } from 'react';
import { useOS } from '@/store/OSContext';

const desktopIcons = [
  { appId: 'files', label: 'Files', x: 20, y: 40 },
  { appId: 'terminal', label: 'Terminal', x: 20, y: 120 },
  { appId: 'browser', label: 'Browser', x: 20, y: 200 },
  { appId: 'notes', label: 'Notes', x: 20, y: 280 },
  { appId: 'settings', label: 'Settings', x: 20, y: 360 },
];

export default function DesktopIcons() {
  const { openApp, currentTheme } = useOS();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="absolute top-7 left-0 bottom-16 w-28 pt-4 flex flex-col gap-2 z-10">
      {desktopIcons.map(icon => (
        <button
          key={icon.appId}
          className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-150 group w-24 mx-auto"
          style={{
            background: hovered === icon.appId ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onMouseEnter={() => setHovered(icon.appId)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => openApp(icon.appId)}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: `${currentTheme.colors.surface}90`, border: `1px solid ${currentTheme.colors.border}40` }}>
            <DesktopIcon appId={icon.appId} color={currentTheme.colors.text} size={24} />
          </div>
          <span className="text-[10px] font-medium text-center leading-tight max-w-full truncate px-1"
            style={{
              color: hovered === icon.appId ? '#fff' : 'rgba(255,255,255,0.8)',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}>
            {icon.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function DesktopIcon({ appId, color, size = 24 }: { appId: string; color: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    files: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    browser: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    notes: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };

  return icons[appId] || null;
}
