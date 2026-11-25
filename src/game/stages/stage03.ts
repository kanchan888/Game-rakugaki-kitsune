import type { Stage } from '../types';

// ステージ3。ステージ2より長く、上の足場の穴を2つ渡る構成。
export const stage03: Stage = {
  name: 'ステージ 3',
  width: 1800,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1760, y: 408 },
  checkpoints: [
    { x: 950, y: 400 },
    { x: 1300, y: 400 },
  ],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 490, y: 500 }, b: { x: 900, y: 500 } },
    { a: { x: 900, y: 500 }, b: { x: 900, y: 420 } },
    { a: { x: 900, y: 420 }, b: { x: 1150, y: 420 } },
    { a: { x: 1240, y: 420 }, b: { x: 1450, y: 420 } },
    { a: { x: 1540, y: 420 }, b: { x: 1800, y: 420 } },
  ],
  inkPickups: [{ x: 700, y: 460 }],
  stars: [
    { x: 445, y: 462 },
    { x: 1000, y: 384 },
    { x: 1650, y: 384 },
  ],
  enemies: [],
};
