import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  tenantId: string;
  motoristaId: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  requirePasswordChange: boolean;
  guardarSessao: boolean;
  login: (user: User, accessToken: string, refreshToken: string, guardarSessao?: boolean, requirePasswordChange?: boolean) => void;
  logout: () => void;
  clearRequirePasswordChange: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      requirePasswordChange: false,
      guardarSessao: true,

      login: (user, accessToken, refreshToken, guardarSessao = true, requirePasswordChange = false) => {
        localStorage.setItem('accessToken', accessToken);
        if (guardarSessao) {
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          sessionStorage.setItem('refreshToken', refreshToken);
          localStorage.removeItem('refreshToken');
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, guardarSessao, requirePasswordChange });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, requirePasswordChange: false });
      },

      clearRequirePasswordChange: () => {
        set({ requirePasswordChange: false });
      },
    }),
    {
      name: 'auth-storage',
      // [7.1] Always persist auth state so reload doesn't log out motorista
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        requirePasswordChange: state.requirePasswordChange,
        guardarSessao: state.guardarSessao,
      }),
    }
  )
);
