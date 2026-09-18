import { create } from 'zustand';

import { getSocialServices } from '@/services';
import type { AuthUser } from '@/services/social/AuthService';

type AuthState = {
  /** checking: ilk oturum durumu henüz gelmedi. */
  status: 'idle' | 'checking' | 'ready';
  user: AuthUser | null;
  /**
   * Oturum dinleyicisini başlatır. Uygulama açılışında DEĞİL, mahalle ekranları
   * ilk açıldığında çağrılır; birden fazla çağrı güvenlidir.
   */
  start: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,

  start: () => {
    if (get().status !== 'idle') return;
    set({ status: 'checking' });
    getSocialServices().auth.onAuthStateChanged((user) => set({ status: 'ready', user }));
  },
}));
