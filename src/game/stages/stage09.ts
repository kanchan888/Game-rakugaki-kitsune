import type { Stage } from '../types';

// ステージ9。下の地面を歩く敵が道をふさぐ。斜めの線で登り、橋を描いて敵の上を越える。
export const stage09: Stage = {
  name: 'ステージ 9',
  width: 1900,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1760, y: 488 },
  checkpoints: [{ x: 650, y: 460 }, { x: 1300, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 300, y: 500 } },
    { a: { x: 390, y: 500 }, b: { x: 1100, y: 500 } },
    { a: { x: 1190, y: 500 }, b: { x: 1900, y: 500 } },
  ],
  inkPickups: [{ x: 450, y: 460 }, { x: 800, y: 460 }, { x: 1250, y: 460 }],
  stars: [{ x: 345, y: 462 }, { x: 640, y: 404 }, { x: 1400, y: 404 }],
  enemies: [{ x: 600, y: 486, minX: 570, maxX: 720 }, { x: 700, y: 486, minX: 570, maxX: 720 }, { x: 950, y: 486, minX: 920, maxX: 1090 }, { x: 1400, y: 486, minX: 1370, maxX: 1540 }, { x: 1520, y: 486, minX: 1370, maxX: 1540 }],
};
