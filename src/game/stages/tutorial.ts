import type { Stage } from '../types';

// チュートリアル(最初の面)。
// 画面上部の目標(banner)をキツネの進行に合わせて切り替え、
// 操作案内(prompt)はその場面の近くに出す。
export const tutorial: Stage = {
  name: 'チュートリアル',
  width: 1300,
  height: 700,
  start: { x: 80, y: 460 },
  goal: { x: 1250, y: 408 },
  checkpoints: [{ x: 700, y: 460 }],
  ground: [
    { a: { x: 0, y: 500 }, b: { x: 400, y: 500 } }, // 穴の手前
    { a: { x: 490, y: 500 }, b: { x: 900, y: 500 } }, // 穴の先
    { a: { x: 900, y: 500 }, b: { x: 900, y: 420 } }, // 段差(壁)
    { a: { x: 900, y: 420 }, b: { x: 1300, y: 420 } }, // 段差の上
  ],
  inkPickups: [{ x: 600, y: 460 }],
  stars: [
    { x: 445, y: 462 },
    { x: 760, y: 462 },
    { x: 1100, y: 384 },
  ],
  enemies: [],
  hints: [
    // 目標(画面上部)。x を過ぎると次の目標に切り替わる
    { kind: 'banner', x: 0, y: 0, text: 'キツネは自動で右へ進む' },
    { kind: 'banner', x: 300, y: 0, text: '穴に線を描いて橋を作ろう' },
    { kind: 'banner', x: 560, y: 0, text: '墨を取るとインクが回復する' },
    { kind: 'banner', x: 700, y: 0, text: '★を3つ集めると隠しステージ' },
    { kind: 'banner', x: 880, y: 0, text: '段差は横から当たると登れる' },
    { kind: 'banner', x: 1050, y: 0, text: 'ゴールでクリア!コインがもらえる' },
    // 近くの操作案内
    { kind: 'prompt', x: 120, y: 380, text: '一時停止', key: 'E' },
    { kind: 'prompt', x: 445, y: 320, text: 'マウスで線を描く' },
    { kind: 'prompt', x: 600, y: 400, text: '墨を取る' },
    { kind: 'prompt', x: 700, y: 320, text: '旗はやり直しの地点' },
    { kind: 'prompt', x: 900, y: 290, text: '横から当たると登れる' },
    { kind: 'prompt', x: 1250, y: 360, text: 'ゴール' },
  ],
};
