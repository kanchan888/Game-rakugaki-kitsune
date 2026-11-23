import { useEffect, useRef, useState } from 'react';
import {
  beginStroke,
  cameraX,
  createState,
  endStroke,
  extendStroke,
  SCREEN_H,
  SCREEN_W,
  update,
  type GameState,
} from './engine';
import { draw } from './render';
import { stage01 } from './stages/stage01';
import type { Vec } from './types';

type Status = GameState['status'];

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createState(stage01));
  const [status, setStatus] = useState<Status>('playing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let lastStatus: Status = 'playing';
    let lastMessage = '';

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

    let drawing = false;
    const onDown = (e: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      beginStroke(stateRef.current, toWorld(e));
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

  const restart = () => {
    stateRef.current = createState(stage01);
    setStatus('playing');
    setMessage('');
  };

  return (
    <div style={{ width: '100%', maxWidth: SCREEN_W, margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={SCREEN_W}
          height={SCREEN_H}
          style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none', borderRadius: 8 }}
        />
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
            <button onClick={restart} style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>
              もう一度
            </button>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#555' }}>
        マウス・指で線を描いてください。線は墨(インク)を使います。
      </p>
    </div>
  );
}
