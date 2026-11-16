import React, {useEffect, useState} from 'react';
import {
  getPartyPlayers,
  previewBus,
  type PreviewToast,
} from '../sdk/obrClient';
import {STRINGS} from '../strings';
import type {PlayerInfo, SessionLaunchParams} from '../types';
import {CalmGame} from './CalmGame';
import {FeedGame} from './FeedGame';
import {GmPanel} from './GmPanel';

type HarnessView = 'split' | 'gm' | 'player';

/**
 * Standalone Preview Harness rendered ONLY when OBR.isAvailable is false.
 * Lets reviewers test both GM dispatch and Player gameplay side-by-side
 * or via "Test sebagai GM" / "Test sebagai Pemain" toggles without Owlbear.
 */
export function PreviewHarness() {
  const [viewMode, setViewMode] = useState<HarnessView>('split');
  const [players] = useState<PlayerInfo[]>(() => getPartyPlayersSync());
  const [activePlayer, setActivePlayer] = useState<PlayerInfo>(
    () => previewBus.getActivePreviewPlayer(),
  );
  const [activeLaunch, setActiveLaunch] = useState<SessionLaunchParams | null>(null);
  const [toasts, setToasts] = useState<PreviewToast[]>([]);

  useEffect(() => {
    const unsubStart = previewBus.onStart((msg) => {
      if (msg.targetPlayerIds.includes(activePlayer.id)) {
        setActiveLaunch({
          sessionId: msg.sessionId,
          game: msg.game,
          speciesId: msg.speciesId,
          feedCount: msg.feedCount,
          playerId: activePlayer.id,
          playerName: activePlayer.name,
        });
      }
    });

    const unsubLaunch = previewBus.onPreviewLaunch((params) => {
      setActiveLaunch(params);
    });

    const unsubToast = previewBus.onToast((toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, 3));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4200);
    });

    return () => {
      unsubStart();
      unsubLaunch();
      unsubToast();
    };
  }, [activePlayer.id, activePlayer.name]);

  const handleSelectActivePlayer = (id: string) => {
    previewBus.setActivePreviewPlayerId(id);
    const found = players.find((p) => p.id === id) ?? players[0];
    setActivePlayer(found);
  };

  return (
    <div className="preview-root">
      {/* Top Preview Switcher */}
      <header className="preview-toolbar">
        <div className="preview-toolbar-left">
          <span className="pokeball-mini" aria-hidden="true" />
          <span className="preview-brand">{STRINGS.appTitle}</span>
          <span className="preview-sep" aria-hidden="true">·</span>
          <span className="preview-note">{STRINGS.preview.bannerLabel}</span>
        </div>

        <div className="preview-toolbar-controls">
          <div className="segmented-tabs" role="tablist" aria-label="Mode Pratinjau">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'split'}
              className={`seg-tab ${viewMode === 'split' ? 'is-active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              {STRINGS.preview.modeSplit}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'gm'}
              className={`seg-tab ${viewMode === 'gm' ? 'is-active' : ''}`}
              onClick={() => setViewMode('gm')}
            >
              {STRINGS.preview.modeGm}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'player'}
              className={`seg-tab ${viewMode === 'player' ? 'is-active' : ''}`}
              onClick={() => setViewMode('player')}
            >
              {STRINGS.preview.modePlayer}
            </button>
          </div>

          <label className="preview-player-picker">
            <span>{STRINGS.preview.activePlayerLabel}:</span>
            <select
              className="galar-select-sm"
              value={activePlayer.id}
              onChange={(e) => handleSelectActivePlayer(e.target.value)}
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {/* Toast Container mirroring OBR.notification.show */}
      {toasts.length > 0 && (
        <div className="preview-toast-stack" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`preview-toast toast-${t.variant.toLowerCase()}`}>
              <strong>{STRINGS.preview.toastPrefix}:</strong> {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Main Split or Single Role Workspace */}
      <div className={`preview-workspace layout-${viewMode}`}>
        {(viewMode === 'split' || viewMode === 'gm') && (
          <section className="preview-pane preview-pane-gm" aria-label={STRINGS.preview.modeGm}>
            <GmPanel previewMode previewRole="GM" />
          </section>
        )}

        {(viewMode === 'split' || viewMode === 'player') && (
          <section
            className="preview-pane preview-pane-player"
            aria-label={STRINGS.preview.modePlayer}
          >
            {activeLaunch ? (
              <div className="preview-game-frame">
                {activeLaunch.game === 'calm' ? (
                  <CalmGame
                    sessionId={activeLaunch.sessionId}
                    speciesChoice={activeLaunch.speciesId}
                    player={activePlayer}
                    onClose={() => setActiveLaunch(null)}
                  />
                ) : (
                  <FeedGame
                    sessionId={activeLaunch.sessionId}
                    count={activeLaunch.feedCount}
                    player={activePlayer}
                    onClose={() => setActiveLaunch(null)}
                  />
                )}
              </div>
            ) : (
              <div className="preview-player-waiting">
                <GmPanel
                  previewMode
                  previewRole="PLAYER"
                  previewActivePlayer={activePlayer}
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function getPartyPlayersSync(): PlayerInfo[] {
  return previewBus.getPlayers();
}

// Keep unused import guard clean if getPartyPlayers is used elsewhere
void getPartyPlayers;
