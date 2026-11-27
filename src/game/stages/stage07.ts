import type { Stage } from '../types';

// ステージ7。下の地面を歩く敵が道をふさぐ。斜めの線で登り、橋を描いて敵の上を越える。
export const stage07: Stage = {
  name: 'ステージ 7',
  width: 1800,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1660, y: 488 },
  checkpoints: [{ x: 450, y: 460 }, { x: 1200, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 300, y: 500 } },
    { a: { x: 390, y: 500 }, b: { x: 1100, y: 500 } },
    { a: { x: 1190, y: 500 }, b: { x: 1800, y: 500 } },
  ],
  inkPickups: [{ x: 450, y: 460 }, { x: 1250, y: 460 }],
  stars: [{ x: 345, y: 462 }, { x: 620, y: 404 }, { x: 1400, y: 404 }],
  enemies: [{ x: 600, y: 486, minX: 570, maxX: 690 }, { x: 1400, y: 486, minX: 1370, maxX: 1560 }, { x: 1500, y: 486, minX: 1370, maxX: 1560 }],
};
