import type { Stage } from '../types';

// 試作用ステージ1。穴をまたぐ線、段差の壁、行き止まりの確認用。
export const stage01: Stage = {
  name: 'ステージ 1',
  width: 2000,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1880, y: 408 },
  checkpoints: [{ x: 1000, y: 280 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 600, y: 500 }, b: { x: 1000, y: 500 } },
    { a: { x: 1000, y: 500 }, b: { x: 1000, y: 300 } },
    { a: { x: 1000, y: 300 }, b: { x: 1200, y: 300 } },
    { a: { x: 1400, y: 420 }, b: { x: 2000, y: 420 } },
  ],
  inkPickups: [{ x: 700, y: 460 }],
  stars: [
    { x: 500, y: 380 },
    { x: 1100, y: 240 },
    { x: 1700, y: 360 },
  ],
  enemies: [
    { x: 250, y: 486, minX: 80, maxX: 380 },
    { x: 800, y: 486, minX: 640, maxX: 960 },
  ],
};
