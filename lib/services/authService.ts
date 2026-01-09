
import api from '../api';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(
    username: string,
    email: string,
    password: string,
    role: string = 'customer'
  ): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      role,
    });
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  getRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  },

  saveAuth(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user));
  },

  async validateToken(): Promise<User | null> {
    try {
      // Try to fetch profile to validate token
      // Assuming /auth/profile or /users/profile exists. 
      // If your backend uses a different endpoint for "me", change this.
      const response = await api.get('/auth/profile'); 
      return response.data;
    } catch (error) {
      if ((error as any).response?.status === 401) {
        this.logout();
        return null;
      }
      // If 404/others, we might assume token is still valid (or endpoint doesn't exist)
      // but to be safe for "always logged in" issue, we only clear on 401.
      return null;
    }
  },
};
