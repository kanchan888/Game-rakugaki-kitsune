import type { Stage } from '../types';

// ステージ8。上の足場を進み、下の通路にいる敵の上を通る構成。
export const stage08: Stage = {
  name: 'ステージ 8',
  width: 1700,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1660, y: 488 },
  checkpoints: [{ x: 900, y: 400 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 490, y: 500 }, b: { x: 800, y: 500 } },
    { a: { x: 800, y: 500 }, b: { x: 800, y: 420 } },
    { a: { x: 800, y: 420 }, b: { x: 1100, y: 420 } },
    { a: { x: 1190, y: 420 }, b: { x: 1400, y: 420 } },
    { a: { x: 1400, y: 500 }, b: { x: 1700, y: 500 } },
    { a: { x: 800, y: 500 }, b: { x: 1100, y: 500 } },
  ],
  inkPickups: [{ x: 620, y: 460 }],
  stars: [{ x: 445, y: 462 }, { x: 950, y: 384 }, { x: 1550, y: 462 }],
  enemies: [{ x: 900, y: 486, minX: 810, maxX: 1090 }, { x: 1020, y: 486, minX: 810, maxX: 1090 }],
};
