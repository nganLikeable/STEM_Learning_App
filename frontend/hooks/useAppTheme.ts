import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../src/theme';
import { useThemeStore } from '../src/store/theme-store';

export function useAppTheme() {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    mode,
  };
}
