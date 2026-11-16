import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CalmGame} from '../components/CalmGame';
import {FeedGame} from '../components/FeedGame';
import {PreviewHarness} from '../components/PreviewHarness';
import {
  closeGameWindow,
  getCurrentPlayer,
  isOwlbearAvailable,
  onSdkReady,
  parseGameUrlParams,
} from '../sdk/obrClient';
import {STRINGS} from '../strings';
import type {PlayerInfo} from '../types';
import '../styles/hoenn.css';

function GamePageRoot() {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const params = parseGameUrlParams();

  useEffect(() => {
    onSdkReady(() => {
      void getCurrentPlayer().then(setPlayer);
    });
  }, []);

  if (!params) {
    if (!isOwlbearAvailable()) {
      return <PreviewHarness />;
    }
    return (
      <div className="gm-shell">
        <div className="galar-panel-card">
          <p className="galar-body">{STRINGS.gm.waitingForGmBody}</p>
        </div>
      </div>
    );
  }

  const resolvedPlayer: PlayerInfo = player ?? {
    id: params.playerId ?? 'player-local',
    name: params.playerName ?? 'Pemain',
    role: 'PLAYER',
  };

  if (params.game === 'calm') {
    return (
      <CalmGame
        sessionId={params.sessionId}
        speciesChoice={params.speciesId}
        player={resolvedPlayer}
        onClose={() => void closeGameWindow()}
      />
    );
  }

  return (
    <FeedGame
      sessionId={params.sessionId}
      count={params.feedCount}
      player={resolvedPlayer}
      onClose={() => void closeGameWindow()}
    />
  );
}

createRoot(document.getElementById('root')!).render(<GamePageRoot />);
