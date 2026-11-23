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

/** 左右に歩く敵の配置。minX〜maxX の間を往復する。 */
export interface EnemySpec {
  x: number;
  y: number;
  minX: number;
  maxX: number;
}

/**
 * ステージ上に出す説明(チュートリアル用)。
 * - banner: 画面上部に大きく出す目標。キツネの x が hint.x を過ぎると切り替わる(x 昇順で並べる)。
 * - prompt: キツネが近づくと、その場に出す操作案内。key があればキーのアイコンを付ける。
 * - note: 常に表示する吹き出し。text の改行は \n で書く。
 */
export interface Hint {
  kind: 'banner' | 'prompt' | 'note';
  x: number;
  y: number;
  text: string;
  key?: string;
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
  enemies: EnemySpec[];
  hints?: Hint[];
}
