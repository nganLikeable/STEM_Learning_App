import { lightColors } from "../../theme";

export const useAppTheme = jest.fn(() => ({
  colors: lightColors,
  mode: "light" as const,
  setMode: jest.fn(),
}));
