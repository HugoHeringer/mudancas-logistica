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
  guardarSessao: boolean;
  login: (user: User, accessToken: string, refreshToken: string, guardarSessao?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      guardarSessao: true,

      login: (user, accessToken, refreshToken, guardarSessao = true) => {
        localStorage.setItem('accessToken', accessToken);
        if (guardarSessao) {
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          sessionStorage.setItem('refreshToken', refreshToken);
          localStorage.removeItem('refreshToken');
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, guardarSessao });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.guardarSessao ? state.user : null,
        accessToken: state.guardarSessao ? state.accessToken : null,
        refreshToken: state.guardarSessao ? state.refreshToken : null,
        isAuthenticated: state.guardarSessao ? state.isAuthenticated : false,
        guardarSessao: state.guardarSessao,
      }),
    }
  )
);
