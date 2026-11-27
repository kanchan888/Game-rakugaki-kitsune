import type { Stage } from '../types';

// ステージ5。下の地面を歩く敵が道をふさぐ。斜めの線で登り、橋を描いて敵の上を越える。
export const stage05: Stage = {
  name: 'ステージ 5',
  width: 1700,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1560, y: 488 },
  checkpoints: [{ x: 580, y: 460 }, { x: 1000, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 300, y: 500 } },
    { a: { x: 390, y: 500 }, b: { x: 1600, y: 500 } },
  ],
  inkPickups: [{ x: 550, y: 460 }, { x: 950, y: 460 }],
  stars: [{ x: 345, y: 462 }, { x: 780, y: 404 }, { x: 1180, y: 404 }],
  enemies: [{ x: 740, y: 486, minX: 670, maxX: 840 }, { x: 1100, y: 486, minX: 1070, maxX: 1240 }],
};
