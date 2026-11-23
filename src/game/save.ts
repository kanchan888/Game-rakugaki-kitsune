import { FRAME_MAX, FRAME_START, SHAPE_KINDS } from './shapes';
import type { ShapeKind } from './types';

export interface SaveData {
  coins: number;
  /** 持っている形の数(枠に入っていないもの)。 */
  inventory: Record<ShapeKind, number>;
  frameCount: number;
  /** 枠の中身。null は空の枠。 */
  frames: (ShapeKind | null)[];
}

const KEY = 'rakugaki-kitsune-save-v1';

export function defaultSave(): SaveData {
  return {
    coins: 0,
    inventory: { foothold: 0, jump: 0, boost: 0, slow: 0, float: 0 },
    frameCount: FRAME_START,
    frames: Array.from({ length: FRAME_START }, () => null),
  };
}

export function loadSave(): SaveData {
  const base = defaultSave();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const d = JSON.parse(raw) as Partial<SaveData>;

    const inventory = { ...base.inventory };
    for (const k of SHAPE_KINDS) {
      inventory[k] = Math.max(0, Math.floor(Number(d.inventory?.[k]) || 0));
    }
    const frameCount = Math.min(FRAME_MAX, Math.max(FRAME_START, Math.floor(Number(d.frameCount) || FRAME_START)));
    const frames = Array.from({ length: frameCount }, (_, i) => {
      const f = d.frames?.[i];
      return SHAPE_KINDS.includes(f as ShapeKind) ? (f as ShapeKind) : null;
    });
    return {
      coins: Math.max(0, Math.floor(Number(d.coins) || 0)),
      inventory,
      frameCount,
      frames,
    };
  } catch {
    return base;
  }
}

export function writeSave(d: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // 保存できなくても遊びは続けられるので無視する
  }
}
