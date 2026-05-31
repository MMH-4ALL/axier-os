import { OSProvider, useOS } from '@/store/OSContext';
import BootScreen from '@/components/BootScreen';
import LockScreen from '@/components/LockScreen';
import Desktop from '@/components/Desktop';
import { useEffect } from 'react';
import './App.css';

function AxierOS() {
  const { state, dispatch } = useOS();

  useEffect(() => {
    if (state.view === 'boot') {
      const phases = [1, 2, 3, 4, 5];
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < phases.length) {
          dispatch({ type: 'SET_BOOT_PHASE', phase: phases[idx] });
          idx++;
        } else {
          clearInterval(interval);
          dispatch({ type: 'SET_VIEW', view: 'lock' });
        }
      }, state.settings.bootAnimation ? 800 : 100);
      return () => clearInterval(interval);
    }
  }, [state.view, state.settings.bootAnimation, dispatch]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative select-none">
      {state.view === 'boot' && <BootScreen />}
      {state.view === 'lock' && <LockScreen />}
      {state.view === 'desktop' && <Desktop />}
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
