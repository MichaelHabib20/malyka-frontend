import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  name?: string;
  RoleId?: number;
  PermissionName?: string | string[];
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

  public hasPermission(permission: string): boolean {
    if (!this.currentUser || !this.currentUser.PermissionName) return false;
    
    // Handle PermissionName as either string or array
    const userPermissions = Array.isArray(this.currentUser.PermissionName) 
      ? this.currentUser.PermissionName 
      : [this.currentUser.PermissionName];
    
    // Case-insensitive comparison
    return userPermissions.some(userPermission => 
      userPermission.toLowerCase() === permission.toLowerCase()
    );
  }

  public hasAnyPermission(permissions: string[]): boolean {
    if (!this.currentUser || !this.currentUser.PermissionName) return false;
    
    // Handle PermissionName as either string or array
    const userPermissions = Array.isArray(this.currentUser.PermissionName) 
      ? this.currentUser.PermissionName 
      : [this.currentUser.PermissionName];
    
    // Case-insensitive comparison
    return permissions.some(permission => 
      userPermissions.some(userPermission => 
        userPermission.toLowerCase() === permission.toLowerCase()
      )
    );
  }

  public hasRole(roleId: number): boolean {
    if (!this.currentUser || !this.currentUser.RoleId) return false;
    return Number(this.currentUser.RoleId) === roleId;
  }
}

export const authService = AuthService.getInstance(); 