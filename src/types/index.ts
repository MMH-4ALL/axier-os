export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  data?: Record<string, unknown>;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  category: 'system' | 'utility' | 'media' | 'dev';
  defaultSize: Size;
  minSize: Size;
  canResize: boolean;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  terminal: {
    background: string;
    foreground: string;
    cursor: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
  };
  isDark: boolean;
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  createdAt: string;
  size?: number;
  mimeType?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  installed: boolean;
  size: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
}

export interface TerminalSettings {
  fontSize: number;
  cursorStyle: 'block' | 'line' | 'underline';
  theme: string;
}

export interface OSSettings {
  theme: string;
  wallpaper: string;
  accentColor: string;
  dockPosition: 'bottom' | 'left' | 'right';
  dockSize: 'small' | 'medium' | 'large';
  showClock: boolean;
  clockFormat: '12h' | '24h';
  terminal: TerminalSettings;
  bootAnimation: boolean;
  iconPack: 'default' | 'pixel';
  animations: boolean;
}

export type DesktopView = 'desktop' | 'terminal-only' | 'lock' | 'boot';
