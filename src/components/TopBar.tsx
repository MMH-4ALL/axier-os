import { useState, useEffect, useRef } from 'react';
import { useOS } from '@/store/OSContext';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function TopBar() {
  const { state, dispatch, currentTheme, openApp } = useOS();
  const [time, setTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close calendar when clicking outside
  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (clockRef.current && !clockRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const menuItems: Record<string, { label: string; action: () => void; separator?: boolean }[]> = {
    AXIER: [
      { label: 'About Axier OS', action: () => openApp('browser', { url: 'axier://about' }) },
      { label: 'Settings', action: () => openApp('settings') },
      { label: 'Separator', action: () => {}, separator: true },
      { label: 'Lock Screen', action: () => dispatch({ type: 'SET_VIEW', view: 'lock' }) },
    ],
    File: [
      { label: 'New Window', action: () => openApp('files') },
      { label: 'New File', action: () => openApp('editor') },
      { label: 'Separator', action: () => {}, separator: true },
      { label: 'Close All', action: () => state.windows.forEach(w => dispatch({ type: 'CLOSE_WINDOW', windowId: w.id })) },
    ],
    View: [
      { label: 'Terminal', action: () => openApp('terminal') },
      { label: 'Browser', action: () => openApp('browser') },
      { label: 'File Manager', action: () => openApp('files') },
      { label: 'Notes', action: () => openApp('notes') },
    ],
  };

  // Calendar logic
  const getCalDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const calDays = getCalDays(calMonth.getFullYear(), calMonth.getMonth());
  const today = new Date();
  const isToday = (d: number | null) =>
    d !== null &&
    d === today.getDate() &&
    calMonth.getMonth() === today.getMonth() &&
    calMonth.getFullYear() === today.getFullYear();

  const prevMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1));

  return (
    <div
      className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-3 text-xs"
      style={{
        background: `${currentTheme.colors.surface}E6`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${currentTheme.colors.border}40`,
        color: currentTheme.colors.text,
      }}
    >
      {/* Left - Menus */}
      <div className="flex items-center gap-1">
        {Object.entries(menuItems).map(([name, items]) => (
          <div key={name} className="relative">
            <button
              className="px-2 py-0.5 rounded transition-colors hover:bg-white/10 font-semibold"
              onClick={() => setShowMenu(showMenu === name ? null : name)}
              style={{ color: name === 'AXIER' ? currentTheme.colors.primary : undefined }}
            >
              {name}
            </button>
            {showMenu === name && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
                <div
                  className="absolute top-full left-0 mt-0.5 py-1 rounded-lg shadow-xl z-50 min-w-[160px]"
                  style={{ background: currentTheme.colors.surface, border: `1px solid ${currentTheme.colors.border}` }}
                >
                  {items.map((item, idx) =>
                    item.separator ? (
                      <div key={idx} className="my-1 border-t" style={{ borderColor: currentTheme.colors.border }} />
                    ) : (
                      <button
                        key={idx}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
                        style={{ color: currentTheme.colors.text }}
                        onClick={() => { item.action(); setShowMenu(null); }}
                      >
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Center - Window Title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-xs font-medium opacity-60 truncate max-w-[200px]">
        {state.windows.find(w => w.isFocused)?.title || 'Axier OS'}
      </div>

      {/* Right - System Icons */}
      <div className="flex items-center gap-2">
        {/* Battery */}
        <div className="flex items-center gap-1 opacity-70" title="Battery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="10" x2="23" y2="14" />
          </svg>
        </div>

        {/* Wifi */}
        <div className="flex items-center gap-1 opacity-70" title="WiFi">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>

        {/* Notifications */}
        <button
          className="relative flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          onClick={() => { setShowNotif(!showNotif); setShowCalendar(false); }}
          title="Notifications"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center font-bold"
              style={{ background: currentTheme.colors.accent, color: '#fff' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Clock — clickable, opens calendar */}
        {state.settings.showClock && (
          <div className="relative" ref={clockRef}>
            <button
              className="font-medium tabular-nums min-w-[70px] text-right hover:opacity-80 transition-opacity cursor-pointer px-1 py-0.5 rounded"
              style={{ color: currentTheme.colors.text }}
              onClick={() => { setShowCalendar(!showCalendar); setShowNotif(false); }}
              title="Click for calendar"
            >
              {time.toLocaleTimeString('en-US', {
                hour: state.settings.clockFormat === '12h' ? 'numeric' : '2-digit',
                minute: '2-digit',
                hour12: state.settings.clockFormat === '12h',
              })}
              <span className="ml-1 text-[10px] opacity-60">
                {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </button>

            {/* Calendar Popup */}
            {showCalendar && (
              <div
                className="absolute top-full right-0 mt-1 rounded-xl shadow-2xl z-50 p-3 select-none"
                style={{
                  background: currentTheme.colors.surface,
                  border: `1px solid ${currentTheme.colors.border}`,
                  width: '220px',
                }}
              >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                    onClick={prevMonth}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <div className="text-xs font-semibold">
                    {MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
                  </div>
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                    onClick={nextMonth}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[9px] font-medium opacity-40 py-0.5">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calDays.map((day, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center">
                      {day !== null && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-colors ${
                            isToday(day) ? 'font-bold' : ''
                          }`}
                          style={
                            isToday(day)
                              ? {
                                  background: currentTheme.colors.primary,
                                  color: '#fff',
                                  boxShadow: `0 0 6px ${currentTheme.colors.primary}80`,
                                }
                              : { color: currentTheme.colors.text }
                          }
                        >
                          {day}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Full date below */}
                <div
                  className="mt-3 pt-2 text-center text-[10px] opacity-40"
                  style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}
                >
                  {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Dropdown */}
      {showNotif && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
          <div
            className="absolute top-full right-0 mt-1 py-2 rounded-xl shadow-2xl z-50 w-80 max-h-96 overflow-y-auto"
            style={{ background: currentTheme.colors.surface, border: `1px solid ${currentTheme.colors.border}` }}
          >
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider opacity-50" style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}>
              Notifications
            </div>
            {state.notifications.length === 0 ? (
              <div className="px-3 py-4 text-xs text-center opacity-40">No notifications</div>
            ) : (
              state.notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  className="px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => { dispatch({ type: 'READ_NOTIFICATION', id: n.id }); }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ background: n.read ? 'transparent' : currentTheme.colors.primary, border: n.read ? `1px solid ${currentTheme.colors.border}` : 'none' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{n.title}</div>
                      <div className="text-[10px] opacity-60 truncate">{n.message}</div>
                      <div className="text-[9px] opacity-40 mt-0.5">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
