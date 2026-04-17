import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SuperAdminState {
  isAuthenticated: boolean;
  email: string | null;
  accessToken: string | null;
  login: (email: string, accessToken: string) => void;
  logout: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      accessToken: null,

      login: (email, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ isAuthenticated: true, email, accessToken });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        set({ isAuthenticated: false, email: null, accessToken: null });
      },
    }),
    {
      name: 'super-admin-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        email: state.email,
      }),
    }
  )
);
