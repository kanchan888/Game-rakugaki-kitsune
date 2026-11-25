import type { Stage } from '../types';

// ステージ4。上の足場を進み、下の通路にいる敵の上を通る構成。
export const stage04: Stage = {
  name: 'ステージ 4',
  width: 1600,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1460, y: 408 },
  checkpoints: [{ x: 760, y: 400 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 490, y: 500 }, b: { x: 700, y: 500 } },
    { a: { x: 700, y: 500 }, b: { x: 700, y: 420 } },
    { a: { x: 700, y: 420 }, b: { x: 1100, y: 420 } },
    { a: { x: 1190, y: 420 }, b: { x: 1500, y: 420 } },
    { a: { x: 700, y: 500 }, b: { x: 1100, y: 500 } },
  ],
  inkPickups: [{ x: 600, y: 460 }],
  stars: [{ x: 445, y: 462 }, { x: 900, y: 384 }, { x: 1300, y: 384 }],
  enemies: [{ x: 880, y: 486, minX: 730, maxX: 1070 }],
};
