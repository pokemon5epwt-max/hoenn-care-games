import React from 'react';
import {createRoot} from 'react-dom/client';
import {GmPanel} from '../components/GmPanel';
import {PreviewHarness} from '../components/PreviewHarness';
import {isOwlbearAvailable} from '../sdk/obrClient';
import '../styles/hoenn.css';

const rootEl = document.getElementById('root')!;
if (isOwlbearAvailable()) {
  createRoot(rootEl).render(<GmPanel />);
} else {
  createRoot(rootEl).render(<PreviewHarness />);
}
