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
};

export const SHAPE_KINDS: ShapeKind[] = ['foothold', 'jump', 'boost', 'slow', 'float'];

// 仮の数値(試作で調整)
export const SHAPE_LENGTH = 90; // 置いた形の長さ(px)
export const INK_COST_PER_SHAPE = 30; // 形を1回置くときの墨の消費
export const GACHA_COST = 100; // ガチャ1回のコイン
export const FRAME_START = 3; // 初期の枠数
export const FRAME_MAX = 7; // 枠の上限
/** 枠を増やす費用。インデックスは増やす前の枠数-FRAME_START。 */
export const FRAME_EXPAND_COST = [200, 300, 400, 500];
