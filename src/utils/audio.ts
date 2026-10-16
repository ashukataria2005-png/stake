// Web Audio API Synthesizer for Stake Games

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("stake_sound_enabled");
        if (stored !== null) {
          this.enabled = stored !== "false";
        }
        const storedVol = localStorage.getItem("stake_sound_volume");
        if (storedVol !== null) {
          this.volume = parseFloat(storedVol) || 0.5;
        }
      } catch {}
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("stake_sound_enabled", enabled ? "true" : "false");
      } catch {}
    }
  }

  public toggleSound(): boolean {
    const next = !this.enabled;
    this.setSoundEnabled(next);
    return next;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.enabled = this.volume > 0;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("stake_sound_volume", this.volume.toString());
        localStorage.setItem("stake_sound_enabled", this.enabled ? "true" : "false");
      } catch {}
    }
  }

  private initCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Crisp mechanical button click / tile tap
  playClick() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  // Crisp high-frequency crystal bell chime with rising pitch based on current gem step count (baseFreq * Math.pow(1.08, step))
  playGem(gemsCount: number = 1) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const step = Math.max(1, Math.min(gemsCount, 24));
      // Base frequency 523.25 Hz (C5) climbing crisply by 1.08 per gem
      const baseFreq = 523.25 * Math.pow(1.08, step - 1);

      // Primary crystal fundamental
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      // Bell shimmer overtone (harmonic ratio ~2.756 for crystal timbre)
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(baseFreq * 2.756, ctx.currentTime);

      // Quick snappy bell envelope
      gain.gain.setValueAtTime(0.22 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);

      overtoneGain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      overtone.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      osc.start();
      overtone.start();
      osc.stop(ctx.currentTime + 0.32);
      overtone.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  // Low-pass filtered sub-bass boom with quick decay (Bomb Explosion)
  playMine() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      // Low-pass filter for authentic heavy muffled sub-bass boom
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.45);

      // Sub-bass dropping oscillator (110Hz -> 28Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(110, ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.45);

      subGain.gain.setValueAtTime(0.4 * this.volume, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      subOsc.connect(filter);

      // Blast texture noise buffer
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28 * this.volume, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

      noise.connect(filter);
      filter.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start();
      noise.start();
      subOsc.stop(ctx.currentTime + 0.45);
      noise.stop(ctx.currentTime + 0.22);
    } catch {}
  }

  // Triumphant electronic double chime chord (Cashout / Big Win)
  playCashout() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      // Chord 1 (C Major: C5, E5, G5) -> Chord 2 (F Major/A5 triumphant resolution)
      const chord1 = [523.25, 659.25, 783.99]; // C5, E5, G5
      const chord2 = [659.25, 783.99, 1046.5]; // E5, G5, C6

      // Play chord 1
      chord1.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      });

      // Play chord 2 (delayed by 90ms for punchy double chime)
      chord2.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.09);

        gain.gain.setValueAtTime(0.16 * this.volume, ctx.currentTime + 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + 0.09);
        osc.stop(ctx.currentTime + 0.42);
      });
    } catch {}
  }

  // Subtly rising tick / heartbeat during climbing multiplier
  playTick(multiplier: number = 1.0) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const freq = Math.min(1200, 320 + multiplier * 35);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {}
  }

  // Crash explosion alias (low-pass sub-bass boom)
  playCrash() {
    this.playMine();
  }

  // Ultra-short wooden/metallic pin click with micro pitch randomization (Plinko Peg)
  playPeg() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Metallic pin overtone mixture
      osc.type = "sine";
      const freq = 850 + (Math.random() - 0.5) * 360;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.018);

      gain.gain.setValueAtTime(0.06 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.018);
    } catch {}
  }

  // Bass thump tailored to bucket multiplier tier (Plinko Bucket Land)
  playBucket(multiplier: number = 1.0) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const isHighTier = multiplier >= 10;
      const isExtreme = multiplier >= 100;

      // Heavy sub-bass thump (pitch lower for higher multiplier)
      const baseBass = Math.max(45, 140 - Math.log2(Math.max(1, multiplier)) * 14);
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(baseBass, ctx.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.28);

      const amp = Math.min(0.4, 0.14 + Math.log10(Math.max(1, multiplier)) * 0.12) * this.volume;
      bassGain.gain.setValueAtTime(amp, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start();
      bassOsc.stop(ctx.currentTime + 0.28);

      // If high or extreme tier, add triumphant sparkling chord
      if (isHighTier) {
        const chord = isExtreme ? [659.25, 880, 1046.5, 1318.5] : [523.25, 659.25, 783.99];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
          gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.04 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.04);
          osc.stop(ctx.currentTime + idx * 0.04 + 0.35);
        });
      }
    } catch {}
  }

  // Soft disappointment chime for loss
  playLoss() {
    this.playDiceLoss();
  }

  // Upbeat win arpeggio alias
  playWin() {
    this.playCashout();
  }

  // Fast mechanical spinning ticking sound (Dice / Limbo Roll)
  playDiceRoll() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      // 5 rapid mechanical ticking pulses
      [0, 0.03, 0.06, 0.09, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(700 + Math.random() * 300, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.05 * this.volume, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.022);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.022);
      });
    } catch {}
  }

  // Instant winning resolution tone (Dice)
  playDiceWin() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const notes = [587.33, 880]; // D5, A5 crisp double ring
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {}
  }

  // Instant loss resolution tone (Dice / Limbo)
  playDiceLoss() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.16 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  // Pleasant ascending harmonic success chime for authentication
  playSuccessChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  // Fast mechanical spinning ticking sound (Limbo acceleration tick)
  playLimboTick(stepRatio: number = 0) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      const freq = 520 + stepRatio * 480; // rises from ~520Hz to ~1000Hz
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {}
  }

  // Limbo explosive win chord
  playLimboWin(multiplier: number = 2.0) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const chord = multiplier >= 10 ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 739.99, 880];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.03);
        gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.03 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.03);
        osc.stop(ctx.currentTime + idx * 0.03 + 0.4);
      });
    } catch {}
  }

  // Limbo dull loss click
  playLimboLoss() {
    this.playDiceLoss();
  }

  // HiLo Card slide / flip swoosh
  playCardFlip() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  // HiLo correct guess success chime
  playCardSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const notes = [659.25, 880]; // E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } catch {
      // ignore
    }
  }

  // HiLo wrong guess loss thump
  playCardLoss() {
    this.playDiceLoss();
  }

  // Keno number tile select/deselect tick
  playKenoPick() {
    this.playClick();
  }

  // Keno ball draw - distinct ping if hit vs normal ping
  playKenoDraw(isHit: boolean) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isHit ? "triangle" : "sine";
      const freq = isHit ? 987.77 : 440; // B5 for hit, A4 for regular
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(isHit ? 0.15 : 0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isHit ? 0.18 : 0.06));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isHit ? 0.18 : 0.06));
    } catch {
      // ignore
    }
  }

  // Keno round win fanfare
  playKenoWin(mult: number) {
    this.playLimboWin(mult);
  }

  // Slide conveyor tick
  playSlideTick() {
    this.playLimboTick(0.2);
  }

  // Slide conveyor stop marker chime
  playSlideStop() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  // Slide win tone
  playSlideWin() {
    this.playCashout();
  }

  // Chicken cloche lift sound
  playClocheOpen() {
    this.playCardFlip();
  }

  // Chicken safe dish uncovered (sizzle / pleasant chime)
  playChickenSafe(gemsCount: number = 1) {
    this.playGem(gemsCount);
  }

  // Chicken bone trap bust
  playBoneCrack() {
    this.playMine();
  }

  // Moles dig / burrow rustle
  playMoleDig() {
    this.playCardFlip();
  }

  // Moles safe mole pop chime
  playMolePop(safeCount: number = 1) {
    this.playGem(safeCount);
  }

  // Moles mud trap bust
  playMoleBust() {
    this.playMine();
  }

  // Packs case tear / unboxing whoosh
  playPackTear() {
    this.playCardFlip();
  }

  // Packs card reveal shimmer
  playPackReveal() {
    this.playSuccessChime();
  }

  // Packs jackpot fanfare
  playPackJackpot() {
    this.playCashout();
  }

  // Pump balloon inflation stroke with rising pitch
  playPumpInflate(level: number = 1) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const freq = Math.min(1100, 320 + level * 30);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  // Pump balloon pop / burst
  playBalloonPop() {
    this.playMine();
  }

  // Crisp bet placement sound
  playBet() {
    this.playClick();
  }

  // Dragon Tower safe egg reveal
  playDragonEgg(floor: number = 1) {
    this.playGem(floor);
  }

  // Dragon Tower skull / fire bust
  playDragonBust() {
    this.playMine();
  }

  // Dragon Tower stone row transition
  playStoneSlide() {
    this.playCardFlip();
  }

  // Roulette wheel spin rattle
  playRouletteSpin() {
    this.playDiceRoll();
  }

  // Roulette ball bounce tick
  playBallBounce() {
    this.playPeg();
  }

  // Roulette win fanfare
  playRouletteWin() {
    this.playCashout();
  }

  // Blackjack card deal swoosh
  playCardDeal() {
    this.playCardFlip();
  }

  // Blackjack chip place click
  playChipPlace() {
    this.playClick();
  }

  // Darts throw swoosh
  playDartThrow() {
    this.playCardFlip();
  }

  // Darts board thud
  playDartHit() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Diamonds gem drop chime
  playGemDrop(idx: number = 1) {
    this.playGem(idx);
  }

  // Diamonds reveal shimmer
  playGemShimmer() {
    this.playSuccessChime();
  }

  // Wheel ticker peg click
  playWheelTick() {
    this.playPeg();
  }

  // Cases reel slide tick
  playCaseReelTick() {
    this.playPeg();
  }

  // Cases marker snap
  playCaseMarkerSnap() {
    this.playClick();
  }

  // Flip: Coin toss flick
  playCoinToss() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Flip: Coin landing slap
  playCoinSlap() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Bust / explosion loss sound
  playBust() {
    this.playMine();
  }



  // Baccarat: Score reveal
  playBaccaratScore() {
    this.playClick();
  }

  // Baccarat: Win fanfare
  playBaccaratWin() {
    this.playCashout();
  }

  // Drill: Mechanical rumble
  playDrillRumble() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(75, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  // Drill: Rock smash
  playRockSmash() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  // Drill: Jam warning
  playDrillJam() {
    this.playBust();
  }

  // Tarot: Card flip swoosh
  playTarotFlip() {
    this.playCardFlip();
  }

  // Tarot: Arcane shimmer tone
  playTarotChime() {
    this.playSuccessChime();
  }

  // RPS: Fist thump countdown
  playFistThump() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // RPS: Hand reveal swoosh
  playHandSwoosh() {
    this.playCardFlip();
  }

  // RPS: Tie click
  playTieClick() {
    this.playClick();
  }

  // RPS: Bust sound
  playBustSound() {
    this.playBust();
  }

  // Slots: Reel spinning hum
  playReelSpin() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Slots: Stone/Metal reel stop clack
  playReelStop() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Slots: Payline win chime
  playPaylineWin() {
    this.playSuccessChime();
  }

  // Blue Samurai: Katana slash swoosh
  playKatanaSlash() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  // Blue Samurai: Katana clash metallic ring
  playKatanaClash() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // Bars: Vintage arcade bell chime
  playVintageBell() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }

  // Bars: Vintage jackpot siren
  playJackpotSiren() {
    this.playSuccessChime();
  }

  // Snakes: Pawn hopping sound
  playPawnHop() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Snakes: Ladder climb ascending chords
  playLadderClimb() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      [392, 523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.14);
      });
    } catch {}
  }

  // Snakes: Snake hiss descending warning
  playSnakeHiss() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }
}

export const sounds = new SoundManager();
