import { useEffect, useRef, useState } from 'react';
import {
  beginStroke,
  cameraX,
  chooseElevator,
  createState,
  endStroke,
  extendStroke,
  placeShape,
  SCREEN_H,
  SCREEN_W,
  setInput,
  update,
  type GameState,
} from './engine';
import { SHAPE_INFO } from './shapes';
import { ShapeIcon } from './ShapeIcon';
import { draw } from './render';
import type { ShapeKind, Stage, Vec } from './types';

type Status = GameState['status'];

export interface ExitResult {
  coins: number;
  cleared: boolean;
}

interface Props {
  stage: Stage;
  /** ロビーで設定した枠の中身。 */
  frames: (ShapeKind | null)[];
  /** ステージを終えてロビーへ戻る。獲得したコインと、クリアしたかを渡す。 */
  onExit: (result: ExitResult) => void;
}

export function Game({ stage, frames, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createState(stage));
  const selectedRef = useRef<number | null>(null);
  const framesRef = useRef(frames);
  const [status, setStatus] = useState<Status>('playing');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let lastStatus: Status = 'playing';
    let lastMessage = '';
    let lastChoosing = false;

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      update(s, dt);
      draw(ctx, s);
      if (s.status !== lastStatus) {
        lastStatus = s.status;
        setStatus(s.status);
      }
      const isChoosing = s.choice !== null;
      if (isChoosing !== lastChoosing) {
        lastChoosing = isChoosing;
        setChoosing(isChoosing);
      }
      if (s.message !== lastMessage) {
        lastMessage = s.message;
        setMessage(s.message);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const toWorld = (e: PointerEvent): Vec => {
      const rect = canvas.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) * SCREEN_W) / rect.width;
      const sy = ((e.clientY - rect.top) * SCREEN_H) / rect.height;
      return { x: sx + cameraX(stateRef.current), y: sy };
    };

    // 枠を選んでいるときは、クリックした位置に形を置く。選んでいないときは線を描く。
    let drawing = false;
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.paused) return;
      const sel = selectedRef.current;
      const kind = sel !== null ? framesRef.current[sel] : null;
      if (kind) {
        placeShape(s, kind, toWorld(e));
        return;
      }
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      beginStroke(s, toWorld(e));
    };
    const onMove = (e: PointerEvent) => {
      if (drawing) extendStroke(stateRef.current, toWorld(e));
    };
    const onUp = () => {
      drawing = false;
      endStroke(stateRef.current);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const chooseFrame = (i: number) => {
    const next = selected === i ? null : i;
    selectedRef.current = next;
    setSelected(next);
  };

  // 一時停止: E キーか Esc キー。停止中は数字キーの枠選択も止める
  const togglePause = () => {
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    s.paused = !s.paused;
    setPaused(s.paused);
    endStroke(s);
  };

  // 数字キー 1〜(枠の数) で枠を選ぶ。矢印キー(WASD)は紙飛行機に乗っているときの移動に使う
  useEffect(() => {
    const held = new Set<string>();
    const syncInput = () => {
      const x = (held.has('ArrowRight') || held.has('d') || held.has('D') ? 1 : 0) - (held.has('ArrowLeft') || held.has('a') || held.has('A') ? 1 : 0);
      const y = (held.has('ArrowDown') || held.has('s') || held.has('S') ? 1 : 0) - (held.has('ArrowUp') || held.has('w') || held.has('W') ? 1 : 0);
      setInput(stateRef.current, x, y);
    };
    const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const onKey = (e: KeyboardEvent) => {
      // E/Esc で一時停止(ボタンにフォーカスがあっても効くようにする)
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') {
        togglePause();
        return;
      }
      if (arrows.includes(e.key) || 'wasdWASD'.includes(e.key)) {
        if (arrows.includes(e.key)) e.preventDefault();
        held.add(e.key);
        syncInput();
        return;
      }
      if (stateRef.current.paused) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > framesRef.current.length) return;
      const i = n - 1;
      const next = selectedRef.current === i ? null : i;
      selectedRef.current = next;
      setSelected(next);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      held.delete(e.key);
      syncInput();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const restart = () => {
    stateRef.current = createState(stage);
    setPaused(false);
    setStatus('playing');
    setMessage('');
  };

  const selectedKind = selected !== null ? frames[selected] : null;

  return (
    <div style={{ width: '100%', maxWidth: SCREEN_W, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        {status === 'playing' && (
          <button onClick={togglePause} style={{ padding: '6px 14px', fontSize: 14, cursor: 'pointer' }}>
            {paused ? '再開(E)' : '一時停止(E)'}
          </button>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={SCREEN_W}
          height={SCREEN_H}
          style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none', borderRadius: 8 }}
        />
        {status === 'playing' && choosing && !paused && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              pointerEvents: 'none',
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 14px', borderRadius: 8 }}>
              エレベーターに乗りました。行き先を選んでください
            </div>
            <div style={{ display: 'flex', gap: 12, pointerEvents: 'auto' }}>
              <button
                onClick={() => chooseElevator(stateRef.current, 'up')}
                style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}
              >
                ↑ 上へ
              </button>
              <button
                onClick={() => chooseElevator(stateRef.current, 'down')}
                style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}
              >
                ↓ 下へ
              </button>
            </div>
          </div>
        )}
        {status === 'playing' && paused && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              borderRadius: 8,
              gap: 12,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>一時停止中</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={togglePause} style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>
                再開
              </button>
              <button
                onClick={() => onExit({ coins: 0, cleared: false })}
                style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}
              >
                ロビーへ(この面は中断)
              </button>
            </div>
          </div>
        )}
        {status !== 'playing' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              borderRadius: 8,
              gap: 12,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {status === 'cleared' ? 'ステージクリア!' : 'ゲームオーバー'}
            </div>
            <div>{message}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {status === 'gameover' && (
                <button onClick={restart} style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>
                  もう一度
                </button>
              )}
              <button
                onClick={() =>
                  onExit({ coins: stateRef.current.coins, cleared: stateRef.current.status === 'cleared' })
                }
                style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}
              >
                ロビーへ
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0' }}>
        {frames.map((kind, i) => (
          <button
            key={i}
            onClick={() => chooseFrame(i)}
            disabled={!kind}
            style={{
              padding: '8px 12px',
              minWidth: 96,
              cursor: kind ? 'pointer' : 'default',
              border: selected === i ? '3px solid #1f6feb' : '1px solid #999',
              background: kind ? SHAPE_INFO[kind].color : '#eee',
              color: kind ? '#fff' : '#888',
              borderRadius: 6,
              fontWeight: 'bold',
            }}
          >
            {kind && <ShapeIcon kind={kind} size={20} color="#fff" />}
            {i + 1}. {kind ? SHAPE_INFO[kind].label : '空'}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: '#555', margin: '4px 0' }}>
        {selectedKind
          ? `「${SHAPE_INFO[selectedKind].label}」を選択中: ${SHAPE_INFO[selectedKind].description}。画面をクリックで置けます(もう一度枠を押すと解除)`
          : '枠を選ぶと形を置けます(数字キー1〜でも選べます)。枠を選ばないと、マウス・指で線を描けます。'}
      </p>
    </div>
  );
}
