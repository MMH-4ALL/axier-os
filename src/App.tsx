import { OSProvider, useOS } from '@/store/OSContext';
import LockScreen from '@/components/LockScreen';
import Desktop from '@/components/Desktop';
import { useEffect } from 'react';
import './App.css';

// New overlay components
import SpotlightSearch from '@/components/ui/SpotlightSearch';
import Calculator from '@/components/ui/Calculator';
import VolumeHUD from '@/components/ui/VolumeHUD';
import ClipboardHUD from '@/components/ui/ClipboardHUD';
import SystemMonitor from '@/components/ui/SystemMonitor';
import WeatherWidget from '@/components/ui/WeatherWidget';
import VirtualDesktopBar from '@/components/ui/VirtualDesktopBar';

function AxierOS() {
  const { state, dispatch } = useOS();

  // Skip boot — go straight to lock screen
  useEffect(() => {
    if (state.view === 'boot') {
      dispatch({ type: 'SET_VIEW', view: 'lock' });
    }
  }, [state.view, dispatch]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Spotlight: Cmd/Ctrl+K
      if (meta && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: state.spotlightOpen ? 'CLOSE_SPOTLIGHT' : 'OPEN_SPOTLIGHT' });
      }

      // Calculator: Cmd/Ctrl+Shift+C
      if (meta && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_CALCULATOR' });
      }

      // Calculator: Alt+C
      if (!meta && e.altKey && e.key === 'c') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_CALCULATOR' });
      }

      // Volume keys (on laptops / some keyboards)
      if (e.key === 'AudioVolUp' || (meta && e.key === 'ArrowUp' && e.shiftKey)) {
        dispatch({ type: 'SET_VOLUME', volume: Math.min(100, state.volume + 5) });
        dispatch({ type: 'SHOW_VOLUME_HUD' });
      }
      if (e.key === 'AudioVolDown' || (meta && e.key === 'ArrowDown' && e.shiftKey)) {
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

      {/* Overlays — always mounted on desktop */}
      {state.view === 'desktop' && (
        <>
          <SpotlightSearch />
          {state.calculatorOpen && (
            <Calculator onClose={() => dispatch({ type: 'TOGGLE_CALCULATOR' })} />
          )}
          <VolumeHUD />
          <ClipboardHUD />
          <SystemMonitor />
          <WeatherWidget />
          <VirtualDesktopBar />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <AxierOS />
    </OSProvider>
  );
}
