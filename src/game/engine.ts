import { INK_COST_PER_SHAPE, SHAPE_LENGTH } from './shapes';
import type { EnemySpec, Segment, ShapeKind, Stage, Vec } from './types';

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

const ENEMY_RADIUS = 14;
const ENEMY_SPEED = 60; // 左右に歩く敵の速さ(px/s)
const STOMP_BOUNCE = 320; // 敵を踏んだときの跳ね返り速度(px/s)

const ALLY_RADIUS = 10;
const ALLY_OFFSET = 70; // 味方は主人公の後ろこれだけ離れてついてくる
const ALLY_RANGE = 140; // この距離以内にいると墨が回復する
const ALLY_INK_RATE = 8; // 墨の回復量(/秒)。仮

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
  enemies: EnemyState[];
  ally: Body;
  message: string;
}

export interface Body {
  pos: Vec;
  vel: Vec;
}

export interface EnemyState {
  spec: EnemySpec;
  pos: Vec;
  dir: 1 | -1;
  defeated: boolean;
}

function spawnEnemies(stage: Stage): EnemyState[] {
  return stage.enemies.map((spec) => ({
    spec,
    pos: { x: spec.x, y: spec.y },
    dir: 1,
    defeated: false,
  }));
}

function allySpawn(s: { respawn: Vec }): Vec {
  return { x: s.respawn.x - ALLY_OFFSET, y: s.respawn.y };
}

export function createState(stage: Stage): GameState {
  const base = {
    stage,
    pos: { ...stage.start },
    respawn: { ...stage.start },
  };
  return {
    ...base,
    vel: { x: 0, y: 0 },
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
    enemies: spawnEnemies(stage),
    ally: { pos: allySpawn(base), vel: { x: 0, y: 0 } },
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
  moveEnemies(s, dt);
  updateAlly(s, dt);
  afterStep(s);
}

function moveEnemies(s: GameState, dt: number): void {
  for (const e of s.enemies) {
    if (e.defeated) continue;
    e.pos.x += e.dir * ENEMY_SPEED * dt;
    if (e.pos.x <= e.spec.minX) {
      e.pos.x = e.spec.minX;
      e.dir = 1;
    } else if (e.pos.x >= e.spec.maxX) {
      e.pos.x = e.spec.maxX;
      e.dir = -1;
    }
  }
}

/** 味方は主人公の後ろについてきて、近くにいる間は墨を回復する。 */
function updateAlly(s: GameState, dt: number): void {
  const a = s.ally;
  const target = s.pos.x - ALLY_OFFSET;
  const maxStep = RUN_SPEED * 1.1 * dt;
  a.pos.x += Math.max(-maxStep, Math.min(maxStep, target - a.pos.x));

  a.vel.y += GRAVITY * dt;
  a.pos.y += a.vel.y * dt;
  for (const seg of s.stage.ground) resolve(a.pos, a.vel, seg, ALLY_RADIUS);
  for (const seg of s.lines) resolve(a.pos, a.vel, seg, ALLY_RADIUS);

  if (a.pos.y > s.stage.height + FALL_MARGIN) {
    a.pos = { x: target, y: s.pos.y - 40 };
    a.vel = { x: 0, y: 0 };
  }

  if (s.status === 'playing' && dist(a.pos, s.pos) < ALLY_RANGE) {
    s.ink = Math.min(INK_MAX, s.ink + ALLY_INK_RATE * dt);
  }
}

/** 敵との接触。上から踏めば倒せる。横からぶつかると残機が減る。 */
function checkEnemies(s: GameState): void {
  for (const e of s.enemies) {
    if (e.defeated) continue;
    const dx = Math.abs(s.pos.x - e.pos.x);
    const dy = s.pos.y - e.pos.y;
    if (dx >= PLAYER_RADIUS + ENEMY_RADIUS - 4) continue;
    if (dy <= -(PLAYER_RADIUS + ENEMY_RADIUS) || dy >= PLAYER_RADIUS + ENEMY_RADIUS) continue;

    if (s.vel.y >= 0 && dy < -4) {
      e.defeated = true;
      s.vel.y = -STOMP_BOUNCE;
    } else {
      loseLife(s, '敵にぶつかりました');
      return;
    }
  }
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

  checkEnemies(s);
  if (s.status !== 'playing') return;

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
  // 墨のアイテムも復活させる(墨が満タンに戻るため、再び拾えるようにする)
  s.pickupsGot = s.stage.inkPickups.map(() => false);
  s.contacts = [];
  // 倒した敵は元の位置に戻る
  s.enemies = spawnEnemies(s.stage);
  if (s.lives <= 0) {
    s.status = 'gameover';
    return;
  }
  s.pos = { ...s.respawn };
  s.vel = { x: 0, y: 0 };
  s.stuckTime = 0;
  s.stroke = null;
  s.ally = { pos: allySpawn(s), vel: { x: 0, y: 0 } };
}

/**
 * 円(主人公)と線分の衝突を解決する。接触方向の速度は消す。
 * 接触したら法線のy成分(上から乗ると負)を返し、接触しなければ null を返す。
 */
function resolve(p: Vec, v: Vec, seg: Segment, radius = PLAYER_RADIUS): number | null {
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
  if (d >= radius) return null;

  const nx = d < 1e-6 ? 0 : dx / d;
  const ny = d < 1e-6 ? -1 : dy / d;
  p.x = cx + nx * radius;
  p.y = cy + ny * radius;

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
