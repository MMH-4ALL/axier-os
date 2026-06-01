import React, { useState } from 'react';
import { useOS } from '@/store/OSContext';

const dockApps = ['terminal', 'files', 'browser', 'editor', 'notes', 'music', 'settings', 'store'];

export default function Dock() {
  const { state, openApp, apps, currentTheme } = useOS();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getScale = (idx: number) => {
    if (hoveredIdx === null) return 1;
    const dist = Math.abs(idx - hoveredIdx);
    if (dist === 0) return 1.3;
    if (dist === 1) return 1.15;
    if (dist === 2) return 1.05;
    return 1;
  };

  const openWindows = state.windows.filter(w => !w.isMinimized);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-end gap-1 px-3 py-2 rounded-2xl"
      style={{
        background: 'rgba(10, 10, 22, 0.42)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {dockApps.map((appId, idx) => {
        const app = apps.find(a => a.id === appId);
        if (!app) return null;
        const hasWindow = openWindows.some(w => w.appId === appId);
        const scale = getScale(idx);

        return (
          <button
            key={appId}
            className="relative flex flex-col items-center group transition-transform duration-200 ease-out"
            style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => openApp(appId)}
          >
            {/* Tooltip */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#0f1117',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              {app.name}
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: hasWindow ? `${currentTheme.colors.primary}25` : `${currentTheme.colors.surfaceAlt}80`,
                border: `1px solid ${hasWindow ? currentTheme.colors.primary + '40' : 'transparent'}`,
              }}
            >
              <AppIcon appId={appId} color={hasWindow ? '#ffffff' : 'rgba(255,255,255,0.85)'} size={22} />
            </div>

            {/* Indicator dot */}
            <div className="mt-1 w-1 h-1 rounded-full transition-all"
              style={{
                background: hasWindow ? currentTheme.colors.primary : 'transparent',
                transform: hasWindow ? 'scale(1)' : 'scale(0)',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function AppIcon({ appId, color, size = 20 }: { appId: string; color: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    files: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    browser: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    editor: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    store: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    music: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
    notes: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  };

  return icons[appId] || null;
}
