/**
 * Live-screen trivia sound, synthesised in the browser with WebAudio.
 * No audio files: every sound below is generated here (original work, CC0).
 * Credits and licences: docs/trivia-sound-credits.md.
 *
 *  - lobby loop:  C–G–Am–F at 104 bpm, soft pad + plucked arpeggio + bass + light kick/shaker
 *  - tick:        short woodblock for the question countdown (urgent in the last 5 seconds)
 *  - reveal:      noise swell into a bright major chord stab
 *  - fanfare:     brass-like melody over chords, timpani roll and a cymbal for the podium
 */

export type TriviaSfx = "tick" | "tickUrgent" | "reveal" | "fanfare";

type AudioCtor = typeof AudioContext;

const BPM = 104;
const EIGHTH = 60 / BPM / 2;
const LOOKAHEAD_S = 0.15;
const SCHEDULER_MS = 30;

// MIDI note numbers for C – G – Am – F (root, third, fifth, octave).
const CHORDS: number[][] = [
  [60, 64, 67, 72],
  [55, 59, 62, 67],
  [57, 60, 64, 69],
  [53, 57, 60, 65],
];
const ARP = [0, 1, 2, 1, 3, 2, 1, 2];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class TriviaSoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private sfx: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private nextTime = 0;
  private step = 0;
  private enabled = true;
  private volume = 0.7;

  /** Create the context lazily (it starts "suspended" until a user gesture). */
  ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor: AudioCtor | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = 0.55;
    this.music.connect(this.master);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);
    this.noise = this.makeNoise(ctx);
    this.applyGain(true);
    return ctx;
  }

  /** True while the browser still blocks audio (autoplay policy). */
  get blocked(): boolean {
    return !this.ctx || this.ctx.state !== "running";
  }

  get supported(): boolean {
    return !!((window as any).AudioContext || (window as any).webkitAudioContext);
  }

  async unlock(): Promise<boolean> {
    const ctx = this.ensure();
    if (!ctx) return false;
    try {
      await ctx.resume();
      // A silent blip so iOS/Safari fully unlocks output.
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      /* stays blocked */
    }
    return ctx.state === "running";
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.applyGain();
  }

  /** 0..100 */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, Number(volume) || 0)) / 100;
    this.applyGain();
  }

  get lobbyPlaying(): boolean {
    return this.loopTimer !== null;
  }

  startLobby(): void {
    const ctx = this.ensure();
    if (!ctx || this.loopTimer) return;
    if (this.music) {
      this.music.gain.cancelScheduledValues(ctx.currentTime);
      this.music.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.music.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 1.2);
    }
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.08;
    this.loopTimer = setInterval(() => this.scheduleLobby(), SCHEDULER_MS);
  }

  stopLobby(fadeSeconds = 0.8): void {
    if (!this.loopTimer) return;
    clearInterval(this.loopTimer);
    this.loopTimer = null;
    const ctx = this.ctx;
    if (!ctx || !this.music) return;
    const now = ctx.currentTime;
    this.music.gain.cancelScheduledValues(now);
    this.music.gain.setValueAtTime(Math.max(0.0001, this.music.gain.value), now);
    this.music.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
  }

  play(name: TriviaSfx): void {
    const ctx = this.ensure();
    if (!ctx || ctx.state !== "running" || !this.enabled) return;
    const t = ctx.currentTime + 0.02;
    if (name === "tick") this.tick(t, false);
    else if (name === "tickUrgent") this.tick(t, true);
    else if (name === "reveal") this.reveal(t);
    else if (name === "fanfare") this.fanfare(t);
  }

  dispose(): void {
    this.stopLobby(0.05);
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx) ctx.close().catch(() => undefined);
  }

  /* ------------------------------------------------------------------ */

  private applyGain(immediate = false): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    // Perceptual curve so the slider feels even.
    const target = this.enabled ? Math.pow(this.volume, 1.6) * 0.9 : 0;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    if (immediate) {
      this.master.gain.setValueAtTime(target, now);
    } else {
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(target, now + 0.25);
    }
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 1234567;
    for (let i = 0; i < length; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (seed / 0x7fffffff) * 2 - 1;
    }
    return buffer;
  }

  private scheduleLobby(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD_S) {
      this.lobbyStep(this.step, this.nextTime);
      this.nextTime += EIGHTH;
      this.step = (this.step + 1) % (8 * CHORDS.length);
    }
  }

  private lobbyStep(step: number, t: number): void {
    const bar = Math.floor(step / 8);
    const inBar = step % 8;
    const chord = CHORDS[bar];
    const out = this.music as GainNode;

    if (inBar === 0) this.pad(chord, t, EIGHTH * 8, out);
    this.pluck(hz(chord[ARP[inBar]] + 12), t, out, inBar % 2 ? 0.07 : 0.1);
    if (inBar === 0 || inBar === 4) {
      this.bass(hz(chord[0] - 24), t, out);
      this.kick(t, out, 0.22);
    }
    if (inBar === 3 || inBar === 7) this.bass(hz(chord[2] - 24), t, out, 0.1);
    this.shaker(t, out, inBar % 2 ? 0.035 : 0.02);
  }

  private envGain(t: number, attack: number, peak: number, decay: number, out: AudioNode): GainNode {
    const ctx = this.ctx as AudioContext;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(out);
    return g;
  }

  private osc(type: OscillatorType, freq: number, t: number, dur: number, dest: AudioNode, detune = 0): OscillatorNode {
    const ctx = this.ctx as AudioContext;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.detune.setValueAtTime(detune, t);
    o.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  private lowpass(freq: number, dest: AudioNode, q = 0.7): BiquadFilterNode {
    const f = (this.ctx as AudioContext).createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    f.Q.value = q;
    f.connect(dest);
    return f;
  }

  private pad(chord: number[], t: number, dur: number, out: AudioNode): void {
    const ctx = this.ctx as AudioContext;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.35);
    g.gain.setValueAtTime(0.05, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.1);
    const lp = this.lowpass(950, out);
    g.connect(lp);
    chord.slice(0, 3).forEach((note, i) => {
      this.osc("sawtooth", hz(note), t, dur + 0.1, g, i % 2 ? 7 : -7);
    });
  }

  private pluck(freq: number, t: number, out: AudioNode, peak: number): void {
    const lp = this.lowpass(2600, out);
    const g = this.envGain(t, 0.005, peak, 0.32, lp);
    this.osc("triangle", freq, t, 0.4, g);
  }

  private bass(freq: number, t: number, out: AudioNode, peak = 0.16): void {
    const g = this.envGain(t, 0.01, peak, 0.4, out);
    this.osc("sine", freq, t, 0.45, g);
  }

  private kick(t: number, out: AudioNode, peak: number): void {
    const ctx = this.ctx as AudioContext;
    const g = this.envGain(t, 0.003, peak, 0.22, out);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.3);
  }

  private noiseBurst(t: number, dur: number, peak: number, filter: BiquadFilterType, freq: number, out: AudioNode, attack = 0.002): AudioBufferSourceNode {
    const ctx = this.ctx as AudioContext;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const g = this.envGain(t, attack, peak, dur, out);
    src.connect(f);
    f.connect(g);
    src.start(t, Math.random() * 1.5);
    src.stop(t + attack + dur + 0.05);
    return src;
  }

  private shaker(t: number, out: AudioNode, peak: number): void {
    this.noiseBurst(t, 0.06, peak, "highpass", 7000, out);
  }

  private tick(t: number, urgent: boolean): void {
    const ctx = this.ctx as AudioContext;
    const out = this.sfx as GainNode;
    const g = this.envGain(t, 0.002, urgent ? 0.5 : 0.22, urgent ? 0.09 : 0.05, out);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(urgent ? 1760 : 1320, t);
    o.frequency.exponentialRampToValueAtTime(urgent ? 1100 : 880, t + 0.05);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.15);
    if (urgent) this.noiseBurst(t, 0.03, 0.12, "bandpass", 3500, out);
  }

  private reveal(t: number): void {
    const ctx = this.ctx as AudioContext;
    const out = this.sfx as GainNode;
    // Riser: filtered noise sweeping up.
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(5000, t + 0.45);
    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.0001, t);
    rg.gain.exponentialRampToValueAtTime(0.25, t + 0.42);
    rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(bp);
    bp.connect(rg);
    rg.connect(out);
    src.start(t);
    src.stop(t + 0.55);

    // Stab: bright C major spread.
    const hit = t + 0.45;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(5200, hit);
    lp.frequency.exponentialRampToValueAtTime(900, hit + 1.1);
    lp.connect(out);
    const g = this.envGain(hit, 0.01, 0.16, 1.3, lp);
    [60, 64, 67, 72, 76, 79].forEach((note, i) => this.osc("sawtooth", hz(note), hit, 1.4, g, i % 2 ? 6 : -6));
    this.kick(hit, out, 0.5);
    this.noiseBurst(hit, 0.9, 0.08, "highpass", 6000, out);
  }

  private brass(note: number, t: number, dur: number, peak: number, out: AudioNode): void {
    const ctx = this.ctx as AudioContext;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(700, t);
    lp.frequency.linearRampToValueAtTime(3200, t + 0.06);
    lp.frequency.exponentialRampToValueAtTime(1500, t + dur);
    lp.connect(out);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.04);
    g.gain.setValueAtTime(peak * 0.8, t + Math.max(0.05, dur - 0.08));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    g.connect(lp);
    this.osc("sawtooth", hz(note), t, dur + 0.15, g, -5);
    this.osc("square", hz(note), t, dur + 0.15, g, 5);
  }

  private fanfare(t: number): void {
    const out = this.sfx as GainNode;
    // Timpani roll into the first hit.
    for (let i = 0; i < 10; i++) {
      const tt = t + i * 0.045;
      this.noiseBurst(tt, 0.08, 0.04 + i * 0.01, "lowpass", 260, out);
    }
    const s = t + 0.45;
    const melody: [number, number, number][] = [
      [67, 0, 0.16],
      [72, 0.18, 0.16],
      [76, 0.36, 0.16],
      [79, 0.54, 0.5],
      [76, 1.08, 0.16],
      [79, 1.26, 1.1],
    ];
    melody.forEach(([note, at, dur]) => this.brass(note, s + at, dur, 0.13, out));
    const chords: [number[], number, number][] = [
      [[48, 55, 60, 64], 0, 1.0],
      [[53, 57, 60, 65], 1.08, 0.18],
      [[48, 55, 60, 64, 67], 1.26, 1.3],
    ];
    chords.forEach(([notes, at, dur]) => notes.forEach((n) => this.brass(n, s + at, dur, 0.05, out)));
    this.kick(s, out, 0.55);
    this.kick(s + 1.26, out, 0.6);
    // Cymbal on the last chord.
    this.noiseBurst(s + 1.26, 2.2, 0.12, "highpass", 5000, out, 0.005);
  }
}
