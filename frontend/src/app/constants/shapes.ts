// shapes.ts
export type Shape = {
  label: string;
  emoji: string;
  viewBox: string;
  path: string;
};

export const SHAPES: Record<string, Shape> = {
  star: {
    label: "Star",
    emoji: "⭐",
    viewBox: "0 0 100 100",
    path: "M50 5 L61 35 L95 35 L68 57 L79 91 L50 70 L21 91 L32 57 L5 35 L39 35 Z",
  },
  heart: {
    label: "Heart",
    emoji: "❤️",
    viewBox: "0 0 100 100",
    path: "M50 85 C30 70 5 55 5 33 C5 18 16 8 28 8 C37 8 45 13 50 20 C55 13 63 8 72 8 C84 8 95 18 95 33 C95 55 70 70 50 85 Z",
  },
  diamond: {
    label: "Diamond",
    emoji: "💎",
    viewBox: "0 0 100 100",
    path: "M50 5 L95 50 L50 95 L5 50 Z",
  },
  arrow: {
    label: "Arrow",
    emoji: "➡️",
    viewBox: "0 0 100 100",
    path: "M10 50 L60 50 L60 25 L90 50 L60 75 L60 50 Z",
  },
  crown: {
    label: "Crown",
    emoji: "👑",
    viewBox: "0 0 100 100",
    path: "M5 75 L5 40 L25 60 L50 15 L75 60 L95 40 L95 75 Z",
  },
  lightning: {
    label: "Lightning",
    emoji: "⚡",
    viewBox: "0 0 100 100",
    path: "M58 5 L25 55 L45 55 L38 95 L75 40 L55 40 Z",
  },
  moon: {
    label: "Moon",
    emoji: "🌙",
    viewBox: "0 0 100 100",
    path: "M60 10 C35 10 15 30 15 55 C15 80 35 95 60 95 C45 88 35 73 35 55 C35 37 45 22 60 10 Z",
  },
  house: {
    label: "House",
    emoji: "🏠",
    viewBox: "0 0 100 100",
    path: "M50 10 L90 45 L80 45 L80 90 L20 90 L20 45 L10 45 Z",
  },
  shield: {
    label: "Shield",
    emoji: "🛡️",
    viewBox: "0 0 100 100",
    path: "M50 5 L90 20 L90 55 C90 75 70 90 50 95 C30 90 10 75 10 55 L10 20 Z",
  },
  leaf: {
    label: "Leaf",
    emoji: "🍃",
    viewBox: "0 0 100 100",
    path: "M50 90 C50 90 10 70 10 35 C10 15 30 5 50 5 C70 5 90 15 90 35 C90 70 50 90 50 90 Z",
  },
};
