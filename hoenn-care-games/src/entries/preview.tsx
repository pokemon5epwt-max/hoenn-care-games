import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PreviewHarness} from '../components/PreviewHarness';
import {GmPanel} from '../components/GmPanel';
import {isOwlbearAvailable, onSdkReady} from '../sdk/obrClient';
import '../styles/hoenn.css';

function PreviewOrGmRoot() {
  const [inOwlbear, setInOwlbear] = useState<boolean | null>(null);

  useEffect(() => {
    const avail = isOwlbearAvailable();
    if (avail) {
      onSdkReady(() => setInOwlbear(true));
    } else {
      setInOwlbear(false);
    }
  }, []);

  if (inOwlbear === null) return null;
  return inOwlbear ? <GmPanel /> : <PreviewHarness />;
}

createRoot(document.getElementById('root')!).render(<PreviewOrGmRoot />);
