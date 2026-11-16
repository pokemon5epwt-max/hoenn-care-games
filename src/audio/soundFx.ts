class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(next: boolean): void {
    this.muted = next;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') {
      return null;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType,
    volume: number,
    endFreq?: number,
    delaySec = 0,
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + durationSec);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  public playPerfect(): void {
    this.playTone(660, 0.11, 'sine', 0.14, 880);
    this.playTone(990, 0.15, 'triangle', 0.1, 1175, 0.045);
  }

  public playGood(): void {
    this.playTone(523.25, 0.11, 'sine', 0.11, 587.33);
  }

  public playMiss(): void {
    this.playTone(190, 0.16, 'triangle', 0.09, 130);
  }

  public playPourTick(fillPct: number): void {
    const pitch = 320 + Math.min(fillPct, 100) * 3.8;
    this.playTone(pitch, 0.045, 'sine', 0.045, pitch * 1.05);
  }

  public playEatHappy(): void {
    this.playTone(523.25, 0.1, 'triangle', 0.12);
    this.playTone(659.25, 0.1, 'triangle', 0.12, undefined, 0.08);
    this.playTone(783.99, 0.18, 'sine', 0.13, undefined, 0.16);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.19, 'triangle', 0.13, undefined, idx * 0.09);
    });
  }

  public playFail(): void {
    this.playTone(311.13, 0.18, 'triangle', 0.11, 277.18);
    this.playTone(246.94, 0.28, 'triangle', 0.11, 196, 0.14);
  }
}

export const soundFx = new SoundEngine();
