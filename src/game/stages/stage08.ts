import type { Stage } from '../types';

// ステージ8。下の地面を歩く敵が道をふさぐ。斜めの線で登り、橋を描いて敵の上を越える。
export const stage08: Stage = {
  name: 'ステージ 8',
  width: 1800,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1660, y: 488 },
  checkpoints: [{ x: 900, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 490, y: 500 }, b: { x: 1800, y: 500 } },
  ],
  inkPickups: [{ x: 550, y: 460 }, { x: 950, y: 460 }],
  stars: [{ x: 445, y: 462 }, { x: 750, y: 404 }, { x: 1300, y: 404 }],
  enemies: [{ x: 700, y: 486, minX: 670, maxX: 840 }, { x: 1100, y: 486, minX: 1070, maxX: 1340 }, { x: 1200, y: 486, minX: 1070, maxX: 1340 }],
};
