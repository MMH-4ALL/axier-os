import { OSProvider, useOS } from '@/store/OSContext';
import LockScreen from '@/components/LockScreen';
import Desktop from '@/components/Desktop';
import { useEffect, useState } from 'react';
import './App.css';

// Overlay components
import SpotlightSearch from '@/components/ui/SpotlightSearch';
import Calculator from '@/components/ui/Calculator';
import VolumeHUD from '@/components/ui/VolumeHUD';
import ClipboardHUD from '@/components/ui/ClipboardHUD';
import SystemMonitor from '@/components/ui/SystemMonitor';
import WeatherWidget from '@/components/ui/WeatherWidget';
import VirtualDesktopBar from '@/components/ui/VirtualDesktopBar';
import MiniMusicPlayer from '@/components/ui/MiniMusicPlayer';
import EmojiPicker from '@/components/ui/EmojiPicker';
import SnakeGame from '@/components/ui/SnakeGame';
import CommandPalette from '@/components/ui/CommandPalette';
import ClipboardManager from '@/components/ui/ClipboardManager';
import PomodoroTimer from '@/components/ui/PomodoroTimer';

function AxierOS() {
  const { state, dispatch, setNoBootScreen } = useOS();
  const [snakeOpen, setSnakeOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [clipboardManagerOpen, setClipboardManagerOpen] = useState(false);

  // Skip boot — go straight to lock screen
  useEffect(() => {
    if (state.view === 'boot') {
      dispatch({ type: 'SET_VIEW', view: 'lock' });
    }
  }, [state.view, dispatch]);

  // Close snake on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (snakeOpen && e.key === 'Escape') setSnakeOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [snakeOpen]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Spotlight: Cmd/Ctrl+K
      if (meta && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: state.spotlightOpen ? 'CLOSE_SPOTLIGHT' : 'OPEN_SPOTLIGHT' });
      }

      // Calculator: Alt+C
      if (!meta && e.altKey && e.key === 'c') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_CALCULATOR' });
      }

      // Emoji Picker: Cmd/Ctrl+Shift+E
      if (meta && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('axier:emoji-picker'));
      }

      // Snake: Cmd/Ctrl+Shift+S
      if (meta && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setSnakeOpen(true);
      }

      // Command Palette: Cmd/Ctrl+Shift+P
      if (meta && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCommandPaletteOpen(o => !o);
      }

      // Clipboard Manager: Cmd/Ctrl+Shift+V
      if (meta && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        setClipboardManagerOpen(o => !o);
      }

      // Pomodoro Timer: Cmd/Ctrl+Shift+O
      if (meta && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_WIDGET', widget: 'pomodoro' });
      }

      // Toggle Weather: Alt+W
      if (!meta && e.altKey && e.key === 'w') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_WIDGET', widget: 'weather' });
      }

      // Toggle Virtual Desktop Bar: Alt+D
      if (!meta && e.altKey && e.key === 'd') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_WIDGET', widget: 'virtualDesktopBar' });
      }

      // Volume keys
      if (e.key === 'AudioVolUp') {
        dispatch({ type: 'SET_VOLUME', volume: Math.min(100, state.volume + 5) });
        dispatch({ type: 'SHOW_VOLUME_HUD' });
      }
      if (e.key === 'AudioVolDown') {
        dispatch({ type: 'SET_VOLUME', volume: Math.max(0, state.volume - 5) });
        dispatch({ type: 'SHOW_VOLUME_HUD' });
      }
      if (e.key === 'AudioVolMute') {
        dispatch({ type: 'SET_VOLUME', volume: state.volume === 0 ? 70 : 0 });
        dispatch({ type: 'SHOW_VOLUME_HUD' });
      }

      // Escape — close overlays
      if (e.key === 'Escape') {
        if (state.spotlightOpen) dispatch({ type: 'CLOSE_SPOTLIGHT' });
        else if (state.calculatorOpen) dispatch({ type: 'TOGGLE_CALCULATOR' });
        else if (commandPaletteOpen) setCommandPaletteOpen(false);
        else if (clipboardManagerOpen) setClipboardManagerOpen(false);
        else if (state.noBootScreen) setNoBootScreen(false);
      }

      // Shift+8 — recover from no-boot screen (hidden in plain sight: * = Shift+8)
      if (e.shiftKey && e.key === '8') {
        e.preventDefault();
        setNoBootScreen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, state.spotlightOpen, state.calculatorOpen, state.volume, state.noBootScreen, setNoBootScreen, commandPaletteOpen, clipboardManagerOpen]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative select-none">
      {state.noBootScreen && (
        <div className="fixed inset-0 z-[99999]" style={{ background: '#000000' }} />
      )}

      {(state.view === 'boot' || state.view === 'lock') && <LockScreen />}

      {state.view === 'desktop' && <Desktop />}

      {/* Overlays */}
      {state.view === 'desktop' && (
        <>
          {state.spotlightOpen && <SpotlightSearch />}
          {state.calculatorOpen && (
            <Calculator onClose={() => dispatch({ type: 'TOGGLE_CALCULATOR' })} />
          )}
          <VolumeHUD />
          <ClipboardHUD />
          <SystemMonitor />
          <WeatherWidget />
          <VirtualDesktopBar />
          <MiniMusicPlayer />
          <EmojiPickerTrigger />
          {snakeOpen && <SnakeGame onClose={() => setSnakeOpen(false)} />}
          {commandPaletteOpen && <CommandPalette onClose={() => setCommandPaletteOpen(false)} />}
          {clipboardManagerOpen && <ClipboardManager onClose={() => setClipboardManagerOpen(false)} />}
          {state.visibleWidgets.pomodoro && <PomodoroTimer />}
        </>
      )}
    </div>
  );
}

function EmojiPickerTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('axier:emoji-picker', handler);
    return () => window.removeEventListener('axier:emoji-picker', handler);
  }, []);

  if (!open) return null;
  return <EmojiPicker onClose={() => setOpen(false)} />;
}

export default function App() {
  return (
    <OSProvider>
      <AxierOS />
    </OSProvider>
  );
}
