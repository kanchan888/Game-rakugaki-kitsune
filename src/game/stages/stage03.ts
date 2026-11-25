import type { Stage } from '../types';

// ステージ3。上の足場を進み、下の通路にいる敵の上を通る構成。
export const stage03: Stage = {
  name: 'ステージ 3',
  width: 1600,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1560, y: 408 },
  checkpoints: [{ x: 950, y: 400 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 490, y: 500 }, b: { x: 900, y: 500 } },
    { a: { x: 900, y: 500 }, b: { x: 900, y: 420 } },
    { a: { x: 900, y: 420 }, b: { x: 1200, y: 420 } },
    { a: { x: 1290, y: 420 }, b: { x: 1600, y: 420 } },
  ],
  inkPickups: [{ x: 700, y: 460 }],
  stars: [{ x: 445, y: 462 }, { x: 1000, y: 384 }, { x: 1400, y: 384 }],
  enemies: [],
};
