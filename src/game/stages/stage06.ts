import type { Stage } from '../types';

// ステージ6。上の足場を進み、下の通路にいる敵の上を通る構成。
export const stage06: Stage = {
  name: 'ステージ 6',
  width: 1800,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1660, y: 408 },
  checkpoints: [{ x: 900, y: 400 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 350, y: 500 } },
    { a: { x: 440, y: 500 }, b: { x: 640, y: 500 } },
    { a: { x: 640, y: 500 }, b: { x: 640, y: 420 } },
    { a: { x: 640, y: 420 }, b: { x: 1000, y: 420 } },
    { a: { x: 1090, y: 420 }, b: { x: 1400, y: 420 } },
    { a: { x: 1400, y: 420 }, b: { x: 1700, y: 420 } },
    { a: { x: 640, y: 500 }, b: { x: 1000, y: 500 } },
  ],
  inkPickups: [{ x: 500, y: 460 }],
  stars: [{ x: 395, y: 462 }, { x: 800, y: 384 }, { x: 1500, y: 384 }],
  enemies: [{ x: 720, y: 486, minX: 650, maxX: 990 }, { x: 900, y: 486, minX: 650, maxX: 990 }],
};
