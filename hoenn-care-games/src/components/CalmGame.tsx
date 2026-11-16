import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {soundFx} from '../audio/soundFx';
import {CALM_CONFIG, type CalmStageConfig} from '../config';
import {sendResultBroadcast} from '../sdk/obrClient';
import {getCalmSpecies, getRandomCalmSpecies, type ZoneCoord} from '../species';
import {STRINGS} from '../strings';
import type {
  BodyZone,
  CalmSpeciesId,
  JudgmentKind,
  PlayerInfo,
} from '../types';
import {PokemonSprite} from './PokemonArt';
import {LocationBanner, PetalburgWoodsScene} from './Scenes';

interface CalmGameProps {
  sessionId: string;
  speciesChoice: CalmSpeciesId | 'random';
  player: PlayerInfo;
  onClose?: () => void;
}

interface ScheduledNote {
  id: number;
  zone: ZoneCoord;
  xPct: number;
  yPct: number;
  spawnTime: number;
  hitTime: number;
  approachMs: number;
  resolved: boolean;
  judgment?: JudgmentKind;
}

interface FloatingEffect {
  id: number;
  xPct: number;
  yPct: number;
  kind: JudgmentKind;
  text: string;
}

type Phase = 'ready' | 'playing' | 'stage_success' | 'stage_fail' | 'victory';

function buildStageNotes(
  stageCfg: CalmStageConfig,
  zones: readonly ZoneCoord[],
  startAtMs: number,
): ScheduledNote[] {
  const leadInMs = 950;
  const beatCount = stageCfg.totalCircles - stageCfg.pairedSpawns;
  const pairedBeatIndices = new Set<number>();

  if (stageCfg.pairedSpawns > 0) {
    const candidateBeats = Array.from({length: beatCount}, (_, idx) => idx);
    for (let i = candidateBeats.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = candidateBeats[i];
      candidateBeats[i] = candidateBeats[j];
      candidateBeats[j] = tmp;
    }
    for (let i = 0; i < stageCfg.pairedSpawns; i += 1) {
      pairedBeatIndices.add(candidateBeats[i]);
    }
  }

  const notes: ScheduledNote[] = [];
  let nextId = 1;
  let lastZone: BodyZone | null = null;

  for (let beat = 0; beat < beatCount; beat += 1) {
    const hitTime = startAtMs + leadInMs + beat * stageCfg.spacingMs;
    const spawnTime = hitTime - stageCfg.approachMs;

    const firstPool = zones.filter((z) => z.zone !== lastZone);
    const firstZone =
      firstPool[Math.floor(Math.random() * firstPool.length)] ?? zones[0];
    lastZone = firstZone.zone;

    const jitterX = (Math.random() - 0.5) * 3.6;
    const jitterY = (Math.random() - 0.5) * 3.6;
    const x1 = Math.max(18, Math.min(82, firstZone.xPct + jitterX));
    const y1 = Math.max(18, Math.min(82, firstZone.yPct + jitterY));

    notes.push({
      id: nextId++,
      zone: firstZone,
      xPct: x1,
      yPct: y1,
      spawnTime,
      hitTime,
      approachMs: stageCfg.approachMs,
      resolved: false,
    });

    if (pairedBeatIndices.has(beat)) {
      // Pick a second non-overlapping zone sufficiently far from the first
      const farZones = zones.filter((z) => {
        if (z.zone === firstZone.zone) return false;
        const dx = z.xPct - x1;
        const dy = z.yPct - y1;
        return Math.hypot(dx, dy) >= CALM_CONFIG.minPairDistancePct;
      });
      const secondZone =
        farZones[Math.floor(Math.random() * farZones.length)] ??
        zones.find((z) => z.zone !== firstZone.zone) ??
        zones[0];

      notes.push({
        id: nextId++,
        zone: secondZone,
        xPct: Math.max(18, Math.min(82, secondZone.xPct)),
        yPct: Math.max(18, Math.min(82, secondZone.yPct)),
        spawnTime,
        hitTime,
        approachMs: stageCfg.approachMs,
        resolved: false,
      });
    }
  }

  return notes;
}

type CalmMood = keyof typeof STRINGS.calm.moods;

function getMoodFromCalm(calm: number): CalmMood {
  if (calm < 30) return 'furious';
  if (calm < 55) return 'grumpy';
  if (calm < 80) return 'neutral';
  return 'relaxed';
}

export function CalmGame({sessionId, speciesChoice, player, onClose}: CalmGameProps) {
  const species = useMemo(() => {
    if (speciesChoice === 'random') {
      return getRandomCalmSpecies();
    }
    return getCalmSpecies(speciesChoice);
  }, [speciesChoice, sessionId]);

  const zones = useMemo<readonly ZoneCoord[]>(
    () =>
      species.petZones ?? [
        {zone: 'head', label: 'Kepala', xPct: 45, yPct: 28},
        {zone: 'cheek', label: 'Pipi', xPct: 34, yPct: 46},
        {zone: 'back', label: 'Punggung', xPct: 62, yPct: 48},
        {zone: 'belly', label: 'Perut', xPct: 50, yPct: 68},
      ],
    [species],
  );

  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [calm, setCalm] = useState<number>(CALM_CONFIG.stages[0].startCalm);
  const [counts, setCounts] = useState({perfect: 0, good: 0, miss: 0});
  const [failReason, setFailReason] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(() => soundFx.isMuted());
  const [nowMs, setNowMs] = useState<number>(() => performance.now());
  const [renderNotes, setRenderNotes] = useState<ScheduledNote[]>([]);
  const [effects, setEffects] = useState<FloatingEffect[]>([]);
  const [patTick, setPatTick] = useState(0);

  const stageCfg = CALM_CONFIG.stages[stageIndex];

  const notesRef = useRef<ScheduledNote[]>([]);
  const calmRef = useRef<number>(stageCfg.startCalm);
  const countsRef = useRef({perfect: 0, good: 0, miss: 0});
  const phaseRef = useRef<Phase>('ready');
  const rafRef = useRef<number | null>(null);
  const effectIdRef = useRef(1);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const emitStageResult = useCallback(
    (
      outcome: 'success' | 'fail',
      finalCounts: {perfect: number; good: number; miss: number},
      reason?: string,
    ) => {
      const total = finalCounts.perfect + finalCounts.good + finalCounts.miss;
      const accuracy =
        total > 0
          ? Math.round(((finalCounts.perfect + finalCounts.good * 0.5) / total) * 100)
          : 0;

      void sendResultBroadcast({
        sessionId,
        game: 'calm',
        stage: stageCfg.stage,
        stageLabel: stageCfg.name,
        outcome,
        reason,
        playerId: player.id,
        playerName: player.name,
        perfect: finalCounts.perfect,
        good: finalCounts.good,
        miss: finalCounts.miss,
        accuracy,
        timestamp: Date.now(),
      });
    },
    [player.id, player.name, sessionId, stageCfg.name, stageCfg.stage],
  );

  const spawnFloatingEffect = useCallback(
    (xPct: number, yPct: number, kind: JudgmentKind) => {
      const id = effectIdRef.current++;
      const text = STRINGS.calm.judgments[kind];
      setEffects((prev) => [...prev.slice(-6), {id, xPct, yPct, kind, text}]);
      window.setTimeout(() => {
        setEffects((prev) => prev.filter((item) => item.id !== id));
      }, 650);
    },
    [],
  );

  const finishStage = useCallback(
    (outcome: 'success' | 'fail', reason?: string) => {
      if (phaseRef.current !== 'playing') return;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const finalCounts = {...countsRef.current};
      setCounts(finalCounts);

      if (outcome === 'fail') {
        phaseRef.current = 'stage_fail';
        setFailReason(reason ?? STRINGS.calm.stageFailedThreshold);
        setPhase('stage_fail');
        soundFx.playFail();
        emitStageResult('fail', finalCounts, reason);
        return;
      }

      soundFx.playVictory();
      emitStageResult('success', finalCounts);

      if (stageIndex >= CALM_CONFIG.stages.length - 1) {
        phaseRef.current = 'victory';
        setPhase('victory');
      } else {
        phaseRef.current = 'stage_success';
        setPhase('stage_success');
      }
    },
    [emitStageResult, stageIndex],
  );

  const startStage = useCallback(
    (targetStageIdx: number) => {
      const cfg = CALM_CONFIG.stages[targetStageIdx];
      const startAt = performance.now();
      const generated = buildStageNotes(cfg, zones, startAt);

      notesRef.current = generated;
      calmRef.current = cfg.startCalm;
      countsRef.current = {perfect: 0, good: 0, miss: 0};
      phaseRef.current = 'playing';

      setStageIndex(targetStageIdx);
      setCalm(cfg.startCalm);
      setCounts({perfect: 0, good: 0, miss: 0});
      setFailReason('');
      setEffects([]);
      setNowMs(startAt);
      setRenderNotes(generated);
      setPhase('playing');
    },
    [zones],
  );

  useEffect(() => {
    setCalm(CALM_CONFIG.stages[0].startCalm);
    setStageIndex(0);
    setPhase('ready');
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    const tick = (frameNow: number) => {
      if (phaseRef.current !== 'playing') return;

      let expiredThisFrame = false;
      for (const note of notesRef.current) {
        if (!note.resolved && frameNow > note.hitTime + CALM_CONFIG.goodWindowMs) {
          note.resolved = true;
          note.judgment = 'miss';
          countsRef.current.miss += 1;
          calmRef.current = Math.max(
            CALM_CONFIG.minCalm,
            calmRef.current - stageCfg.missPenalty,
          );
          expiredThisFrame = true;
          soundFx.playMiss();
          spawnFloatingEffect(note.xPct, note.yPct, 'miss');
        }
      }

      if (expiredThisFrame) {
        setCalm(calmRef.current);
        setCounts({...countsRef.current});
        if (calmRef.current <= CALM_CONFIG.minCalm) {
          finishStage('fail', STRINGS.calm.stageFailedZero);
          return;
        }
      }

      setNowMs(frameNow);
      setRenderNotes([...notesRef.current]);

      const allResolved = notesRef.current.every((n) => n.resolved);
      if (allResolved) {
        if (calmRef.current >= stageCfg.threshold) {
          finishStage('success');
        } else {
          finishStage('fail', STRINGS.calm.stageFailedThreshold);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [finishStage, phase, spawnFloatingEffect, stageCfg.missPenalty, stageCfg.threshold]);

  const handleTapCircle = useCallback(
    (noteId: number, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (phaseRef.current !== 'playing') return;

      const tapTime = performance.now();
      const note = notesRef.current.find((n) => n.id === noteId && !n.resolved);
      if (!note) return;

      const delta = Math.abs(tapTime - note.hitTime);
      let judgment: JudgmentKind = 'miss';

      if (delta <= CALM_CONFIG.perfectWindowMs) {
        judgment = 'perfect';
        countsRef.current.perfect += 1;
        calmRef.current = Math.min(
          CALM_CONFIG.maxCalm,
          calmRef.current + CALM_CONFIG.perfectGain,
        );
        soundFx.playPerfect();
        setPatTick((v) => v + 1);
      } else if (delta <= CALM_CONFIG.goodWindowMs) {
        judgment = 'good';
        countsRef.current.good += 1;
        calmRef.current = Math.min(
          CALM_CONFIG.maxCalm,
          calmRef.current + CALM_CONFIG.goodGain,
        );
        soundFx.playGood();
        setPatTick((v) => v + 1);
      } else {
        judgment = 'miss';
        countsRef.current.miss += 1;
        calmRef.current = Math.max(
          CALM_CONFIG.minCalm,
          calmRef.current - stageCfg.missPenalty,
        );
        soundFx.playMiss();
      }

      note.resolved = true;
      note.judgment = judgment;

      spawnFloatingEffect(note.xPct, note.yPct, judgment);
      setCalm(calmRef.current);
      setCounts({...countsRef.current});
      setRenderNotes([...notesRef.current]);

      if (calmRef.current <= CALM_CONFIG.minCalm) {
        finishStage('fail', STRINGS.calm.stageFailedZero);
        return;
      }

      if (notesRef.current.every((n) => n.resolved)) {
        if (calmRef.current >= stageCfg.threshold) {
          finishStage('success');
        } else {
          finishStage('fail', STRINGS.calm.stageFailedThreshold);
        }
      }
    },
    [finishStage, spawnFloatingEffect, stageCfg.missPenalty, stageCfg.threshold],
  );

  const toggleMute = () => {
    const next = !muted;
    soundFx.setMuted(next);
    setMuted(next);
  };

  const mood = getMoodFromCalm(calm);
  const showAngerEffect = mood === 'furious' || mood === 'grumpy';
  const totalHits = counts.perfect + counts.good + counts.miss;
  const accuracy =
    totalHits > 0
      ? Math.round(((counts.perfect + counts.good * 0.5) / totalHits) * 100)
      : 100;

  const visibleNotes = renderNotes.filter(
    (note) => !note.resolved && nowMs >= note.spawnTime && nowMs <= note.hitTime + CALM_CONFIG.goodWindowMs,
  );

  return (
    <div className="game-shell game-calm">
      <PetalburgWoodsScene />

      <div className="game-topbar">
        <LocationBanner title={STRINGS.locations.calm} accent="forest" />
        <div className="game-topbar-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={toggleMute}
            aria-label={muted ? STRINGS.common.unmute : STRINGS.common.mute}
            title={muted ? STRINGS.common.unmute : STRINGS.common.mute}
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

      {/* HUD Strip */}
      <div className="calm-hud">
        <div className="calm-hud-meta">
          <span className="hud-title">
            {species.name} · {STRINGS.common.stage} {stageCfg.stage}/3 ({stageCfg.name})
          </span>
          <span className="hud-sub">
            {STRINGS.calm.moods[mood]}
            {showAngerEffect && species.angerLabel ? ` · ${species.angerLabel}` : ''}
          </span>
        </div>

        <div className="calm-meter-wrap">
          <div className="calm-meter-labels">
            <span>{STRINGS.calm.calmMeter}</span>
            <span className="tabular-nums">
              {calm}/100 ({STRINGS.calm.targetLabel} {stageCfg.threshold})
            </span>
          </div>
          <div className="calm-meter-track" role="progressbar" aria-valuenow={calm} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`calm-meter-fill mood-fill-${mood}`}
              style={{width: `${calm}%`}}
            />
            <div
              className="calm-threshold-marker"
              style={{left: `${stageCfg.threshold}%`}}
              title={`${STRINGS.calm.targetLabel}: ${stageCfg.threshold}`}
            />
          </div>
        </div>

        <div className="calm-stats-inline tabular-nums">
          <span>
            {STRINGS.common.perfect}: {counts.perfect}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {STRINGS.common.good}: {counts.good}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {STRINGS.common.miss}: {counts.miss}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {STRINGS.common.accuracy}: {accuracy}%
          </span>
        </div>
      </div>

      {/* Center Play Stage */}
      <div className="calm-arena">
        <div className={`pokemon-stage mood-stage-${mood}`}>
          <PokemonSprite
            speciesId={species.id}
            mood={mood}
            showAngerEffect={showAngerEffect}
            className="calm-pokemon-sprite"
          />

          {/* Hand-pat & sparkle feedback */}
          {patTick > 0 && phase === 'playing' && (
            <div key={patTick} className="pat-burst" aria-hidden="true">
              <span className="pat-hand">✋</span>
              <span className="pat-sparkle">✦</span>
            </div>
          )}

          {/* Active rhythm petting circles */}
          {phase === 'playing' &&
            visibleNotes.map((note) => {
              const remainingMs = note.hitTime - nowMs;
              const progress = Math.max(0, Math.min(1, 1 - remainingMs / note.approachMs));
              const ringScale = 2.35 - progress * 1.35;
              const inPerfectWindow = Math.abs(remainingMs) <= CALM_CONFIG.perfectWindowMs;

              return (
                <button
                  key={note.id}
                  type="button"
                  className={`rhythm-circle ${inPerfectWindow ? 'is-perfect-ready' : ''}`}
                  style={{left: `${note.xPct}%`, top: `${note.yPct}%`}}
                  onPointerDown={(e) => handleTapCircle(note.id, e)}
                  aria-label={`Ketuk ${note.zone.label}`}
                >
                  <span
                    className="rhythm-approach-ring"
                    style={{transform: `translate(-50%, -50%) scale(${ringScale.toFixed(3)})`}}
                  />
                  <span className="rhythm-core">{note.zone.label}</span>
                </button>
              );
            })}

          {/* Floating Indonesian judgment text */}
          {effects.map((fx) => (
            <div
              key={fx.id}
              className={`floating-judgment judgment-${fx.kind}`}
              style={{left: `${fx.xPct}%`, top: `${fx.yPct}%`}}
            >
              {fx.text}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Overlay Cards */}
      {phase === 'ready' && (
        <div className="game-overlay">
          <div className="galar-modal-card">
            <div className="galar-card-stripe" />
            <h2 className="galar-title">
              {STRINGS.calm.title} — {species.name}
            </h2>
            <p className="galar-subtitle">
              {STRINGS.common.stage} {stageCfg.stage}: {stageCfg.name} ·{' '}
              {stageCfg.totalCircles} ketukan · {STRINGS.calm.targetLabel} {stageCfg.threshold}
            </p>
            <p className="galar-body">{STRINGS.calm.subtitle}</p>
            <p className="galar-hint">{STRINGS.calm.readyHint}</p>
            <button
              type="button"
              className="btn-galar-primary"
              onClick={() => startStage(stageIndex)}
            >
              {STRINGS.calm.startStageBtn} {stageCfg.stage}
            </button>
          </div>
        </div>
      )}

      {phase === 'stage_success' && (
        <div className="game-overlay">
          <div className="galar-modal-card">
            <div className="galar-card-stripe stripe-leaf" />
            <h2 className="galar-title">{STRINGS.calm.stageClearedTitle}</h2>
            <p className="galar-body">{STRINGS.calm.stageClearedDesc}</p>
            <div className="result-summary-row tabular-nums">
              <span>
                {STRINGS.calm.calmMeter}: {calm}/100
              </span>
              <span>
                {STRINGS.common.accuracy}: {accuracy}%
              </span>
              <span>
                {STRINGS.common.perfect}: {counts.perfect} · {STRINGS.common.good}: {counts.good} ·{' '}
                {STRINGS.common.miss}: {counts.miss}
              </span>
            </div>
            <button
              type="button"
              className="btn-galar-primary"
              onClick={() => startStage(stageIndex + 1)}
            >
              {STRINGS.calm.nextStageBtn} {stageIndex + 2}
            </button>
          </div>
        </div>
      )}

      {phase === 'stage_fail' && (
        <div className="game-overlay">
          <div className="galar-modal-card">
            <div className="galar-card-stripe stripe-ruby" />
            <h2 className="galar-title">{STRINGS.calm.stageFailedTitle}</h2>
            <p className="galar-body">{failReason}</p>
            <div className="result-summary-row tabular-nums">
              <span>
                {STRINGS.calm.calmMeter}: {calm}/{stageCfg.threshold}
              </span>
              <span>
                {STRINGS.common.accuracy}: {accuracy}%
              </span>
            </div>
            <button
              type="button"
              className="btn-galar-danger"
              onClick={() => startStage(stageIndex)}
            >
              {STRINGS.common.retry}
            </button>
          </div>
        </div>
      )}

      {phase === 'victory' && (
        <div className="game-overlay">
          <div className="galar-modal-card">
            <div className="galar-card-stripe stripe-sunny" />
            <div className="victory-pokemon-preview">
              <PokemonSprite speciesId={species.id} mood="relaxed" />
            </div>
            <h2 className="galar-title">{STRINGS.calm.victoryTitle}</h2>
            <p className="galar-body">
              {species.name}: {STRINGS.calm.victoryDesc}
            </p>
            <div className="result-summary-row tabular-nums">
              <span>
                {STRINGS.calm.calmMeter}: {calm}/100
              </span>
              <span>
                {STRINGS.common.accuracy}: {accuracy}%
              </span>
            </div>
            <div className="galar-actions-row">
              <button
                type="button"
                className="btn-galar-primary"
                onClick={() => startStage(0)}
              >
                {STRINGS.calm.playAgain}
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
