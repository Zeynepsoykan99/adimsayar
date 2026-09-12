import { createContext, type ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { getTheme, lightTheme, type Theme } from './themes';

export const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Tema sistem ayarını takip eder (açık/koyu). Uygulama içinde manuel tema
 * değiştirme Faz 1 kapsamında değildir; profil ekranı yalnızca bilgi gösterir.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme === 'dark' ? 'dark' : 'light'), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
