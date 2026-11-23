import type { Stage } from '../types';

// 試作用ステージ1(やさしめ版)。敵なし、穴は2つ、地面の高さは一定。
export const stage01: Stage = {
  name: 'ステージ 1',
  width: 1600,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1540, y: 488 },
  checkpoints: [{ x: 700, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 500, y: 500 } }, // 穴1の手前
    { a: { x: 590, y: 500 }, b: { x: 1100, y: 500 } }, // 穴1と穴2の間
    { a: { x: 1190, y: 500 }, b: { x: 1600, y: 500 } }, // 穴2の先
  ],
  inkPickups: [{ x: 600, y: 460 }],
  stars: [
    { x: 380, y: 462 },
    { x: 545, y: 462 },
    { x: 1145, y: 462 },
  ],
  enemies: [],
};
