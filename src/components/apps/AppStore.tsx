import { useState } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

type Category = 'All' | 'System' | 'Fun' | 'Network' | 'Development' | 'Media';

const categories: Category[] = ['All', 'System', 'Fun', 'Network', 'Development', 'Media'];

export default function AppStore({ windowId: _windowId }: Props) {
  const { state, dispatch, currentTheme, sendNotification } = useOS();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [installing, setInstalling] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = state.packages.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = (id: string) => {
    setInstalling(id);
    setTimeout(() => {
      dispatch({ type: 'PKG_INSTALL', id });
      setInstalling(null);
      const pkg = state.packages.find(p => p.id === id);
      if (pkg) sendNotification('App Store', `${pkg.name} installed successfully`, 'success');
    }, 1200);
  };

  const handleUninstall = (id: string) => {
    dispatch({ type: 'PKG_UNINSTALL', id });
    const pkg = state.packages.find(p => p.id === id);
    if (pkg) sendNotification('App Store', `${pkg.name} removed`, 'info');
  };

  const installedCount = state.packages.filter(p => p.installed).length;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">App Store</h2>
            <p className="text-[10px] opacity-50">{installedCount} apps installed</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search packages..."
          className="w-full px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, border: `1px solid ${currentTheme.colors.border}` }}
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b" style={{ borderColor: currentTheme.colors.border }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-[10px] whitespace-nowrap transition-all ${
              activeCategory === cat ? 'font-medium' : 'opacity-50 hover:opacity-80'
            }`}
            style={activeCategory === cat ? { background: `${currentTheme.colors.primary}25`, color: currentTheme.colors.primary } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Package List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {filtered.map(pkg => (
            <div
              key={pkg.id}
              className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01]"
              style={{ background: currentTheme.colors.surface, border: `1px solid ${currentTheme.colors.border}40` }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${currentTheme.colors.primary}15` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.primary} strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">{pkg.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: currentTheme.colors.surfaceAlt, color: currentTheme.colors.textSecondary }}>
                    v{pkg.version}
                  </span>
                  {pkg.installed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${currentTheme.colors.success}25`, color: currentTheme.colors.success }}>
                      installed
                    </span>
                  )}
                </div>
                <p className="text-[10px] truncate mt-0.5" style={{ color: currentTheme.colors.textSecondary }}>{pkg.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textSecondary }}>{pkg.category}</span>
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textSecondary }}>{pkg.size}</span>
                </div>
              </div>

              {/* Action */}
              {pkg.installed ? (
                <button
                  onClick={() => handleUninstall(pkg.id)}
                  className="px-3 py-1.5 rounded-lg text-[10px] border transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                  style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.textSecondary }}
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(pkg.id)}
                  disabled={installing === pkg.id}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all disabled:opacity-50"
                  style={{
                    background: installing === pkg.id ? currentTheme.colors.surfaceAlt : currentTheme.colors.primary,
                    color: installing === pkg.id ? currentTheme.colors.textSecondary : '#fff',
                  }}
                >
                  {installing === pkg.id ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-xs">No packages found</p>
          </div>
        )}
      </div>
    </div>
  );
}
