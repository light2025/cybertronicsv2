'use client';

import type { AppId } from '@/types/xp';

type IconProps = { size?: number; color?: string };

type PixelGridProps = {
  pixels: string[];
  size?: number;
  color?: string;
};

function PixelGrid({ pixels, size = 36, color = '#0a1e48' }: PixelGridProps) {
  const h = pixels.length;
  const w = pixels[0].length;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
    >
      {pixels.flatMap((row, y) =>
        Array.from(row).map((char, x) =>
          char === '#' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}

// All icons are 12 × 12 grids. `#` = filled, `.` = transparent.

const SHIRT = [
  '.##......##.',
  '.##########.',
  '############',
  '############',
  '############',
  '.##########.',
  '..########..',
  '..########..',
  '..########..',
  '..########..',
  '..########..',
  '..########..',
];

const CART = [
  '#...........',
  '##..........',
  '.##.########',
  '.###########',
  '..#########.',
  '...########.',
  '....######..',
  '....######..',
  '....######..',
  '............',
  '..##....##..',
  '..##....##..',
];

const CAMERA = [
  '............',
  '...####.....',
  '.##########.',
  '############',
  '############',
  '####.##.####',
  '####.##.####',
  '############',
  '############',
  '.##########.',
  '............',
  '............',
];

const GEAR = [
  '....####....',
  '###########.',
  '##........##',
  '#..######..#',
  '#.########.#',
  '#.##....##.#',
  '#.##....##.#',
  '#.########.#',
  '#..######..#',
  '##........##',
  '###########.',
  '....####....',
];

const INFO = [
  '....####....',
  '..########..',
  '.##########.',
  '####....####',
  '#####..#####',
  '############',
  '....####....',
  '....####....',
  '....####....',
  '....####....',
  '####....####',
  '.##########.',
];

const ENVELOPE = [
  '............',
  '############',
  '##........##',
  '##.##..##.##',
  '##..####..##',
  '##........##',
  '##........##',
  '##........##',
  '##........##',
  '##........##',
  '############',
  '............',
];

const NOTES = [
  '.##########.',
  '##........##',
  '##.######.##',
  '##........##',
  '##.######.##',
  '##........##',
  '##.######.##',
  '##........##',
  '##.######.##',
  '##........##',
  '##.######.##',
  '.##########.',
];

const CALCULATOR = [
  '.##########.',
  '##........##',
  '##.######.##',
  '##.######.##',
  '##........##',
  '##.#.#.#..##',
  '##.#.#.#..##',
  '##........##',
  '##.#.#.#..##',
  '##.#.#.#..##',
  '##........##',
  '.##########.',
];

const SNAKE_ICON = [
  '............',
  '.#####......',
  '.....#......',
  '.....#.####.',
  '.....#.#..#.',
  '.....#.#..#.',
  '.....#.####.',
  '.....#......',
  '.....#####..',
  '............',
  '............',
  '............',
];

const PHONE = [
  '.########...',
  '##......##..',
  '##.####.##..',
  '##.####.##..',
  '##.####.##..',
  '##.####.##..',
  '##.####.##..',
  '##.####.##..',
  '##.####.##..',
  '##......##..',
  '##.####.##..',
  '.########...',
];

const MUSIC = [
  '......######',
  '......#...##',
  '......#....#',
  '......#....#',
  '......#.....',
  '......#.....',
  '......#.....',
  '......#.....',
  '###...#.....',
  '####..#.....',
  '####.#......',
  '####........',
];

const VIDEO = [
  '............',
  '.##.........',
  '.####.......',
  '.######.....',
  '.########...',
  '.##########.',
  '.##########.',
  '.########...',
  '.######.....',
  '.####.......',
  '.##.........',
  '............',
];

export const PixelShirt      = (p: IconProps) => <PixelGrid pixels={SHIRT}      {...p} />;
export const PixelCart       = (p: IconProps) => <PixelGrid pixels={CART}       {...p} />;
export const PixelCamera     = (p: IconProps) => <PixelGrid pixels={CAMERA}     {...p} />;
export const PixelGear       = (p: IconProps) => <PixelGrid pixels={GEAR}       {...p} />;
export const PixelInfo       = (p: IconProps) => <PixelGrid pixels={INFO}       {...p} />;
export const PixelEnvelope   = (p: IconProps) => <PixelGrid pixels={ENVELOPE}   {...p} />;
export const PixelNotes      = (p: IconProps) => <PixelGrid pixels={NOTES}      {...p} />;
export const PixelCalculator = (p: IconProps) => <PixelGrid pixels={CALCULATOR} {...p} />;
export const PixelSnake      = (p: IconProps) => <PixelGrid pixels={SNAKE_ICON} {...p} />;
export const PixelPhone      = (p: IconProps) => <PixelGrid pixels={PHONE}      {...p} />;
export const PixelMusic      = (p: IconProps) => <PixelGrid pixels={MUSIC}      {...p} />;
export const PixelVideo      = (p: IconProps) => <PixelGrid pixels={VIDEO}      {...p} />;

export function iconForAppId(id: AppId): (p: IconProps) => React.JSX.Element {
  switch (id) {
    case 'lifestyle':  return PixelShirt;
    case 'cart':       return PixelCart;
    case 'gallery':    return PixelCamera;
    case 'settings':   return PixelGear;
    case 'about':      return PixelInfo;
    case 'contact':    return PixelEnvelope;
    case 'notepad':    return PixelNotes;
    case 'calculator': return PixelCalculator;
    case 'snake':      return PixelSnake;
    case 'call':       return PixelPhone;
    case 'mail':       return PixelEnvelope;
    case 'music':      return PixelMusic;
    case 'video':      return PixelVideo;
    default:           return PixelInfo;
  }
}
