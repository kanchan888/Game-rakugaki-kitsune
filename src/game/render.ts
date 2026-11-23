import { PLAYER_RADIUS, SCREEN_H, SCREEN_W, INK_START, cameraX, type GameState } from './engine';
import { SHAPE_INFO } from './shapes';
import type { Segment, Vec } from './types';

export function draw(ctx: CanvasRenderingContext2D, s: GameState): void {
  const cam = cameraX(s);

  ctx.fillStyle = '#e8f6ff';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  ctx.save();
  ctx.translate(-cam, 0);

  drawSegments(ctx, s.stage.ground, '#7a5a3a', 10);
  drawSegments(ctx, s.lines.filter((l) => !l.kind), '#1f6feb', 12);
  drawShapes(ctx, s.lines.filter((l) => l.kind));
  drawCheckpoints(ctx, s.stage.checkpoints);
  drawGoal(ctx, s.stage.goal);

  s.stage.inkPickups.forEach((p, i) => {
    if (!s.pickupsGot[i]) drawInkPickup(ctx, p);
  });
  s.stage.stars.forEach((p, i) => {
    if (!s.starsGot[i]) drawStar(ctx, p, 16, '#f5b700');
  });

  for (const e of s.enemies) {
    if (!e.defeated) drawEnemy(ctx, e.pos);
  }
  drawAlly(ctx, s.ally.pos);
  drawPlayer(ctx, s.pos);

  ctx.restore();

  drawHud(ctx, s);
}

function drawSegments(ctx: CanvasRenderingContext2D, segs: Segment[], color: string, width: number): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  for (const seg of segs) {
    ctx.beginPath();
    ctx.moveTo(seg.a.x, seg.a.y);
    ctx.lineTo(seg.b.x, seg.b.y);
    ctx.stroke();
  }
}

function drawShapes(ctx: CanvasRenderingContext2D, segs: Segment[]): void {
  ctx.lineCap = 'round';
  for (const seg of segs) {
    if (!seg.kind) continue;
    const info = SHAPE_INFO[seg.kind];
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(seg.a.x, seg.a.y);
    ctx.lineTo(seg.b.x, seg.b.y);
    ctx.stroke();
    ctx.fillStyle = info.color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(info.label, (seg.a.x + seg.b.x) / 2, Math.min(seg.a.y, seg.b.y) - 6);
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, p: Vec): void {
  ctx.fillStyle = '#c62828';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(p.x - 5, p.y - 3, 3, 0, Math.PI * 2);
  ctx.arc(p.x + 5, p.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawAlly(ctx: CanvasRenderingContext2D, p: Vec): void {
  ctx.fillStyle = '#26a69a';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('味', p.x, p.y + 1);
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Vec): void {
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(p.x + 4, p.y - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoal(ctx: CanvasRenderingContext2D, g: Vec): void {
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(g.x, g.y + 30);
  ctx.lineTo(g.x, g.y - 40);
  ctx.stroke();
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(g.x, g.y - 40);
  ctx.lineTo(g.x + 30, g.y - 30);
  ctx.lineTo(g.x, g.y - 20);
  ctx.closePath();
  ctx.fill();
}

function drawCheckpoints(ctx: CanvasRenderingContext2D, cps: Vec[]): void {
  for (const c of cps) {
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(c.x - 1.5, c.y - 36, 3, 36);
    ctx.beginPath();
    ctx.moveTo(c.x + 1.5, c.y - 36);
    ctx.lineTo(c.x + 18, c.y - 30);
    ctx.lineTo(c.x + 1.5, c.y - 24);
    ctx.closePath();
    ctx.fill();
  }
}

function drawInkPickup(ctx: CanvasRenderingContext2D, p: Vec): void {
  ctx.fillStyle = '#43a047';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('墨', p.x, p.y + 1);
}

function drawStar(ctx: CanvasRenderingContext2D, c: Vec, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = c.x + Math.cos(a) * rad;
    const y = c.y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHud(ctx: CanvasRenderingContext2D, s: GameState): void {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  // インクバー
  const barX = 16;
  const barY = 16;
  const barW = 180;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(barX, barY, barW, 18);
  ctx.fillStyle = '#1f6feb';
  ctx.fillRect(barX, barY, barW * Math.max(0, s.ink) / INK_START, 18);
  ctx.fillStyle = '#222';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`インク ${Math.floor(s.ink)}`, barX + barW + 10, barY + 9);

  ctx.fillText(`残機 ×${s.lives}`, barX, barY + 40);
  ctx.fillText(`★ ${s.starsGot.filter(Boolean).length} / ${s.stage.stars.length}`, barX, barY + 64);
  ctx.fillText(`コイン ${s.coins}`, barX, barY + 88);

  ctx.textAlign = 'center';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(s.stage.name, SCREEN_W / 2, 20);
}
