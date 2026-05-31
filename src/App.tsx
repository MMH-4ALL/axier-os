import { OSProvider, useOS } from '@/store/OSContext';
import LockScreen from '@/components/LockScreen';
import Desktop from '@/components/Desktop';
import { useEffect } from 'react';
import './App.css';

function AxierOS() {
  const { state, dispatch } = useOS();

  // Skip boot — go straight to lock screen on first load
  useEffect(() => {
    if (state.view === 'boot') {
      dispatch({ type: 'SET_VIEW', view: 'lock' });
    }
  }, [state.view, dispatch]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative select-none">
      {(state.view === 'boot' || state.view === 'lock') && <LockScreen />}
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
