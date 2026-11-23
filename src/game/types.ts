export interface Vec {
  x: number;
  y: number;
}

/** 枠に入れて置ける形の種類(能力つき)。 */
export type ShapeKind = 'foothold' | 'jump' | 'boost' | 'slow' | 'float';

export interface Segment {
  a: Vec;
  b: Vec;
  /** 置いた形の場合のみ入る。自由に描いた線や地形には無い。 */
  kind?: ShapeKind;
}

export interface Stage {
  name: string;
  width: number;
  height: number;
  start: Vec;
  goal: Vec;
  checkpoints: Vec[];
  ground: Segment[];
  inkPickups: Vec[];
  stars: Vec[];
}
