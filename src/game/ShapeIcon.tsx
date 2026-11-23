import type { ShapeKind } from './types';

interface Props {
  kind: ShapeKind;
  size?: number;
  /** 線の色(背景に合わせて変える)。 */
  color?: string;
}

/** 形の絵(簡単な線画)。枠や持ち物の一覧に出す。 */
export function ShapeIcon({ kind, size = 24, color = 'currentColor' }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: color,
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 },
    'aria-hidden': true,
  };
  switch (kind) {
    case 'foothold':
      // 足場: 平らな板と、上に乗る人
      return (
        <svg {...common}>
          <line x1="3" y1="24" x2="29" y2="24" />
          <circle cx="16" cy="16" r="3" />
          <path d="M16 19v3" />
        </svg>
      );
    case 'jump':
      // ジャンプ台: 上向きの矢印
      return (
        <svg {...common}>
          <line x1="5" y1="26" x2="27" y2="26" />
          <path d="M16 22V6M10 12l6-6 6 6" />
        </svg>
      );
    case 'boost':
      // 加速: 二重の右向き矢印
      return (
        <svg {...common}>
          <path d="M6 9l7 7-7 7M16 9l7 7-7 7" />
        </svg>
      );
    case 'slow':
      // 減速: ゆっくりのかたつむり風(丸と線)
      return (
        <svg {...common}>
          <path d="M6 24h20" />
          <circle cx="13" cy="15" r="6" />
          <path d="M19 15h6" />
        </svg>
      );
    case 'float':
      // ふわふわ: 雲
      return (
        <svg {...common}>
          <path d="M9 23h14a5 5 0 0 0 0-10 7 7 0 0 0-13 1 4 4 0 0 0-1 9z" />
        </svg>
      );
    case 'redlight':
      // 赤信号: 信号機
      return (
        <svg {...common}>
          <rect x="10" y="4" width="12" height="24" rx="3" />
          <circle cx="16" cy="10" r="2.5" fill={color} />
          <circle cx="16" cy="16" r="2.5" />
          <circle cx="16" cy="22" r="2.5" />
        </svg>
      );
    case 'moving':
      // 動く足場: 板と左右の矢印
      return (
        <svg {...common}>
          <line x1="8" y1="16" x2="24" y2="16" />
          <path d="M3 16l4-3M3 16l4 3M29 16l-4-3M29 16l-4 3" />
        </svg>
      );
    case 'robot':
      // ロボット: 顔とアンテナ
      return (
        <svg {...common}>
          <rect x="7" y="10" width="18" height="15" rx="3" />
          <path d="M16 10V5" />
          <circle cx="16" cy="4" r="1.5" fill={color} />
          <circle cx="12" cy="16" r="1.5" fill={color} />
          <circle cx="20" cy="16" r="1.5" fill={color} />
        </svg>
      );
    case 'hole':
      // あな: 地面の途切れ
      return (
        <svg {...common}>
          <path d="M2 20h9M21 20h9" />
          <path d="M11 20l5 6 5-6" />
        </svg>
      );
    case 'elevator':
      // エレベーター: 箱と上下の矢印
      return (
        <svg {...common}>
          <rect x="9" y="8" width="14" height="18" rx="2" />
          <path d="M16 3l-3 3h6zM16 29l-3-3h6z" fill={color} />
        </svg>
      );
    case 'fan':
      // 扇風機: 羽根
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="2.5" />
          <path d="M16 13.5C13 8 10 6 8 8s1 5 8 5.5M18.5 16c5.5-3 7.5-6 5.5-8s-5 1-5.5 8M16 18.5c-3 5.5-6 7.5-8 5.5s1-5 8-5.5" />
        </svg>
      );
    case 'paper':
      // 紙飛行機
      return (
        <svg {...common}>
          <path d="M3 15L29 5l-8 22-5-9z" />
          <path d="M29 5L16 18" />
        </svg>
      );
    case 'light':
      // ライト: 電球
      return (
        <svg {...common}>
          <path d="M11 20a7 7 0 1 1 10 0v2h-10z" />
          <path d="M13 26h6" />
        </svg>
      );
  }
}
