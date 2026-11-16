import React, {useEffect, useState} from 'react';
import {FEED_CONFIG} from '../config';
import {
  getCurrentPlayer,
  getPartyPlayers,
  isOwlbearAvailable,
  onSdkReady,
  sendStartBroadcast,
  showNotificationToast,
  subscribePartyPlayers,
  subscribeResultBroadcast,
} from '../sdk/obrClient';
import {CALM_SPECIES} from '../species';
import {STRINGS} from '../strings';
import type {CalmSpeciesId, GameKind, PlayerInfo, ResultMessage} from '../types';

interface GmPanelProps {
  previewMode?: boolean;
  previewRole?: 'GM' | 'PLAYER';
  previewActivePlayer?: PlayerInfo;
}

export function GmPanel({
  previewMode = false,
  previewRole,
  previewActivePlayer,
}: GmPanelProps) {
  const [ready, setReady] = useState(previewMode);
  const [role, setRole] = useState<'GM' | 'PLAYER'>(previewRole ?? 'PLAYER');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [game, setGame] = useState<GameKind>('calm');
  const [speciesChoice, setSpeciesChoice] = useState<CalmSpeciesId | 'random'>('random');
  const [feedCount, setFeedCount] = useState<number>(FEED_CONFIG.defaultCount);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [results, setResults] = useState<ResultMessage[]>([]);

  useEffect(() => {
    if (previewMode && previewRole) {
      setRole(previewRole);
    }
  }, [previewMode, previewRole]);

  useEffect(() => {
    let unsubParty: (() => void) | undefined;
    let unsubResults: (() => void) | undefined;
    let mounted = true;

    const init = async () => {
      const [me, party] = await Promise.all([getCurrentPlayer(), getPartyPlayers()]);
      if (!mounted) return;

      const resolvedRole = previewMode && previewRole ? previewRole : me.role;
      setRole(resolvedRole);
      setPlayers(party);
      setSelectedIds(party.map((p) => p.id));
      setReady(true);

      unsubParty = subscribePartyPlayers((updated) => {
        setPlayers(updated);
        setSelectedIds((prev) => {
          const valid = prev.filter((id) => updated.some((p) => p.id === id));
          return valid.length > 0 ? valid : updated.map((p) => p.id);
        });
      });

      unsubResults = subscribeResultBroadcast((msg) => {
        setResults((prev) => [msg, ...prev]);
        // In real Owlbear Rodeo rooms, BackgroundListener emits OBR.notification.show
        // even when the GM popover is closed; in preview mode GmPanel emits the toast.
        if (!isOwlbearAvailable()) {
          const gameLabel =
            msg.game === 'calm' ? STRINGS.gm.gameCalmLabel : STRINGS.gm.gameFeedLabel;
          const outcomeLabel =
            msg.outcome === 'success'
              ? STRINGS.gm.outcomeSuccess
              : STRINGS.gm.outcomeFail;
          void showNotificationToast(
            `${msg.playerName} · ${gameLabel} (${msg.stageLabel ?? `Tahap ${msg.stage}`}) — ${outcomeLabel} (${msg.accuracy}%)`,
            msg.outcome === 'success' ? 'SUCCESS' : 'WARNING',
          );
        }
      });
    };

    onSdkReady(() => {
      void init();
    });

    return () => {
      mounted = false;
      unsubParty?.();
      unsubResults?.();
    };
  }, [previewMode, previewRole]);

  const togglePlayer = (playerId: string) => {
    setErrorMsg('');
    setSelectedIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  };

  const handleStart = async () => {
    setErrorMsg('');
    setStatusMsg('');

    if (selectedIds.length === 0) {
      setErrorMsg(STRINGS.gm.needOnePlayer);
      return;
    }

    const clampedCount = Math.max(
      FEED_CONFIG.minCount,
      Math.min(FEED_CONFIG.maxCount, feedCount),
    );

    await sendStartBroadcast({
      sessionId: `hc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      game,
      targetPlayerIds: selectedIds,
      speciesId: speciesChoice,
      feedCount: clampedCount,
      issuedAt: Date.now(),
    });

    setStatusMsg(STRINGS.gm.dispatchSuccess);
    window.setTimeout(() => setStatusMsg(''), 2500);
  };

  if (!ready) {
    return (
      <div className="gm-shell">
        <div className="galar-panel-card">
          <p className="galar-body">Memuat Hoenn Care Games...</p>
        </div>
      </div>
    );
  }

  if (role !== 'GM') {
    return (
      <div className="gm-shell">
        <div className="galar-panel-card player-wait-card">
          <div className="galar-card-stripe" />
          <div className="pokeball-emblem" aria-hidden="true" />
          <h1 className="galar-title">{STRINGS.gm.waitingForGmTitle}</h1>
          <p className="galar-body">{STRINGS.gm.waitingForGmBody}</p>
          {previewMode && previewActivePlayer && (
            <p className="galar-hint">
              {STRINGS.preview.activePlayerLabel}: {previewActivePlayer.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="gm-shell">
      <header className="gm-header">
        <div className="gm-header-stripe" />
        <div className="gm-header-content">
          <span className="pokeball-mini" aria-hidden="true" />
          <div>
            <h1 className="gm-brand-title">{STRINGS.appTitle}</h1>
            <p className="gm-brand-sub">{STRINGS.gm.panelTitle}</p>
          </div>
        </div>
      </header>

      <main className="gm-body">
        {/* Mini Game Selector */}
        <section className="gm-section">
          <h2 className="gm-section-title">{STRINGS.gm.chooseGame}</h2>
          <div className="game-choice-grid" role="radiogroup" aria-label={STRINGS.gm.chooseGame}>
            <button
              type="button"
              role="radio"
              aria-checked={game === 'calm'}
              className={`game-choice-btn ${game === 'calm' ? 'is-selected' : ''}`}
              onClick={() => setGame('calm')}
            >
              <span className="choice-title">{STRINGS.gm.gameCalmLabel}</span>
              <span className="choice-desc">{STRINGS.gm.gameCalmDesc}</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={game === 'feed'}
              className={`game-choice-btn ${game === 'feed' ? 'is-selected' : ''}`}
              onClick={() => setGame('feed')}
            >
              <span className="choice-title">{STRINGS.gm.gameFeedLabel}</span>
              <span className="choice-desc">{STRINGS.gm.gameFeedDesc}</span>
            </button>
          </div>
        </section>

        {/* Game Options */}
        <section className="gm-section">
          {game === 'calm' ? (
            <label className="gm-field">
              <span className="gm-section-title">{STRINGS.gm.chooseSpecies}</span>
              <select
                className="galar-select"
                value={speciesChoice}
                onChange={(e) =>
                  setSpeciesChoice(e.target.value as CalmSpeciesId | 'random')
                }
              >
                <option value="random">{STRINGS.gm.randomSpecies}</option>
                {CALM_SPECIES.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="gm-field">
              <div className="gm-field-row">
                <span className="gm-section-title">{STRINGS.gm.feedCountLabel}</span>
                <span className="feed-count-val tabular-nums">{feedCount}</span>
              </div>
              <input
                type="range"
                className="galar-range"
                min={FEED_CONFIG.minCount}
                max={FEED_CONFIG.maxCount}
                value={feedCount}
                onChange={(e) => setFeedCount(Number(e.target.value))}
              />
              <span className="gm-hint">{STRINGS.gm.feedCountHint}</span>
            </div>
          )}
        </section>

        {/* Party Player Checklist */}
        <section className="gm-section">
          <div className="gm-section-header">
            <h2 className="gm-section-title">{STRINGS.gm.selectPlayers}</h2>
            {players.length > 0 && (
              <div className="gm-mini-actions">
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={() => setSelectedIds(players.map((p) => p.id))}
                >
                  {STRINGS.gm.selectAll}
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={() => setSelectedIds([])}
                >
                  {STRINGS.gm.clearAll}
                </button>
              </div>
            )}
          </div>

          {players.length === 0 ? (
            <p className="gm-empty-note">{STRINGS.gm.noPlayers}</p>
          ) : (
            <ul className="player-checklist">
              {players.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <li key={p.id}>
                    <label className={`player-check-item ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePlayer(p.id)}
                      />
                      <span
                        className="player-swatch"
                        style={{backgroundColor: p.color ?? '#1BA8B5'}}
                        aria-hidden="true"
                      />
                      <span className="player-name">{p.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {errorMsg && <p className="gm-feedback is-error">{errorMsg}</p>}
        {statusMsg && <p className="gm-feedback is-success">{statusMsg}</p>}

        <button
          type="button"
          className="btn-galar-primary btn-start-dispatch"
          onClick={() => void handleStart()}
          disabled={players.length === 0}
        >
          {STRINGS.gm.startButton}
        </button>

        {/* Live Result Log */}
        <section className="gm-section">
          <div className="gm-section-header">
            <h2 className="gm-section-title">{STRINGS.gm.resultLogTitle}</h2>
            {results.length > 0 && (
              <button
                type="button"
                className="btn-text-link"
                onClick={() => setResults([])}
              >
                {STRINGS.gm.clearLog}
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <p className="gm-empty-note">{STRINGS.gm.resultLogEmpty}</p>
          ) : (
            <ul className="result-log-list">
              {results.map((item, idx) => (
                <li
                  key={`${item.sessionId}-${item.stage}-${item.playerId}-${idx}`}
                  className={`result-log-item outcome-${item.outcome}`}
                >
                  <div className="result-log-top">
                    <span className="result-player">{item.playerName}</span>
                    <span className={`result-outcome text-${item.outcome}`}>
                      {item.outcome === 'success'
                        ? STRINGS.gm.outcomeSuccess
                        : STRINGS.gm.outcomeFail}
                    </span>
                  </div>
                  <div className="result-log-meta tabular-nums">
                    <span>
                      {item.game === 'calm'
                        ? STRINGS.gm.gameCalmLabel
                        : STRINGS.gm.gameFeedLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.stageLabel ?? `${STRINGS.common.stage} ${item.stage}`}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {STRINGS.common.accuracy}: {item.accuracy}%
                    </span>
                  </div>
                  <div className="result-log-counts tabular-nums">
                    {STRINGS.common.perfect}: {item.perfect} · {STRINGS.common.good}:{' '}
                    {item.good} · {STRINGS.common.miss}: {item.miss}
                    {item.reason ? ` · ${item.reason}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
