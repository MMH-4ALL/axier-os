import React, { useState } from 'react';
import { useOS } from '@/store/OSContext';
import { themes, wallpapers, accentColors } from '@/themes';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

type SettingsTab = 'appearance' | 'terminal' | 'system';

export default function Settings({ windowId: _windowId }: Props) {
  const { state, dispatch, currentTheme } = useOS();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const updateSetting = (key: string, value: unknown) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: value } });
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> },
    { id: 'terminal', label: 'Terminal', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg> },
    { id: 'system', label: 'System', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
  ];

  const filteredThemes = Object.values(themes).filter(t =>
    t.id !== 'secret-axier' || state.secretThemeUnlocked
  );

  return (
    <div className="w-full h-full flex" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Sidebar */}
      <div className="w-44 border-r flex flex-col" style={{ borderColor: currentTheme.colors.border, background: currentTheme.colors.surface }}>
        <div className="p-3">
          <h2 className="text-sm font-semibold mb-1">Settings</h2>
          <p className="text-[10px] opacity-40">Customize your system</p>
        </div>
        <nav className="flex-1 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all mb-0.5 ${
                activeTab === tab.id ? 'font-medium' : 'opacity-60 hover:opacity-100'
              }`}
              style={activeTab === tab.id ? { background: `${currentTheme.colors.primary}20`, color: currentTheme.colors.primary } : {}}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {filteredThemes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('theme', theme.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      state.settings.theme === theme.id ? 'ring-2' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: theme.colors.background,
                      borderColor: state.settings.theme === theme.id ? theme.colors.primary : theme.colors.border,
                      outline: state.settings.theme === theme.id ? `2px solid ${theme.colors.primary}` : 'none', outlineOffset: '2px',
                    }}
                  >
                    <div className="text-xs font-medium mb-1" style={{ color: theme.colors.text }}>{theme.name}</div>
                    <div className="flex gap-1">
                      {['primary', 'accent', 'success', 'warning', 'error'].map(c => (
                        <div key={c} className="w-3 h-3 rounded-full" style={{ background: theme.colors[c as keyof typeof theme.colors] }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Wallpaper</h3>
              <div className="grid grid-cols-3 gap-2">
                {wallpapers.map(wp => (
                  <button
                    key={wp.id}
                    onClick={() => updateSetting('wallpaper', wp.id)}
                    className={`h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      state.settings.wallpaper === wp.id ? 'ring-2' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: wp.gradient || wp.color || '#333',
                      borderColor: state.settings.wallpaper === wp.id ? currentTheme.colors.primary : 'transparent',
                      backgroundImage: wp.url ? `url(${wp.url})` : undefined,
                      backgroundSize: 'cover',
                    }}
                  >
                    <span className="text-[10px] px-2 py-1 rounded" style={{
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                    }}>{wp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Accent Color</h3>
              <div className="flex flex-wrap gap-2">
                {accentColors.map(color => (
                  <button
                    key={color}
                    onClick={() => updateSetting('accentColor', color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      state.settings.accentColor === color ? 'ring-2 ring-offset-2 ring-offset-transparent scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      background: color,
                      outline: state.settings.accentColor === color ? `2px solid ${color}` : 'none', outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Icon Pack</h3>
              <div className="flex gap-2">
                {(['default', 'pixel'] as const).map(pack => (
                  <button
                    key={pack}
                    onClick={() => updateSetting('iconPack', pack)}
                    className={`px-4 py-2 rounded-lg text-xs border transition-all capitalize ${
                      state.settings.iconPack === pack ? 'ring-1' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: currentTheme.colors.surface,
                      borderColor: state.settings.iconPack === pack ? currentTheme.colors.primary : currentTheme.colors.border,
                    }}
                  >
                    {pack}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Terminal Theme</h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(themes).filter(t => t.id !== 'secret-axier' || state.secretThemeUnlocked).map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateSetting('terminal', { ...state.settings.terminal, theme: t.id })}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      state.settings.terminal.theme === t.id ? 'ring-1' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: t.terminal.background,
                      borderColor: state.settings.terminal.theme === t.id ? t.terminal.cyan : t.terminal.foreground + '40',
                      color: t.terminal.foreground,
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Font Size</h3>
              <input
                type="range"
                min="10"
                max="22"
                value={state.settings.terminal.fontSize}
                onChange={e => updateSetting('terminal', { ...state.settings.terminal, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs opacity-50 mt-1">{state.settings.terminal.fontSize}px</div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Cursor Style</h3>
              <div className="flex gap-2">
                {(['block', 'line', 'underline'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => updateSetting('terminal', { ...state.settings.terminal, cursorStyle: style })}
                    className={`px-4 py-2 rounded-lg text-xs border capitalize transition-all ${
                      state.settings.terminal.cursorStyle === style ? 'ring-1' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: currentTheme.colors.surface,
                      borderColor: state.settings.terminal.cursorStyle === style ? currentTheme.colors.primary : currentTheme.colors.border,
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">System Information</h3>
              <div className="rounded-lg p-4 space-y-2 text-xs" style={{ background: currentTheme.colors.surface }}>
                <div className="flex justify-between"><span className="opacity-60">OS</span><span>Axier OS 1.0</span></div>
                <div className="flex justify-between"><span className="opacity-60">Kernel</span><span>6.8.0-axier-custom</span></div>
                <div className="flex justify-between"><span className="opacity-60">Architecture</span><span>x86_64</span></div>
                <div className="flex justify-between"><span className="opacity-60">Desktop</span><span>AxierDesktop</span></div>
                <div className="flex justify-between"><span className="opacity-60">Window Manager</span><span>AxierWM</span></div>
                <div className="flex justify-between"><span className="opacity-60">Shell</span><span>axsh 2.1.0</span></div>
                <div className="flex justify-between"><span className="opacity-60">Packages</span><span>{state.packages.filter(p => p.installed).length} installed</span></div>
                <div className="flex justify-between"><span className="opacity-60">Theme</span><span>{currentTheme.name}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Clock</h3>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs">Show Clock</span>
                <button
                  onClick={() => updateSetting('showClock', !state.settings.showClock)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${state.settings.showClock ? '' : 'opacity-40'}`}
                  style={{ background: state.settings.showClock ? currentTheme.colors.primary : currentTheme.colors.border }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${state.settings.showClock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {(['12h', '24h'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => updateSetting('clockFormat', fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      state.settings.clockFormat === fmt ? 'ring-1' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: currentTheme.colors.surface,
                      borderColor: state.settings.clockFormat === fmt ? currentTheme.colors.primary : currentTheme.colors.border,
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Boot Animation</h3>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs">Show Boot Sequence</span>
                <button
                  onClick={() => updateSetting('bootAnimation', !state.settings.bootAnimation)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${state.settings.bootAnimation ? '' : 'opacity-40'}`}
                  style={{ background: state.settings.bootAnimation ? currentTheme.colors.primary : currentTheme.colors.border }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${state.settings.bootAnimation ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Window Animations</h3>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs">Enable Animations</span>
                <button
                  onClick={() => updateSetting('animations', !state.settings.animations)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${state.settings.animations ? '' : 'opacity-40'}`}
                  style={{ background: state.settings.animations ? currentTheme.colors.primary : currentTheme.colors.border }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${state.settings.animations ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
              <h3 className="text-sm font-medium mb-3 text-red-400">Data</h3>
              <button
                onClick={() => {
                  if (confirm('Reset all settings to default?')) {
                    localStorage.removeItem('axier-os-state');
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
