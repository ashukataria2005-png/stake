# Stake.com Clone

A responsive, pixel-perfect Stake.com UI clone and casino game suite built with Next.js 16 (Turbopack), Tailwind CSS, and Web Audio API.

## Features

- **Stake UI / Theme**: Exact dark palette (`#0f212e`, `#1a2c38`, `#213743`, Stake green `#00e701`).
- **Interactive Stake Originals**:
  - **Mines**: 5x5 grid with authentic Stake combination payout formula, 3D tiles, gem/mine reveal animations, and sound effects.
  - **Crash**: 60 FPS HTML5 Canvas exponential multiplier curve ($M(t) = e^{0.065 \cdot t}$), particle jet trail, and auto-cashout.
  - **Plinko**: Real-time 2D Canvas physics peg board, multi-ball drops, bounce deflections, and Stake risk tables.
  - **Dice**: Dynamic slider with roll over/under targets and win probability calculation.
- **State Management**: Live demo balance, wallet top-up modal, and active currency selection (`GameContext`).
- **Audio Synthesizer**: Web Audio API sound synthesis with zero external dependencies.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the casino lobby.
