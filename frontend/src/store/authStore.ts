import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import type { LoginIn, MeOut } from '../types/auth'; 

interface AuthState {
  user: MeOut | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (user: any, token: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Explicitly typed the parameters to keep TypeScript happy
      setTokens: (accessToken: string, refreshToken: string) => 
        set({ accessToken, refreshToken, isAuthenticated: true }),

      login: async (credentials: LoginIn) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Send JSON payload to /auth/login
          const { data } = await api.post('/auth/login', credentials);
          
          // 2. Save tokens
          get().setTokens(data.access_token, data.refresh_token);
          
          // 3. Immediately hydrate the user data profile
          await get().fetchMe();
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            // OpenAPI FastAPI default validation error format fallback
            error: error.response?.data?.detail || 'Login failed. Please check your credentials.', 
            isLoading: false 
          });
          throw error;
        }
      },

      fetchMe: async () => {
        try {
          // The request interceptor in api.ts automatically attaches the Bearer token!
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      },

      logout: async () => {
        const currentRefresh = get().refreshToken;
        if (currentRefresh) {
            try {
                // Notifies backend to invalidate the refresh token
                await api.post('/auth/logout', { refresh_token: currentRefresh });
            } catch (e) { 
                console.warn("Backend logout failed, proceeding with local logout");
            }
        }

        // Clear local state completely
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
          error: null 
        });
      },
    }),
    {
      name: 'glucolens-auth-storage',
      // Only persist tokens and user profile to local storage; ignore loading states
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
);