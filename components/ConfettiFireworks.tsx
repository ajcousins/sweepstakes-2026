'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const COLORS = ['#eb0a0a', '#fcff42', '#26ccff', '#88ff5a', '#ffa62d', '#a25afd', '#c9a227'];
const CYCLE_MS = 8000;
const STAGGER_MS = 1000;
/** Left, right, left, right — each 1s apart within the cycle. */
const SIDES: Array<'left' | 'right'> = ['left', 'right', 'left', 'right'];

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function fireSingleFirework(side: 'left' | 'right') {
  confetti({
    particleCount: 50,
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    origin: {
      x:
        side === 'left'
          ? randomInRange(0.15, 0.35)
          : randomInRange(0.65, 0.85),
      y: randomInRange(0.15, 0.4),
    },
    colors: COLORS,
    disableForReducedMotion: true,
    zIndex: 50,
  });
}

function fireStaggeredCycle(isActive: () => boolean) {
  for (let i = 0; i < SIDES.length; i++) {
    const side = SIDES[i]!;
    setTimeout(() => {
      if (!isActive()) return;
      fireSingleFirework(side);
    }, i * STAGGER_MS);
  }
}

export function ConfettiFireworks() {
  useEffect(() => {
    let active = true;
    const isActive = () => active;

    fireStaggeredCycle(isActive);
    const id = setInterval(() => fireStaggeredCycle(isActive), CYCLE_MS);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return null;
}
