export type MovementConfig = {
  id: 1 | 2 | 3;
  label: string;
  emoji: string;
  instruction: string;
  tip: string;
};

export const MOVEMENTS: MovementConfig[] = [
  {
    id: 1,
    label: "Circle",
    emoji: "🔄",
    instruction:
      "Hold phone flat in your palm. Move it in a wide horizontal circle — start very slowly, then gradually speed up.",
    tip: "Keep your wrist relaxed. Imagine drawing a dinner plate in the air.",
  },
  {
    id: 2,
    label: "Upside Down",
    emoji: "↕️",
    instruction:
      "Hold phone upright in front of you. Rotate it upside down and back — start slowly, then faster.",
    tip: "Grip firmly but don't tense your arm. Let the motion come from your wrist.",
  },
  {
    id: 3,
    label: "Sideways",
    emoji: "↔️",
    instruction:
      "Hold phone flat. Sweep it left and right in a wide arc — start slowly, then speed up.",
    tip: "Use your whole arm, not just your wrist. Keep it level throughout.",
  },
];
