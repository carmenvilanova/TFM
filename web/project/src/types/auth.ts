export interface User {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthMode = 'login' | 'register' | 'guest';