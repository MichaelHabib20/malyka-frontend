import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Initialize user from localStorage if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        this.currentUser = jwtDecode<User>(token);
        // Check if token is expired
        if (this.currentUser.exp && this.currentUser.exp * 1000 < Date.now()) {
          console.warn('Token has expired');
          this.clearUser();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.clearUser();
      }
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setToken(token: string): void {
    try {
      // Validate token format before storing
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error('Invalid token format');
      }
      
      const decoded = jwtDecode<User>(token);
      localStorage.setItem('authToken', token);
      this.currentUser = decoded;
      console.log(this.currentUser)
    } catch (error) {
      console.error('Error setting token:', error);
      this.clearUser();
      throw error; // Re-throw to let caller handle the error
    }
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    if (!this.currentUser) return false;
    
    return true;
  }

  public clearUser(): void {
    localStorage.removeItem('authToken');
    this.currentUser = null;
  }
}

export const authService = AuthService.getInstance(); 