import { INK_COST_PER_SHAPE, SHAPE_LENGTH } from './shapes';
import type { Segment, ShapeKind, Stage, Vec } from './types';

export const SCREEN_W = 960;
export const SCREEN_H = 540;

export const PLAYER_RADIUS = 12;
export const GRAVITY = 1400;
export const RUN_SPEED = 170;

export const INK_START = 200;
export const INK_MAX = 200; // 仮: 回復の上限(要確認)
export const INK_COST_PER_PX = 0.3; // 自由描画1pxあたりの墨の減り(試作で調整)
export const INK_PICKUP = 100;
export const LIVES_START = 3;
export const COIN_CLEAR_REWARD = 100; // 仮: 数値は試作で調整

const JUMP_SPEED = 620; // ジャンプ台の跳ね上がり速度(px/s)
const BOOST_MUL = 1.8; // 加速の倍率
const SLOW_MUL = 0.5; // 減速の倍率
const FLOAT_MAX_FALL = 60; // ふわふわで落下速度がこれを超えないようにする(px/s)

const MIN_STROKE_STEP = 4; // これ未満の移動では線を伸ばさない
const PICKUP_RADIUS = 18;
const STAR_RADIUS = 16;
const GOAL_RADIUS = 30;
const STUCK_LIMIT = 2; // 秒: 行き止まりとみなすまでの時間
const FALL_MARGIN = 200; // ステージ下端からこれだけ落ちたら落下扱い

export interface GameState {
  stage: Stage;
  pos: Vec;
  vel: Vec;
  respawn: Vec;
  /** 自由に描いた線と、置いた形の両方。失敗時に全部消える。 */
  lines: Segment[];
  ink: number;
  lives: number;
  starsGot: boolean[];
  pickupsGot: boolean[];
  coins: number;
  status: 'playing' | 'cleared' | 'gameover';
  stuckTime: number;
  stroke: Vec | null;
  /** 直前のステップで主人公が触れている形の種類。 */
  contacts: ShapeKind[];
  message: string;
}

export function createState(stage: Stage): GameState {
  return {
    stage,
    pos: { ...stage.start },
    vel: { x: 0, y: 0 },
    respawn: { ...stage.start },
    lines: [],
    ink: INK_START,
    lives: LIVES_START,
    starsGot: stage.stars.map(() => false),
    pickupsGot: stage.inkPickups.map(() => false),
    coins: 0,
    status: 'playing',
    stuckTime: 0,
    stroke: null,
    contacts: [],
    message: '',
  };
}

/** 画面の横スクロール量(ワールド座標)。 */
export function cameraX(s: GameState): number {
  const max = s.stage.width - SCREEN_W;
  return Math.max(0, Math.min(max, s.pos.x - SCREEN_W * 0.35));
}

export function beginStroke(s: GameState, p: Vec): void {
  if (s.status !== 'playing' || s.ink <= 0) return;
  s.stroke = { ...p };
}

export function extendStroke(s: GameState, p: Vec): void {
  if (!s.stroke || s.status !== 'playing') return;
  const dx = p.x - s.stroke.x;
  const dy = p.y - s.stroke.y;
  const dist = Math.hypot(dx, dy);
  if (dist < MIN_STROKE_STEP) return;

  const len = Math.min(dist, s.ink / INK_COST_PER_PX);
  const end = {
    x: s.stroke.x + (dx / dist) * len,
    y: s.stroke.y + (dy / dist) * len,
  };
  s.lines.push({ a: { ...s.stroke }, b: end });
  s.ink -= len * INK_COST_PER_PX;
  s.stroke = s.ink > 0 ? end : null;
}

export function endStroke(s: GameState): void {
  s.stroke = null;
}

/** 枠の形を、指定の位置(中心)に置く。墨が足りなければ置けない。 */
export function placeShape(s: GameState, kind: ShapeKind, at: Vec): boolean {
  if (s.status !== 'playing' || s.ink < INK_COST_PER_SHAPE) return false;
  const half = SHAPE_LENGTH / 2;
  s.lines.push({
    a: { x: at.x - half, y: at.y },
    b: { x: at.x + half, y: at.y },
    kind,
  });
  s.ink -= INK_COST_PER_SHAPE;
  return true;
}

/** 1フレーム分の更新。dtは秒。 */
export function update(s: GameState, dtRaw: number): void {
  if (s.status !== 'playing') return;
  const dt = Math.min(dtRaw, 1 / 30);
  const SUBSTEPS = 4;
  for (let i = 0; i < SUBSTEPS; i++) {
    step(s, dt / SUBSTEPS);
    if (s.status !== 'playing') return;
  }
  afterStep(s);
}

function step(s: GameState, dt: number): void {
  const p = s.pos;
  const v = s.vel;
  const prevX = p.x;

  // 主人公は自動で右へ進む。操作は形を置くことと線を描くこと。
  // 直前に触れている形で速さが変わる。
  const mul = s.contacts.includes('slow') ? SLOW_MUL : s.contacts.includes('boost') ? BOOST_MUL : 1;
  v.x = RUN_SPEED * mul;
  v.y += GRAVITY * dt;
  p.x += v.x * dt;
  p.y += v.y * dt;

  for (const seg of s.stage.ground) resolve(p, v, seg);

  const contacts: ShapeKind[] = [];
  for (const seg of s.lines) {
    const ny = resolve(p, v, seg);
    if (ny === null || !seg.kind) continue;
    contacts.push(seg.kind);
    // ジャンプ台は上から乗ったときだけ跳ね上げる
    if (seg.kind === 'jump' && ny < -0.5) v.y = -JUMP_SPEED;
  }
  s.contacts = contacts;
  if (contacts.includes('float') && v.y > FLOAT_MAX_FALL) v.y = FLOAT_MAX_FALL;

  const moved = p.x - prevX;
  if (moved < RUN_SPEED * dt * 0.3) {
    s.stuckTime += dt;
    if (s.stuckTime > STUCK_LIMIT) loseLife(s, '行き止まりになりました');
  } else {
    s.stuckTime = 0;
  }
}

function afterStep(s: GameState): void {
  const { stage, pos } = s;

  if (pos.y > stage.height + FALL_MARGIN) {
    loseLife(s, '穴に落ちました');
    return;
  }

  for (const cp of stage.checkpoints) {
    if (pos.x >= cp.x && cp.x > s.respawn.x) s.respawn = { ...cp };
  }

  stage.inkPickups.forEach((item, i) => {
    if (!s.pickupsGot[i] && dist(pos, item) < PICKUP_RADIUS + PLAYER_RADIUS) {
      s.pickupsGot[i] = true;
      s.ink = Math.min(INK_MAX, s.ink + INK_PICKUP);
    }
  });

  stage.stars.forEach((star, i) => {
    if (!s.starsGot[i] && dist(pos, star) < STAR_RADIUS + PLAYER_RADIUS) {
      s.starsGot[i] = true;
    }
  });

  if (dist(pos, stage.goal) < GOAL_RADIUS) {
    s.status = 'cleared';
    s.coins += COIN_CLEAR_REWARD;
    s.message = 'ゴール!';
  }
}

function loseLife(s: GameState, reason: string): void {
  s.lives -= 1;
  s.message = reason;
  // 仕様: 失敗したら描いた線と置いた形を全部消し、墨を満タン(200)に戻す
  s.lines = [];
  s.ink = INK_START;
  s.contacts = [];
  if (s.lives <= 0) {
    s.status = 'gameover';
    return;
  }
  s.pos = { ...s.respawn };
  s.vel = { x: 0, y: 0 };
  s.stuckTime = 0;
  s.stroke = null;
}

/**
 * 円(主人公)と線分の衝突を解決する。接触方向の速度は消す。
 * 接触したら法線のy成分(上から乗ると負)を返し、接触しなければ null を返す。
 */
function resolve(p: Vec, v: Vec, seg: Segment): number | null {
  const ax = seg.a.x;
  const ay = seg.a.y;
  const bx = seg.b.x - ax;
  const by = seg.b.y - ay;
  const len2 = bx * bx + by * by;
  let t = len2 === 0 ? 0 : ((p.x - ax) * bx + (p.y - ay) * by) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + bx * t;
  const cy = ay + by * t;

  const dx = p.x - cx;
  const dy = p.y - cy;
  const d = Math.hypot(dx, dy);
  if (d >= PLAYER_RADIUS) return null;

  const nx = d < 1e-6 ? 0 : dx / d;
  const ny = d < 1e-6 ? -1 : dy / d;
  p.x = cx + nx * PLAYER_RADIUS;
  p.y = cy + ny * PLAYER_RADIUS;

  const vn = v.x * nx + v.y * ny;
  if (vn < 0) {
    v.x -= vn * nx;
    v.y -= vn * ny;
  }
  return ny;
}

function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
