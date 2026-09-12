import { useContext } from 'react';

import { ThemeContext } from './ThemeProvider';
import type { Theme } from './themes';

/** Bileşenlerin renk/boşluk/tipografiye tek erişim noktası. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
