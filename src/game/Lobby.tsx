import { useState } from 'react';
import type { SaveData } from './save';
import {
  FRAME_EXPAND_COST,
  FRAME_MAX,
  FRAME_START,
  GACHA_COST,
  SHAPE_INFO,
  SHAPE_KINDS,
} from './shapes';
import { STAGES } from './stages';
import type { ShapeKind } from './types';

interface Props {
  save: SaveData;
  onChange: (updater: (prev: SaveData) => SaveData) => void;
  onStart: (stageIndex: number) => void;
}

const btn = (enabled: boolean) => ({
  padding: '8px 16px',
  fontSize: 15,
  cursor: enabled ? ('pointer' as const) : ('not-allowed' as const),
  opacity: enabled ? 1 : 0.5,
});

export function Lobby({ save, onChange, onStart }: Props) {
  const [lastGacha, setLastGacha] = useState<ShapeKind | null>(null);

  const expandCost = save.frameCount < FRAME_MAX ? FRAME_EXPAND_COST[save.frameCount - FRAME_START] : null;

  const runGacha = () => {
    const kind = SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)];
    setLastGacha(kind);
    onChange((prev) => ({
      ...prev,
      coins: prev.coins - GACHA_COST,
      inventory: { ...prev.inventory, [kind]: prev.inventory[kind] + 1 },
    }));
  };

  const setFrame = (i: number, next: ShapeKind | null) => {
    onChange((prev) => {
      const frames = [...prev.frames];
      const inventory = { ...prev.inventory };
      const old = frames[i];
      if (old) inventory[old] += 1;
      if (next) inventory[next] -= 1;
      frames[i] = next;
      return { ...prev, frames, inventory };
    });
  };

  const expandFrame = () => {
    if (expandCost === null) return;
    onChange((prev) => ({
      ...prev,
      coins: prev.coins - expandCost,
      frameCount: prev.frameCount + 1,
      frames: [...prev.frames, null],
    }));
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section>
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>コイン: {save.coins}</h2>
        <button onClick={runGacha} disabled={save.coins < GACHA_COST} style={btn(save.coins >= GACHA_COST)}>
          ガチャを回す({GACHA_COST}コイン)
        </button>
        {lastGacha && (
          <span style={{ marginLeft: 12 }}>
            結果: <b style={{ color: SHAPE_INFO[lastGacha].color }}>{SHAPE_INFO[lastGacha].label}</b>
          </span>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>持っている形</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {SHAPE_KINDS.map((k, idx) => (
            <li key={k}>
              {idx + 1}. <b style={{ color: SHAPE_INFO[k].color }}>{SHAPE_INFO[k].label}</b> × {save.inventory[k]}
              (能力: {SHAPE_INFO[k].description})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>
          枠({save.frameCount}/{FRAME_MAX})
        </h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {save.frames.map((current, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 56 }}>枠 {i + 1}</span>
              <select
                value={current ?? ''}
                onChange={(e) => setFrame(i, (e.target.value || null) as ShapeKind | null)}
                style={{ padding: 6, fontSize: 15 }}
              >
                <option value="">空</option>
                {SHAPE_KINDS.map((k) => {
                  const available = save.inventory[k] + (current === k ? 1 : 0);
                  return (
                    <option key={k} value={k} disabled={available <= 0}>
                      {SHAPE_INFO[k].label}(持ち{available})
                    </option>
                  );
                })}
              </select>
              {current && (
                <button onClick={() => setFrame(i, null)} style={{ padding: '6px 10px' }}>
                  外す
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <button
            onClick={expandFrame}
            disabled={expandCost === null || save.coins < expandCost}
            style={btn(expandCost !== null && save.coins >= expandCost)}
          >
            {expandCost === null ? '枠は最大です' : `枠を増やす(${expandCost}コイン)`}
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>ステージ</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {STAGES.map((stage, i) => {
            const unlocked = i <= save.clearedStage;
            return (
              <button
                key={stage.name}
                onClick={() => onStart(i)}
                disabled={!unlocked}
                style={{ ...btn(unlocked), fontSize: 18, fontWeight: 'bold', padding: '12px 28px' }}
              >
                {unlocked ? `${stage.name}へ` : `${stage.name}(未解放)`}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
