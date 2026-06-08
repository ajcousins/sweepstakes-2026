'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const COLORS = ['#eb0a0a', '#fcff42', '#26ccff', '#88ff5a', '#ffa62d', '#a25afd'];
const DURATION_MS = 3000;

function fireSideCannons() {
  const end = Date.now() + DURATION_MS;

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: COLORS,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: COLORS,
      disableForReducedMotion: true,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

export function ConfettiSideCannons() {
  useEffect(() => {
    fireSideCannons();
  }, []);

  return null;
}
