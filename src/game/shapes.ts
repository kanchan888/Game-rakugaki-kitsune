import type { ShapeKind } from './types';

export interface ShapeInfo {
  label: string;
  color: string;
  description: string;
}

export const SHAPE_INFO: Record<ShapeKind, ShapeInfo> = {
  foothold: { label: '足場', color: '#8d6e63', description: '上に乗れる' },
  jump: { label: 'ジャンプ台', color: '#ec407a', description: '乗ると跳ね上がる' },
  boost: { label: '加速', color: '#43a047', description: '乗ると速く進む' },
  slow: { label: '減速', color: '#fb8c00', description: '乗るとゆっくり進む' },
  float: { label: 'ふわふわ', color: '#8e24aa', description: '触れると落下がゆっくりになる' },
  redlight: { label: '赤信号', color: '#d32f2f', description: '前方の光に当たると3秒止まり、赤信号は消える' },
  moving: { label: '動く足場', color: '#00838f', description: '左右に動く足場。乗ると一緒に動く' },
  robot: { label: 'ロボット', color: '#607d8b', description: '置いて8秒後に近くの敵を倒して消える' },
  hole: { label: 'あな', color: '#3e2723', description: '置いた場所の地面に穴を開ける' },
  elevator: { label: 'エレベーター', color: '#5c6bc0', description: '触れると上か下かを選んで動く' },
  fan: { label: '扇風機', color: '#26c6da', description: '上へ風を出し、当たると吹き上げられる' },
  paper: { label: '紙飛行機', color: '#78909c', description: '乗ると矢印キーで自由に動かせる' },
  light: { label: 'ライト', color: '#fdd835', description: '周りを照らす' },
};

export const SHAPE_KINDS: ShapeKind[] = [
  'foothold',
  'jump',
  'boost',
  'slow',
  'float',
  'redlight',
  'moving',
  'robot',
  'hole',
  'elevator',
  'fan',
  'paper',
  'light',
];

// 仮の数値(試作で調整)
export const SHAPE_LENGTH = 90; // 置いた形の長さ(px)
export const INK_COST_PER_SHAPE = 30; // 形を1回置くときの墨の消費
export const GACHA_COST = 100; // ガチャ1回のコイン
export const FRAME_START = 3; // 初期の枠数
export const FRAME_MAX = 7; // 枠の上限
/** 枠を増やす費用。インデックスは増やす前の枠数-FRAME_START。 */
export const FRAME_EXPAND_COST = [200, 300, 400, 500];
