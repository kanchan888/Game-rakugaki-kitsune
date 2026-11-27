import type { Stage } from '../types';

// ステージ4。下の地面を歩く敵が道をふさぐ。斜めの線で登り、橋を描いて敵の上を越える。
export const stage04: Stage = {
  name: 'ステージ 4',
  width: 1400,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1260, y: 488 },
  checkpoints: [{ x: 680, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } },
    { a: { x: 490, y: 500 }, b: { x: 1300, y: 500 } },
  ],
  inkPickups: [{ x: 650, y: 460 }],
  stars: [{ x: 445, y: 462 }, { x: 900, y: 404 }, { x: 1200, y: 462 }],
  enemies: [{ x: 880, y: 486, minX: 770, maxX: 1020 }],
};
