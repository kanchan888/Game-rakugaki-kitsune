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
const CLIMB_MAX = 200; // 横から触れた線のてっぺんが、この高さ以内なら上がれる(px)

// 形の数値(仮)
const MOVE_AMP = 90; // 動く足場: 左右に動く幅(中心から)
const MOVE_OMEGA = 1; // 動く足場: 揺れの速さ(rad/s)
const STOP_TIME = 3; // 赤信号: 止まる時間(秒)
const ROBOT_TIME = 8; // ロボット: 置いてから敵を倒すまでの時間(秒)
const ROBOT_RANGE = 200; // ロボット: 倒せる範囲(中心から左右)
const ELEV_TRAVEL = 180; // エレベーター: 動く距離
const ELEV_SPEED = 80; // エレベーター: 動く速さ(px/s)
const FAN_HEIGHT = 220; // 扇風機: 風が届く高さ
const FAN_LIFT = 2600; // 扇風機: 上向きの力(px/s²)
const FAN_MAX_UP = 420; // 扇風機: 吹き上げの最大速さ(px/s)
const FAN_PUSH_X = 60; // 扇風機: 右へ押す速さ(px/s)
const PAPER_SPEED = 200; // 紙飛行機: タップ/マウスの方向へ動く速さ(px/s)
const ENEMY_FALL_SPEED = 500; // 足場を失った敵が落ちる速さ(px/s)

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

/** 置いたときに状態(時間・動き)を持つ形。 */
const NEEDS_PROP = new Set<ShapeKind>(['redlight', 'moving', 'robot', 'elevator']);

/** 置いた形1つ分の動きの状態。 */
export interface Prop {
  home: Vec;
  t: number;
  timer: number;
  mode: 'idle' | 'choosing' | 'up' | 'down' | 'done';
  travel: number;
  triggered: boolean;
}

export interface GameState {
  stage: Stage;
  pos: Vec;
  vel: Vec;
  respawn: Vec;
  /** 自由に描いた線と、置いた形の両方。失敗時に全部消える。 */
  lines: Segment[];
  /** 地面。穴(あな)で削られるので、ステージの地面のコピーを持つ。 */
  ground: Segment[];
  props: Map<Segment, Prop>;
  ink: number;
  lives: number;
  starsGot: boolean[];
  pickupsGot: boolean[];
  coins: number;
  status: 'playing' | 'cleared' | 'gameover';
  /** 一時停止中。true の間は時間が止まる。 */
  paused: boolean;
  stuckTime: number;
  stroke: Vec | null;
  /** 直前のステップで主人公が触れている形の種類。 */
  contacts: ShapeKind[];
  /** 赤信号で止まっている残り時間(秒)。 */
  stopTimer: number;
  /** 紙飛行機に乗っているとき、その紙飛行機。 */
  rideSeg: Segment | null;
  /** エレベーターに触れて、上か下かを選んでいる最中のエレベーター。 */
  choice: Segment | null;
  /** 紙飛行機に乗っていて、タップ/マウスを押している間の行き先。離すと null。 */
  target: Vec | null;
  /** ゲーム開始からの経過時間(秒)。 */
  time: number;
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

function copyGround(segs: Segment[]): Segment[] {
  return segs.map((seg) => ({ a: { ...seg.a }, b: { ...seg.b } }));
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
    ground: copyGround(stage.ground),
    props: new Map(),
    ink: INK_START,
    lives: LIVES_START,
    starsGot: stage.stars.map(() => false),
    pickupsGot: stage.inkPickups.map(() => false),
    coins: 0,
    status: 'playing',
    paused: false,
    stuckTime: 0,
    stroke: null,
    contacts: [],
    stopTimer: 0,
    rideSeg: null,
    choice: null,
    target: null,
    time: 0,
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

/** 紙飛行機の行き先を設定する(null で解除)。 */
export function setTarget(s: GameState, p: Vec | null): void {
  s.target = p ? { ...p } : null;
}

/** エレベーターの行き先を選ぶ。 */
export function chooseElevator(s: GameState, dir: 'up' | 'down'): void {
  const seg = s.choice;
  if (!seg) return;
  const pr = s.props.get(seg);
  if (pr) {
    pr.mode = dir;
    pr.travel = 0;
  }
  s.choice = null;
}

/** 枠の形を、指定の位置(中心)に置く。墨が足りなければ置けない。 */
export function placeShape(s: GameState, kind: ShapeKind, at: Vec): boolean {
  if (s.status !== 'playing' || s.ink < INK_COST_PER_SHAPE || s.choice) return false;
  const half = SHAPE_LENGTH / 2;
  if (kind === 'hole') {
    // あなは線にならず、置いた場所の地面を削る
    s.ground = cutGround(s.ground, at.x - half, at.x + half, at.y);
  } else {
    const seg: Segment = {
      a: { x: at.x - half, y: at.y },
      b: { x: at.x + half, y: at.y },
      kind,
    };
    s.lines.push(seg);
    if (NEEDS_PROP.has(kind)) {
      s.props.set(seg, { home: { ...at }, t: 0, timer: ROBOT_TIME, mode: 'idle', travel: 0, triggered: false });
    }
  }
  s.ink -= INK_COST_PER_SHAPE;
  return true;
}

/** x1〜x2 の範囲の横向きの地面を削る。縦の壁や別の高さの地面は残す。 */
function cutGround(segs: Segment[], x1: number, x2: number, y: number): Segment[] {
  const out: Segment[] = [];
  for (const seg of segs) {
    const flat = Math.abs(seg.a.y - seg.b.y) < 0.5;
    const near = Math.abs(seg.a.y - y) < 60;
    const lo = Math.min(seg.a.x, seg.b.x);
    const hi = Math.max(seg.a.x, seg.b.x);
    if (!flat || !near || hi <= x1 || lo >= x2) {
      out.push(seg);
      continue;
    }
    if (lo < x1) out.push({ a: { x: lo, y: seg.a.y }, b: { x: x1, y: seg.a.y } });
    if (hi > x2) out.push({ a: { x: x2, y: seg.a.y }, b: { x: hi, y: seg.a.y } });
  }
  return out;
}

/** 1フレーム分の更新。dtは秒。 */
export function update(s: GameState, dtRaw: number): void {
  if (s.status !== 'playing' || s.paused || s.choice) return;
  const dt = Math.min(dtRaw, 1 / 30);
  s.time += dt;
  if (s.stopTimer > 0) s.stopTimer = Math.max(0, s.stopTimer - dt);
  updateProps(s, dt);
  if (s.status !== 'playing' || s.choice) return;

  const SUBSTEPS = 4;
  for (let i = 0; i < SUBSTEPS; i++) {
    step(s, dt / SUBSTEPS);
    if (s.status !== 'playing' || s.choice) return;
  }
  moveEnemies(s, dt);
  updateAlly(s, dt);
  afterStep(s);
}

/** 置いた形の動き(動く足場・エレベーター)、赤信号、ロボットを更新する。 */
function updateProps(s: GameState, dt: number): void {
  for (const seg of [...s.lines]) {
    const pr = s.props.get(seg);
    if (!pr || !seg.kind) continue;

    if (seg.kind === 'redlight') {
      if (!pr.triggered && inBeam(s, seg)) {
        pr.triggered = true;
        s.stopTimer = STOP_TIME;
        removeSeg(s, seg);
      }
    } else if (seg.kind === 'robot') {
      pr.timer -= dt;
      if (pr.timer <= 0) {
        const cx = centerX(seg);
        for (const e of s.enemies) {
          if (!e.defeated && Math.abs(e.pos.x - cx) < ROBOT_RANGE) e.defeated = true;
        }
        removeSeg(s, seg);
      }
    } else if (seg.kind === 'moving') {
      pr.t += dt;
      moveSegBy(s, seg, pr.home.x + Math.sin(pr.t * MOVE_OMEGA) * MOVE_AMP - centerX(seg), 0);
    } else if (seg.kind === 'elevator') {
      if (pr.mode === 'idle' && distToSeg(s.pos, seg) < PLAYER_RADIUS + 4) {
        pr.mode = 'choosing';
        s.choice = seg;
      } else if (pr.mode === 'up' || pr.mode === 'down') {
        const d = Math.min(ELEV_SPEED * dt, ELEV_TRAVEL - pr.travel);
        pr.travel += d;
        moveSegBy(s, seg, 0, pr.mode === 'up' ? -d : d);
        if (pr.travel >= ELEV_TRAVEL - 1e-6) pr.mode = 'done';
      }
    }
  }
}

function moveEnemies(s: GameState, dt: number): void {
  for (const e of s.enemies) {
    if (e.defeated) continue;
    // 足場がなくなった敵(あなの上)は落ちて、そのまま消える
    if (!hasGroundBelow(s, e)) {
      e.pos.y += ENEMY_FALL_SPEED * dt;
      if (e.pos.y > s.stage.height + FALL_MARGIN) e.defeated = true;
      continue;
    }
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

/** 敵の真下に、敵が立てる地面があるか。 */
function hasGroundBelow(s: GameState, e: EnemyState): boolean {
  const x = e.pos.x;
  const y = e.pos.y + ENEMY_RADIUS;
  return s.ground.some(
    (seg) =>
      Math.abs(seg.a.y - seg.b.y) < 0.5 &&
      Math.abs(seg.a.y - y) < 4 &&
      x >= Math.min(seg.a.x, seg.b.x) &&
      x <= Math.max(seg.a.x, seg.b.x),
  );
}

/** 味方は主人公の後ろについてきて、近くにいる間は墨を回復する。 */
function updateAlly(s: GameState, dt: number): void {
  const a = s.ally;
  const target = s.pos.x - ALLY_OFFSET;
  const maxStep = RUN_SPEED * 1.1 * dt;
  a.pos.x += Math.max(-maxStep, Math.min(maxStep, target - a.pos.x));

  a.vel.y += GRAVITY * dt;
  a.pos.y += a.vel.y * dt;
  for (const seg of s.ground) resolve(a.pos, a.vel, seg, ALLY_RADIUS);
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
  const prevY = p.y;
  const riding = s.rideSeg !== null;
  const stopped = s.stopTimer > 0;

  // 主人公は自動で右へ進む。紙飛行機に乗っているときは矢印キーで自由に動く。
  // 赤信号で止まっている間は動かない。直前に触れている形で速さが変わる。
  const mul = s.contacts.includes('slow') ? SLOW_MUL : s.contacts.includes('boost') ? BOOST_MUL : 1;
  if (riding) {
    // 紙飛行機: タップ/マウスを押している間は、その方向へ進む。離すと重力で落ちる
    const t = s.target;
    if (t) {
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const d = Math.hypot(dx, dy);
      v.x = d > 4 ? (dx / d) * PAPER_SPEED : 0;
      v.y = d > 4 ? (dy / d) * PAPER_SPEED : 0;
    } else {
      v.x = 0;
      v.y += GRAVITY * dt;
    }
  } else {
    v.x = stopped ? 0 : RUN_SPEED * mul;
    v.y += GRAVITY * dt;
  }
  p.x += v.x * dt;
  p.y += v.y * dt;

  // 扇風機の風に当たると吹き上げられる
  for (const seg of s.lines) {
    if (seg.kind !== 'fan') continue;
    const lo = Math.min(seg.a.x, seg.b.x);
    const hi = Math.max(seg.a.x, seg.b.x);
    if (p.x >= lo && p.x <= hi && p.y < seg.a.y - 4 && p.y > seg.a.y - FAN_HEIGHT) {
      v.y = Math.max(-FAN_MAX_UP, v.y - FAN_LIFT * dt);
      p.x += FAN_PUSH_X * dt;
    }
  }

  // 紙飛行機に乗せたまま動かすのは、主人公が自分で動いた分だけ(地面や線に押し戻された分は含めない)
  const moveX = p.x - prevX;
  const moveY = p.y - prevY;

  for (const seg of s.ground) {
    const n = resolve(p, v, seg);
    if (n) climbTop(p, v, seg, n);
  }

  const contacts: ShapeKind[] = [];
  let rideNext: Segment | null = null;
  for (const seg of s.lines) {
    // 乗っている紙飛行機とは衝突で押し合わない(位置を一緒に動かすので、ずれないようにする)
    if (seg === s.rideSeg) continue;
    const n = resolve(p, v, seg);
    if (!n) continue;
    climbTop(p, v, seg, n);
    if (!seg.kind) continue;
    contacts.push(seg.kind);
    // ジャンプ台は上から乗ったときだけ跳ね上げる
    if (seg.kind === 'jump' && n.y < -0.5) v.y = -JUMP_SPEED;
  }
  // 紙飛行機は、主人公がその真上にいる間は乗っている(接触の境界で判定が揺れないように位置で判定する)
  for (const seg of s.lines) {
    if (seg.kind === 'paper' && onTop(p, seg)) rideNext = seg;
  }
  s.contacts = contacts;
  s.rideSeg = rideNext;
  // 紙飛行機は乗っている主人公と一緒に動く
  if (rideNext) shiftSeg(rideNext, moveX, moveY);

  if (contacts.includes('float') && v.y > FLOAT_MAX_FALL) v.y = FLOAT_MAX_FALL;

  const moved = p.x - prevX;
  if (stopped || riding) {
    s.stuckTime = 0;
  } else if (moved < RUN_SPEED * dt * 0.3) {
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
  s.props = new Map();
  s.ground = copyGround(s.stage.ground);
  s.ink = INK_START;
  // 墨のアイテムも復活させる(墨が満タンに戻るため、再び拾えるようにする)
  s.pickupsGot = s.stage.inkPickups.map(() => false);
  s.contacts = [];
  s.stopTimer = 0;
  s.rideSeg = null;
  s.choice = null;
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
 * 横から線に触れたとき、その線のてっぺんへ上がる。
 * てっぺんが主人公より CLIMB_MAX 以内の高さにあるときだけ。
 */
function climbTop(p: Vec, v: Vec, seg: Segment, n: Vec): void {
  if (Math.abs(n.x) < 0.5) return; // 横からの接触だけを対象にする
  const top = seg.a.y <= seg.b.y ? seg.a : seg.b;
  if (top.y >= p.y - 4) return; // てっぺんが主人公より上にない
  if (p.y - top.y > CLIMB_MAX) return; // 高すぎる線は上がれない
  p.x = top.x + Math.sign(n.x) * PLAYER_RADIUS;
  p.y = top.y - PLAYER_RADIUS;
  v.y = 0;
}

/**
 * 円(主人公)と線分の衝突を解決する。接触方向の速度は消す。
 * 接触したら法線(線から円へ向かう単位ベクトル)を返し、接触しなければ null を返す。
 */
function resolve(p: Vec, v: Vec, seg: Segment, radius = PLAYER_RADIUS): Vec | null {
  const c = closestOnSeg(p, seg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const d = Math.hypot(dx, dy);
  if (d >= radius) return null;

  const nx = d < 1e-6 ? 0 : dx / d;
  const ny = d < 1e-6 ? -1 : dy / d;
  p.x = c.x + nx * radius;
  p.y = c.y + ny * radius;

  const vn = v.x * nx + v.y * ny;
  if (vn < 0) {
    v.x -= vn * nx;
    v.y -= vn * ny;
  }
  return { x: nx, y: ny };
}

/** 点から線分上の最も近い点。 */
function closestOnSeg(p: Vec, seg: Segment): Vec {
  const ax = seg.a.x;
  const ay = seg.a.y;
  const bx = seg.b.x - ax;
  const by = seg.b.y - ay;
  const len2 = bx * bx + by * by;
  let t = len2 === 0 ? 0 : ((p.x - ax) * bx + (p.y - ay) * by) / len2;
  t = Math.max(0, Math.min(1, t));
  return { x: ax + bx * t, y: ay + by * t };
}

function distToSeg(p: Vec, seg: Segment): number {
  const c = closestOnSeg(p, seg);
  return Math.hypot(p.x - c.x, p.y - c.y);
}

function centerX(seg: Segment): number {
  return (seg.a.x + seg.b.x) / 2;
}

/** 主人公が線の上に立っているか(線が動くと一緒に運ばれるかの判定)。 */
function onTop(p: Vec, seg: Segment): boolean {
  const lo = Math.min(seg.a.x, seg.b.x) - PLAYER_RADIUS;
  const hi = Math.max(seg.a.x, seg.b.x) + PLAYER_RADIUS;
  return p.x >= lo && p.x <= hi && Math.abs(p.y - (seg.a.y - PLAYER_RADIUS)) < 6;
}

/** 線を動かす。主人公がその上に立っていれば一緒に動かす。 */
function moveSegBy(s: GameState, seg: Segment, dx: number, dy: number): void {
  const carry = onTop(s.pos, seg);
  shiftSeg(seg, dx, dy);
  if (carry) {
    s.pos.x += dx;
    s.pos.y += dy;
  }
}

function shiftSeg(seg: Segment, dx: number, dy: number): void {
  seg.a.x += dx;
  seg.a.y += dy;
  seg.b.x += dx;
  seg.b.y += dy;
}

/** 赤信号の光の範囲(線の右側、1個分)に主人公がいるか。 */
function inBeam(s: GameState, seg: Segment): boolean {
  const hi = Math.max(seg.a.x, seg.b.x);
  const p = s.pos;
  return p.x >= hi && p.x <= hi + SHAPE_LENGTH && p.y >= seg.a.y - 40 && p.y <= seg.a.y + 4;
}

function removeSeg(s: GameState, seg: Segment): void {
  s.lines = s.lines.filter((l) => l !== seg);
  s.props.delete(seg);
}

function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
