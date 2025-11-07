import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User, UserRole } from '@/Interfaces';
import { STORAGE_KEYS } from '@/Constants';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken) => {
        Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: 7, // 7 days
        });
        
        set({ accessToken });
      },

      clearAuth: () => {
        Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
        Cookies.remove(STORAGE_KEYS.USER);
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setHydrated: (isHydrated) => {
        set({ isHydrated, isLoading: false });
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export default useAuthStore;
