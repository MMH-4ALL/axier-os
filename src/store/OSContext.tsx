import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { WindowState, AppDefinition, Notification, FileSystemNode, Package, Note, OSSettings, DesktopView } from '@/types';
import { themes, wallpapers } from '@/themes';

const APPS: AppDefinition[] = [
  { id: 'terminal', name: 'Terminal', icon: 'terminal', category: 'system', defaultSize: { width: 750, height: 480 }, minSize: { width: 400, height: 300 }, canResize: true },
  { id: 'files', name: 'File Manager', icon: 'folder', category: 'system', defaultSize: { width: 800, height: 500 }, minSize: { width: 500, height: 350 }, canResize: true },
  { id: 'browser', name: 'Browser', icon: 'globe', category: 'utility', defaultSize: { width: 900, height: 600 }, minSize: { width: 600, height: 400 }, canResize: true },
  { id: 'settings', name: 'Settings', icon: 'settings', category: 'system', defaultSize: { width: 700, height: 550 }, minSize: { width: 500, height: 400 }, canResize: true },
  { id: 'editor', name: 'Text Editor', icon: 'file-text', category: 'dev', defaultSize: { width: 700, height: 500 }, minSize: { width: 400, height: 300 }, canResize: true },
  { id: 'store', name: 'App Store', icon: 'package', category: 'utility', defaultSize: { width: 800, height: 550 }, minSize: { width: 600, height: 400 }, canResize: true },
  { id: 'music', name: 'Music Player', icon: 'music', category: 'media', defaultSize: { width: 500, height: 400 }, minSize: { width: 350, height: 300 }, canResize: false },
  { id: 'notes', name: 'Notes', icon: 'sticky-note', category: 'utility', defaultSize: { width: 600, height: 500 }, minSize: { width: 400, height: 350 }, canResize: true },
];

const DEFAULT_FS: FileSystemNode[] = [
  { id: 'root', name: '/', type: 'folder', parentId: null, createdAt: new Date().toISOString() },
  { id: 'home', name: 'home', type: 'folder', parentId: 'root', createdAt: new Date().toISOString() },
  { id: 'user', name: 'user', type: 'folder', parentId: 'home', createdAt: new Date().toISOString() },
  { id: 'docs', name: 'Documents', type: 'folder', parentId: 'user', createdAt: new Date().toISOString() },
  { id: 'pics', name: 'Pictures', type: 'folder', parentId: 'user', createdAt: new Date().toISOString() },
  { id: 'music', name: 'Music', type: 'folder', parentId: 'user', createdAt: new Date().toISOString() },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'user', createdAt: new Date().toISOString() },
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'user', createdAt: new Date().toISOString() },
  { id: 'readme', name: 'README.txt', type: 'file', parentId: 'user', content: 'Welcome to Axier OS!\n\nThis is a web-based operating system.\nExplore the terminal and built-in applications.\n\nType "help" in the terminal for available commands.\n\n---\nAxier OS v1.0', createdAt: new Date().toISOString(), size: 128, mimeType: 'text/plain' },
  { id: 'welcome', name: 'Welcome.md', type: 'file', parentId: 'docs', content: '# Welcome to Axier OS\n\nAxier OS is a futuristic, Linux-inspired web operating system.\n\n## Features\n- Full terminal emulator\n- Window manager\n- File system\n- Multiple themes\n- Built-in applications\n\n## Getting Started\nOpen the Terminal app and type `help` to see available commands.\n\n## Themes\nAxier OS supports multiple themes including:\n- Axier Default\n- Nord\n- Dracula\n- Catppuccin\n- Retro Terminal\n\nEnjoy exploring!', createdAt: new Date().toISOString(), size: 256, mimeType: 'text/markdown' },
  { id: 'todo', name: 'todo.txt', type: 'file', parentId: 'docs', content: '- [ ] Explore the terminal\n- [ ] Change the wallpaper\n- [ ] Install packages from the store\n- [ ] Try different themes\n- [ ] Find the easter eggs', createdAt: new Date().toISOString(), size: 96, mimeType: 'text/plain' },
  { id: 'sys', name: 'sys', type: 'folder', parentId: 'root', createdAt: new Date().toISOString() },
  { id: 'bin', name: 'bin', type: 'folder', parentId: 'root', createdAt: new Date().toISOString() },
  { id: 'etc', name: 'etc', type: 'folder', parentId: 'root', createdAt: new Date().toISOString() },
];

const DEFAULT_PACKAGES: Package[] = [
  { id: 'neofetch', name: 'neofetch', description: 'System information tool with ASCII art', version: '7.1.0', category: 'System', installed: true, size: '156 KB' },
  { id: 'htop', name: 'htop', description: 'Interactive process viewer', version: '3.2.1', category: 'System', installed: true, size: '234 KB' },
  { id: 'cmatrix', name: 'cmatrix', description: 'Simulates the display from The Matrix', version: '2.0', category: 'Fun', installed: false, size: '89 KB' },
  { id: 'cowsay', name: 'cowsay', description: 'Configurable talking cow', version: '3.04', category: 'Fun', installed: false, size: '45 KB' },
  { id: 'figlet', name: 'figlet', description: 'Make large letters out of ordinary text', version: '2.2.5', category: 'Fun', installed: false, size: '178 KB' },
  { id: 'curl', name: 'curl', description: 'Transfer data with URLs', version: '7.88.1', category: 'Network', installed: true, size: '412 KB' },
  { id: 'wget', name: 'wget', description: 'Network downloader', version: '1.21.3', category: 'Network', installed: false, size: '356 KB' },
  { id: 'vim', name: 'vim', description: 'Vi IMproved text editor', version: '9.0', category: 'Development', installed: true, size: '2.1 MB' },
  { id: 'git', name: 'git', description: 'Distributed version control', version: '2.40.0', category: 'Development', installed: false, size: '18.5 MB' },
  { id: 'node', name: 'nodejs', description: 'JavaScript runtime', version: '18.15.0', category: 'Development', installed: false, size: '32.4 MB' },
  { id: 'python', name: 'python3', description: 'Python programming language', version: '3.11.2', category: 'Development', installed: true, size: '24.8 MB' },
  { id: 'docker', name: 'docker', description: 'Container platform', version: '23.0.1', category: 'Development', installed: false, size: '85.2 MB' },
  { id: 'ffmpeg', name: 'ffmpeg', description: ' Multimedia framework', version: '6.0', category: 'Media', installed: false, size: '12.6 MB' },
  { id: 'sl', name: 'sl', description: 'Steam locomotive animation', version: '5.02', category: 'Fun', installed: false, size: '23 KB' },
];

const DEFAULT_NOTES: Note[] = [
  { id: 'note-1', title: 'Quick Notes', content: '# Quick Notes\n\n- Welcome to Axier OS Notes!\n- This app supports **Markdown**\n- Create, edit, and organize your notes\n\n## Tips\n- Use `#` for headings\n- Use `**bold**` for emphasis\n- Use `-` for lists', updatedAt: new Date().toISOString() },
  { id: 'note-2', title: 'Terminal Commands', content: '# Useful Commands\n\n| Command | Description |\n|---------|-------------|\n| `neofetch` | Show system info |\n| `help` | List all commands |\n| `ls` | List files |\n| `cd` | Change directory |\n| `cat` | View file contents |\n| `axpkg` | Package manager |\n| `cmatrix` | Matrix rain |\n| `htop` | Process viewer |', updatedAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS: OSSettings = {
  theme: 'axier',
  wallpaper: 'default-dark',
  accentColor: '#7aa2f7',
  dockPosition: 'bottom',
  dockSize: 'medium',
  showClock: true,
  clockFormat: '24h',
  terminal: { fontSize: 14, cursorStyle: 'block', theme: 'axier' },
  bootAnimation: true,
  iconPack: 'default',
  animations: true,
};

interface OSState {
  view: DesktopView;
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  notifications: Notification[];
  fs: FileSystemNode[];
  currentDir: string;
  packages: Package[];
  notes: Note[];
  settings: OSSettings;
  secretThemeUnlocked: boolean;
  bootPhase: number;
}

type OSAction =
  | { type: 'OPEN_APP'; appId: string; data?: Record<string, unknown> }
  | { type: 'CLOSE_WINDOW'; windowId: string }
  | { type: 'MINIMIZE_WINDOW'; windowId: string }
  | { type: 'MAXIMIZE_WINDOW'; windowId: string }
  | { type: 'RESTORE_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'MOVE_WINDOW'; windowId: string; position: { x: number; y: number } }
  | { type: 'RESIZE_WINDOW'; windowId: string; size: { width: number; height: number } }
  | { type: 'SET_VIEW'; view: DesktopView }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'READ_NOTIFICATION'; id: string }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'FS_ADD'; node: FileSystemNode }
  | { type: 'FS_DELETE'; id: string }
  | { type: 'FS_RENAME'; id: string; name: string }
  | { type: 'FS_UPDATE_CONTENT'; id: string; content: string }
  | { type: 'SET_CURRENT_DIR'; dirId: string }
  | { type: 'PKG_INSTALL'; id: string }
  | { type: 'PKG_UNINSTALL'; id: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; note: Note }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<OSSettings> }
  | { type: 'UNLOCK_SECRET_THEME' }
  | { type: 'SET_BOOT_PHASE'; phase: number }
  | { type: 'RESTORE_STATE'; state: Partial<OSState> };

function loadSavedState(): Partial<OSState> {
  try {
    const saved = localStorage.getItem('axier-os-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        settings: parsed.settings || DEFAULT_SETTINGS,
        fs: parsed.fs || DEFAULT_FS,
        packages: parsed.packages || DEFAULT_PACKAGES,
        notes: parsed.notes || DEFAULT_NOTES,
        secretThemeUnlocked: parsed.secretThemeUnlocked || false,
      };
    }
  } catch { /* ignore */ }
  return {
    settings: DEFAULT_SETTINGS,
    fs: DEFAULT_FS,
    packages: DEFAULT_PACKAGES,
    notes: DEFAULT_NOTES,
    secretThemeUnlocked: false,
  };
}

function createInitialState(): OSState {
  const saved = loadSavedState();
  return {
    view: 'boot',
    windows: [],
    activeWindowId: null,
    nextZIndex: 100,
    notifications: [],
    fs: saved.fs as FileSystemNode[] || DEFAULT_FS,
    currentDir: 'user',
    packages: saved.packages as Package[] || DEFAULT_PACKAGES,
    notes: saved.notes as Note[] || DEFAULT_NOTES,
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
    secretThemeUnlocked: saved.secretThemeUnlocked || false,
    bootPhase: 0,
  };
}

function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'OPEN_APP': {
      const app = APPS.find(a => a.id === action.appId);
      if (!app) return state;
      const existing = state.windows.find(w => w.appId === action.appId && !w.isMinimized);
      if (existing && !action.data) {
        return osReducer(state, { type: 'FOCUS_WINDOW', windowId: existing.id });
      }
      const offset = state.windows.length * 30;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - app.defaultSize.width - 100 : 100;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - app.defaultSize.height - 150 : 50;
      const newWindow: WindowState = {
        id: `win-${Date.now()}`,
        appId: app.id,
        title: app.name,
        position: { x: 80 + Math.min(offset, maxX - 80), y: 50 + Math.min(offset, maxY - 50) },
        size: { ...app.defaultSize },
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        zIndex: state.nextZIndex,
        data: action.data,
      };
      return {
        ...state,
        windows: [...state.windows.map(w => ({ ...w, isFocused: false })), newWindow],
        activeWindowId: newWindow.id,
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.windowId),
        activeWindowId: state.activeWindowId === action.windowId
          ? state.windows.filter(w => w.id !== action.windowId).slice(-1)[0]?.id || null
          : state.activeWindowId,
      };
    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId ? { ...w, isMinimized: true, isFocused: false } : w
        ),
        activeWindowId: state.activeWindowId === action.windowId
          ? state.windows.find(w => w.id !== action.windowId && !w.isMinimized)?.id || null
          : state.activeWindowId,
      };
    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId ? { ...w, isMaximized: true } : w
        ),
      };
    case 'RESTORE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId ? { ...w, isMaximized: false, isMinimized: false } : w
        ),
      };
    case 'FOCUS_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          isFocused: w.id === action.windowId,
          zIndex: w.id === action.windowId ? state.nextZIndex : w.zIndex,
        })),
        activeWindowId: action.windowId,
        nextZIndex: state.nextZIndex + 1,
      };
    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId ? { ...w, position: action.position } : w
        ),
      };
    case 'RESIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId ? { ...w, size: action.size } : w
        ),
      };
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.notification, ...state.notifications].slice(0, 50),
      };
    case 'READ_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      };
    case 'FS_ADD':
      return { ...state, fs: [...state.fs, action.node] };
    case 'FS_DELETE':
      return { ...state, fs: state.fs.filter(n => n.id !== action.id && n.parentId !== action.id) };
    case 'FS_RENAME':
      return {
        ...state,
        fs: state.fs.map(n => n.id === action.id ? { ...n, name: action.name } : n),
      };
    case 'FS_UPDATE_CONTENT':
      return {
        ...state,
        fs: state.fs.map(n => n.id === action.id ? { ...n, content: action.content, size: new Blob([action.content]).size } : n),
      };
    case 'SET_CURRENT_DIR':
      return { ...state, currentDir: action.dirId };
    case 'PKG_INSTALL':
      return {
        ...state,
        packages: state.packages.map(p => p.id === action.id ? { ...p, installed: true } : p),
      };
    case 'PKG_UNINSTALL':
      return {
        ...state,
        packages: state.packages.map(p => p.id === action.id ? { ...p, installed: false } : p),
      };
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.note.id ? { ...action.note, updatedAt: new Date().toISOString() } : n),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.id) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'UNLOCK_SECRET_THEME':
      return { ...state, secretThemeUnlocked: true };
    case 'SET_BOOT_PHASE':
      return { ...state, bootPhase: action.phase };
    case 'RESTORE_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface OSContextType {
  state: OSState;
  dispatch: React.Dispatch<OSAction>;
  apps: AppDefinition[];
  openApp: (appId: string, data?: Record<string, unknown>) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  sendNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  currentTheme: typeof themes[keyof typeof themes];
}

const OSContext = createContext<OSContextType | null>(null);

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(osReducer, null, createInitialState);

  const currentTheme = themes[state.settings.theme] || themes.axier;

  useEffect(() => {
    const toSave = {
      settings: state.settings,
      fs: state.fs,
      packages: state.packages,
      notes: state.notes,
      secretThemeUnlocked: state.secretThemeUnlocked,
    };
    localStorage.setItem('axier-os-state', JSON.stringify(toSave));
  }, [state.settings, state.fs, state.packages, state.notes, state.secretThemeUnlocked]);

  const openApp = useCallback((appId: string, data?: Record<string, unknown>) => {
    dispatch({ type: 'OPEN_APP', appId, data });
  }, []);

  const closeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'CLOSE_WINDOW', windowId });
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    dispatch({ type: 'FOCUS_WINDOW', windowId });
  }, []);

  const sendNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', notification });
  }, []);

  return (
    <OSContext.Provider value={{ state, dispatch, apps: APPS, openApp, closeWindow, focusWindow, sendNotification, currentTheme }}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
}

export { APPS, wallpapers };
