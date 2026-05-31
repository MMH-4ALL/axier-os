import { useEffect } from 'react';
import { useOS } from '@/store/OSContext';

export default function NotificationCenter() {
  const { state, dispatch, currentTheme } = useOS();

  const recentNotifications = state.notifications.filter(n => !n.read).slice(0, 5);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    recentNotifications.forEach(n => {
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', id: n.id });
      }, 8000);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [recentNotifications.map(n => n.id).join(','), dispatch]);

  if (recentNotifications.length === 0) return null;

  return (
    <div className="fixed top-9 right-3 z-50 flex flex-col gap-2 w-80">
      {recentNotifications.map(n => (
        <div
          key={n.id}
          className="notif-enter rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all"
          style={{
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          onClick={() => dispatch({ type: 'READ_NOTIFICATION', id: n.id })}
        >
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: getNotifColor(n.type, currentTheme) }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold" style={{ color: currentTheme.colors.text }}>{n.title}</div>
              <div className="text-[11px] opacity-70 mt-0.5 leading-relaxed" style={{ color: currentTheme.colors.text }}>{n.message}</div>
            </div>
            <button
              className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DISMISS_NOTIFICATION', id: n.id }); }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getNotifColor(type: string, theme: { colors: Record<string, string> }): string {
  switch (type) {
    case 'success': return theme.colors.success;
    case 'warning': return theme.colors.warning;
    case 'error': return theme.colors.error;
    default: return theme.colors.info;
  }
}
