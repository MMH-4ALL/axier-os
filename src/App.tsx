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

function AxierOS() {
  const { state, dispatch } = useOS();
  const [snakeOpen, setSnakeOpen] = useState(false);

  // Skip boot — go straight to lock screen
  useEffect(() => {
    if (state.view === 'boot') {
      dispatch({ type: 'SET_VIEW', view: 'lock' });
    }
  }, [state.view, dispatch]);

  // Close snake on window close dispatch (watch for snake-specific close)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (snakeOpen && e.key === 'Escape') {
        setSnakeOpen(false);
      }
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
        dispatch({ type: 'CLOSE_SPOTLIGHT' });
        // Emoji picker is controlled by a separate open state
        // We use a data attribute approach: emojiPickerOpen in state
        // For now, dispatch a custom event
        window.dispatchEvent(new CustomEvent('axier:emoji-picker'));
      }

      // Snake: Cmd/Ctrl+Shift+S
      if (meta && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setSnakeOpen(true);
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

      // Escape — close spotlight or calculator
      if (e.key === 'Escape') {
        if (state.spotlightOpen) dispatch({ type: 'CLOSE_SPOTLIGHT' });
        else if (state.calculatorOpen) dispatch({ type: 'TOGGLE_CALCULATOR' });
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, state.spotlightOpen, state.calculatorOpen, state.volume]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative select-none">
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
