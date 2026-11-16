import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {soundFx} from '../audio/soundFx';
import {FEED_CONFIG} from '../config';
import {sendResultBroadcast} from '../sdk/obrClient';
import {pickRandomFeedRoster, type SpeciesDefinition} from '../species';
import {STRINGS} from '../strings';
import type {FeedSpeciesId, PlayerInfo, PokemonMood} from '../types';
import {HoennTrainerSvg, PokemonSprite} from './PokemonArt';
import {LocationBanner, Route117DaycareScene} from './Scenes';

interface FeedGameProps {
  sessionId: string;
  count: number;
  player: PlayerInfo;
  onClose?: () => void;
}

interface FeedTarget {
  species: SpeciesDefinition<FeedSpeciesId>;
  bandStart: number;
  bandWidth: number;
  bandEnd: number;
}

type FeedPhase = 'ready' | 'pouring' | 'eating' | 'fail' | 'victory';

const POKEBLOCK_COLORS = ['#E4002B', '#1BA8B5', '#FFC72C', '#7ED957', '#FF7CA3'];

function createFeedRun(count: number): FeedTarget[] {
  const clamped = Math.max(FEED_CONFIG.minCount, Math.min(FEED_CONFIG.maxCount, count));
  const roster = pickRandomFeedRoster(clamped);

  return roster.map((species, idx) => {
    const widths = FEED_CONFIG.bandWidths;
    const bandWidth = widths[Math.min(idx, widths.length - 1)];
    const minStart = FEED_CONFIG.bandMinFill;
    const maxStart = FEED_CONFIG.bandMaxFill - bandWidth;
    const bandStart = Math.round(minStart + Math.random() * (maxStart - minStart));
    return {
      species,
      bandStart,
      bandWidth,
      bandEnd: bandStart + bandWidth,
    };
  });
}

export function FeedGame({sessionId, count, player, onClose}: FeedGameProps) {
  const [runSeed, setRunSeed] = useState(1);
  const targets = useMemo(() => createFeedRun(count), [count, sessionId, runSeed]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<FeedPhase>('ready');
  const [fillPct, setFillPct] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [failType, setFailType] = useState<'under' | 'over' | null>(null);
  const [fedCount, setFedCount] = useState(0);
  const [muted, setMuted] = useState(() => soundFx.isMuted());

  const fillRef = useRef(0);
  const pouringRef = useRef(false);
  const phaseRef = useRef<FeedPhase>('ready');
  const pourStartMsRef = useRef(0);
  const lastFrameMsRef = useRef(0);
  const lastSoundFillRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const eatTimerRef = useRef<number | null>(null);

  const currentTarget = targets[currentIndex] ?? targets[0];

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const resetForRun = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (eatTimerRef.current !== null) window.clearTimeout(eatTimerRef.current);
    fillRef.current = 0;
    pouringRef.current = false;
    phaseRef.current = 'ready';
    setCurrentIndex(0);
    setFillPct(0);
    setIsPouring(false);
    setFailType(null);
    setFedCount(0);
    setPhase('ready');
    setRunSeed((s) => s + 1);
  }, []);

  useEffect(() => {
    fillRef.current = 0;
    pouringRef.current = false;
    phaseRef.current = 'ready';
    setCurrentIndex(0);
    setFillPct(0);
    setIsPouring(false);
    setFailType(null);
    setFedCount(0);
    setPhase('ready');

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (eatTimerRef.current !== null) window.clearTimeout(eatTimerRef.current);
    };
  }, [sessionId]);

  const emitRunResult = useCallback(
    (outcome: 'success' | 'fail', completedCount: number, reason?: string) => {
      const total = targets.length;
      const accuracy = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      void sendResultBroadcast({
        sessionId,
        game: 'feed',
        stage: completedCount + (outcome === 'fail' ? 1 : 0),
        stageLabel: `${completedCount}/${total} Pokémon`,
        outcome,
        reason,
        playerId: player.id,
        playerName: player.name,
        perfect: completedCount,
        good: 0,
        miss: outcome === 'fail' ? 1 : 0,
        accuracy,
        timestamp: Date.now(),
      });
    },
    [player.id, player.name, sessionId, targets.length],
  );

  const triggerFail = useCallback(
    (kind: 'under' | 'over') => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pouringRef.current = false;
      phaseRef.current = 'fail';
      setIsPouring(false);
      setFailType(kind);
      setPhase('fail');
      soundFx.playFail();

      const reason = kind === 'under' ? STRINGS.feed.failUnder : STRINGS.feed.failOver;
      emitRunResult('fail', currentIndex, reason);
    },
    [currentIndex, emitRunResult],
  );

  const evaluateRelease = useCallback(() => {
    if (!pouringRef.current) return;
    pouringRef.current = false;
    setIsPouring(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (phaseRef.current !== 'pouring') return;

    const currentFill = fillRef.current;
    if (currentFill < currentTarget.bandStart) {
      triggerFail('under');
      return;
    }
    if (currentFill > currentTarget.bandEnd) {
      triggerFail('over');
      return;
    }

    // Success for this Pokémon!
    phaseRef.current = 'eating';
    setPhase('eating');
    soundFx.playEatHappy();
    const nextFed = currentIndex + 1;
    setFedCount(nextFed);

    eatTimerRef.current = window.setTimeout(() => {
      if (nextFed >= targets.length) {
        phaseRef.current = 'victory';
        setPhase('victory');
        soundFx.playVictory();
        emitRunResult('success', targets.length);
      } else {
        fillRef.current = 0;
        setFillPct(0);
        setCurrentIndex(nextFed);
        phaseRef.current = 'ready';
        setPhase('ready');
      }
    }, FEED_CONFIG.eatAnimationMs);
  }, [currentIndex, currentTarget.bandEnd, currentTarget.bandStart, emitRunResult, targets.length, triggerFail]);

  const startPouring = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (phaseRef.current !== 'ready') return;

      pouringRef.current = true;
      phaseRef.current = 'pouring';
      setIsPouring(true);
      setPhase('pouring');

      const now = performance.now();
      pourStartMsRef.current = now;
      lastFrameMsRef.current = now;
      lastSoundFillRef.current = fillRef.current;

      const step = (frameNow: number) => {
        if (!pouringRef.current || phaseRef.current !== 'pouring') return;

        const dtSec = Math.min(0.05, (frameNow - lastFrameMsRef.current) / 1000);
        lastFrameMsRef.current = frameNow;
        const heldSec = (frameNow - pourStartMsRef.current) / 1000;
        const rate = FEED_CONFIG.basePourRatePerSec + FEED_CONFIG.pourAccelPerSec2 * heldSec;

        fillRef.current = Math.min(
          FEED_CONFIG.spillThreshold,
          fillRef.current + rate * dtSec,
        );
        setFillPct(fillRef.current);

        if (fillRef.current - lastSoundFillRef.current >= 6) {
          lastSoundFillRef.current = fillRef.current;
          soundFx.playPourTick(fillRef.current);
        }

        if (fillRef.current >= FEED_CONFIG.spillThreshold) {
          triggerFail('over');
          return;
        }

        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [triggerFail],
  );

  useEffect(() => {
    const onGlobalPointerUp = () => {
      if (pouringRef.current) {
        evaluateRelease();
      }
    };
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
    };
  }, [evaluateRelease]);

  const toggleMute = () => {
    const next = !muted;
    soundFx.setMuted(next);
    setMuted(next);
  };

  const activeMood: PokemonMood =
    phase === 'eating' ? 'eating' : phase === 'fail' ? 'sad' : 'neutral';

  const waitingQueue = targets.slice(currentIndex + 1);
  const pelletCountInBowl = Math.round((fillPct / 100) * 18);

  return (
    <div className="game-shell game-feed">
      <Route117DaycareScene />

      <div className="game-topbar">
        <LocationBanner title={STRINGS.locations.feed} accent="daycare" />
        <div className="game-topbar-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={toggleMute}
            aria-label={muted ? STRINGS.common.unmute : STRINGS.common.mute}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {onClose && (
            <button type="button" className="btn-secondary-sm" onClick={onClose}>
              {STRINGS.common.closeWindow}
            </button>
          )}
        </div>
      </div>

      {/* HUD */}
      <div className="feed-hud">
        <div className="feed-hud-left">
          <span className="hud-title">
            {currentTarget.species.name} · {STRINGS.feed.pokemonCounter} {currentIndex + 1}/
            {targets.length}
          </span>
          <span className="hud-sub">{STRINGS.feed.subtitle}</span>
        </div>
        <div className="feed-hud-right tabular-nums">
          <span>
            {STRINGS.feed.portionTarget}: {currentTarget.bandStart}%–{currentTarget.bandEnd}%
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {STRINGS.feed.currentFill}: {Math.round(fillPct)}%
          </span>
        </div>
      </div>

      {/* Yard & Feeding Foreground */}
      <div className="feed-arena">
        {/* Waiting line in the yard */}
        {waitingQueue.length > 0 && (
          <div className="feed-queue" aria-label={STRINGS.feed.queueTitle}>
            <span className="feed-queue-label">{STRINGS.feed.queueTitle}</span>
            <div className="feed-queue-sprites">
              {waitingQueue.map((item) => (
                <div key={item.species.id} className="queue-pokemon-chip">
                  <PokemonSprite speciesId={item.species.id} mood="neutral" />
                  <span>{item.species.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active feeding lane: Trainer + Pouring stream + Bowl + Active Pokémon */}
        <div className="feed-stage-row">
          <div className="feed-trainer-col">
            <HoennTrainerSvg pouring={isPouring} />
          </div>

          <div className="feed-bowl-col">
            {/* Falling Pokéblock pellets stream while pouring */}
            {isPouring && (
              <div className="pokeblock-stream" aria-hidden="true">
                {POKEBLOCK_COLORS.map((color, idx) => (
                  <span
                    key={color}
                    className="pokeblock-pellet"
                    style={{
                      backgroundColor: color,
                      animationDelay: `${idx * 75}ms`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Spill visual when overflowed */}
            {phase === 'fail' && failType === 'over' && (
              <div className="pokeblock-spill" aria-hidden="true">
                {POKEBLOCK_COLORS.map((color, idx) => (
                  <span
                    key={`${color}-${idx}`}
                    className="pokeblock-spilled-pellet"
                    style={{backgroundColor: color}}
                  />
                ))}
              </div>
            )}

            {/* Bowl SVG + Fill Gauge */}
            <div className="bowl-and-gauge">
              <div className="bowl-gauge" aria-label={STRINGS.feed.currentFill}>
                <div
                  className="bowl-target-band"
                  style={{
                    bottom: `${currentTarget.bandStart}%`,
                    height: `${currentTarget.bandWidth}%`,
                  }}
                >
                  <span className="band-tag">{STRINGS.feed.portionTarget}</span>
                </div>
                <div
                  className={`bowl-gauge-fill ${
                    fillPct > currentTarget.bandEnd
                      ? 'is-over'
                      : fillPct >= currentTarget.bandStart
                        ? 'is-in-band'
                        : ''
                  }`}
                  style={{height: `${Math.min(100, fillPct)}%`}}
                />
              </div>

              <div className="bowl-container">
                <div className="bowl-pellets-pile" aria-hidden="true">
                  {Array.from({length: pelletCountInBowl}, (_, idx) => (
                    <span
                      key={idx}
                      className="bowl-pellet-cube"
                      style={{
                        backgroundColor: POKEBLOCK_COLORS[idx % POKEBLOCK_COLORS.length],
                      }}
                    />
                  ))}
                </div>
                <svg viewBox="0 0 180 90" className="bowl-svg" aria-hidden="true">
                  <ellipse cx="90" cy="24" rx="76" ry="16" fill="#D9ECFF" stroke="#1A2433" strokeWidth="3" />
                  <path
                    d="M14 24 Q24 84 90 84 Q156 84 166 24 Z"
                    fill="#1E4FD8"
                    stroke="#1A2433"
                    strokeWidth="3"
                  />
                  <path d="M36 46 L144 46" stroke="#FFC72C" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Hold-to-pour interactive button */}
            <button
              type="button"
              className={`btn-pour-hold ${isPouring ? 'is-pouring' : ''}`}
              onPointerDown={startPouring}
              disabled={phase !== 'ready' && phase !== 'pouring'}
            >
              {isPouring ? STRINGS.feed.pouringNow : STRINGS.feed.holdToPour}
            </button>
            <span className="pour-hint-text">{STRINGS.feed.releaseHint}</span>
          </div>

          <div className="feed-pokemon-col">
            <PokemonSprite
              speciesId={currentTarget.species.id}
              mood={activeMood}
              className="feed-pokemon-sprite"
            />
            {phase === 'eating' && (
              <div className="eating-bubble">{STRINGS.feed.eatingHappy}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fail Overlay */}
      {phase === 'fail' && (
        <div className="game-overlay">
          <div className="galar-modal-card">
            <div className="galar-card-stripe stripe-ruby" />
            <h2 className="galar-title">
              {failType === 'under' ? STRINGS.feed.failUnder : STRINGS.feed.failOver}
            </h2>
            <p className="galar-body">
              {failType === 'under' ? STRINGS.feed.failUnderDesc : STRINGS.feed.failOverDesc}
            </p>
            <div className="result-summary-row tabular-nums">
              <span>
                {currentTarget.species.name}: {Math.round(fillPct)}%
              </span>
              <span>
                {STRINGS.feed.portionTarget}: {currentTarget.bandStart}%–{currentTarget.bandEnd}%
              </span>
              <span>
                Selesai: {fedCount}/{targets.length}
              </span>
            </div>
            <button type="button" className="btn-galar-danger" onClick={resetForRun}>
              {STRINGS.common.retry}
            </button>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {phase === 'victory' && (
        <div className="game-overlay">
          <div className="galar-modal-card">
            <div className="galar-card-stripe stripe-leaf" />
            <h2 className="galar-title">{STRINGS.feed.victoryTitle}</h2>
            <p className="galar-body">{STRINGS.feed.victoryDesc}</p>
            <div className="result-summary-row tabular-nums">
              <span>
                {STRINGS.feed.pokemonCounter}: {targets.length}/{targets.length}
              </span>
              <span>{STRINGS.common.accuracy}: 100%</span>
            </div>
            <div className="galar-actions-row">
              <button type="button" className="btn-galar-primary" onClick={resetForRun}>
                {STRINGS.common.retry}
              </button>
              {onClose && (
                <button type="button" className="btn-galar-secondary" onClick={onClose}>
                  {STRINGS.common.closeWindow}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
