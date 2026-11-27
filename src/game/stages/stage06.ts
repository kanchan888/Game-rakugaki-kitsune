import type { Stage } from '../types';

// ステージ6。下の地面を歩く敵が道をふさぐ。斜めの線で登り、橋を描いて敵の上を越える。
export const stage06: Stage = {
  name: 'ステージ 6',
  width: 1700,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1560, y: 488 },
  checkpoints: [{ x: 700, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 350, y: 500 } },
    { a: { x: 440, y: 500 }, b: { x: 1200, y: 500 } },
    { a: { x: 1290, y: 500 }, b: { x: 1600, y: 500 } },
  ],
  inkPickups: [{ x: 750, y: 460 }],
  stars: [{ x: 395, y: 462 }, { x: 990, y: 404 }, { x: 1450, y: 462 }],
  enemies: [{ x: 930, y: 486, minX: 870, maxX: 1080 }, { x: 1050, y: 486, minX: 870, maxX: 1080 }],
};
