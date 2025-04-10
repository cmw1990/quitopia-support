import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import ConfigManager from '../config/config-manager';
import GlobalErrorHandler from '../utils/global-error-handler';
import PerformanceMonitor from '../utils/performance-monitor';
import DatabaseService from './database-service';

// Authentication-related interfaces
interface SignUpCredentials {
  email: string;
  password: string;
  metadata?: Record<string, any>;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface PasswordResetOptions {
  email: string;
}

interface UpdateProfileOptions {
  displayName?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

class AuthService {
  private static instance: AuthService;
  private client: SupabaseClient;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  private constructor() {
    const config = ConfigManager.get('supabase');
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true
      }
    });

    // Set up auth state change listener
    this.client.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session);
    });
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Handle authentication state changes
   */
  private handleAuthStateChange(
    event: string, 
    session: Session | null
  ): void {
    try {
      switch (event) {
        case 'SIGNED_IN':
          this.currentUser = session?.user || null;
          this.currentSession = session;
          this.logAuthEvent('User signed in');
          break;
        case 'SIGNED_OUT':
          this.currentUser = null;
          this.currentSession = null;
          this.logAuthEvent('User signed out');
          break;
        case 'TOKEN_REFRESHED':
          this.currentSession = session;
          this.logAuthEvent('Token refreshed');
          break;
      }
    } catch (error) {
      GlobalErrorHandler.handleError(
        error as Error,
        {
          type: 'authentication',
          severity: 'medium',
          source: 'AuthService.handleAuthStateChange',
          additionalDetails: `Event: ${event}`
        }
      );
    }
  }

  /**
   * Log authentication events
   */
  private logAuthEvent(message: string): void {
    console.log(`[AuthService] ${message}`, {
      userId: this.currentUser?.id,
      email: this.currentUser?.email
    });
  }

  /**
   * Sign up a new user
   */
  public async signUp(
    credentials: SignUpCredentials
  ): Promise<User | null> {
    return PerformanceMonitor.measure(async () => {
      try {
        const { data, error } = await this.client.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: credentials.metadata
          }
        });

        if (error) throw error;

        // Create user profile in database
        if (data.user) {
          await DatabaseService.insert('user_profiles', {
            user_id: data.user.id,
            email: data.user.email,
            ...credentials.metadata
          });
        }

        return data.user;
      } catch (error) {
        GlobalErrorHandler.handleError(
          error as Error,
          {
            type: 'authentication',
            severity: 'high',
            source: 'AuthService.signUp',
            additionalDetails: `Email: ${credentials.email}`
          }
        );
        return null;
      }
    }, 'auth-signup');
  }

  /**
   * Sign in a user
   */
  public async signIn(
    credentials: SignInCredentials
  ): Promise<User | null> {
    return PerformanceMonitor.measure(async () => {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) throw error;

        return data.user;
      } catch (error) {
        GlobalErrorHandler.handleError(
          error as Error,
          {
            type: 'authentication',
            severity: 'high',
            source: 'AuthService.signIn',
            additionalDetails: `Email: ${credentials.email}`
          }
        );
        return null;
      }
    }, 'auth-signin');
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<boolean> {
    return PerformanceMonitor.measure(async () => {
      try {
        const { error } = await this.client.auth.signOut();

        if (error) throw error;

        return true;
      } catch (error) {
        GlobalErrorHandler.handleError(
          error as Error,
          {
            type: 'authentication',
            severity: 'medium',
            source: 'AuthService.signOut'
          }
        );
        return false;
      }
    }, 'auth-signout');
  }

  /**
   * Send password reset email
   */
  public async resetPassword(
    options: PasswordResetOptions
  ): Promise<boolean> {
    return PerformanceMonitor.measure(async () => {
      try {
        const { data, error } = await this.client.auth.resetPasswordForEmail(
          options.email,
          { 
            redirectTo: `${window.location.origin}/reset-password` 
          }
        );

        if (error) throw error;

        return true;
      } catch (error) {
        GlobalErrorHandler.handleError(
          error as Error,
          {
            type: 'authentication',
            severity: 'medium',
            source: 'AuthService.resetPassword',
            additionalDetails: `Email: ${options.email}`
          }
        );
        return false;
      }
    }, 'auth-reset-password');
  }

  /**
   * Update user profile
   */
  public async updateProfile(
    options: UpdateProfileOptions
  ): Promise<User | null> {
    return PerformanceMonitor.measure(async () => {
      try {
        if (!this.currentUser) {
          throw new Error('No authenticated user');
        }

        const { data, error } = await this.client.auth.updateUser({
          data: options.metadata,
          email: undefined,
          password: undefined
        });

        if (error) throw error;

        // Update user profile in database
        await DatabaseService.update(
          'user_profiles', 
          {
            display_name: options.displayName,
            avatar_url: options.avatarUrl,
            ...options.metadata
          },
          { user_id: this.currentUser.id }
        );

        return data.user;
      } catch (error) {
        GlobalErrorHandler.handleError(
          error as Error,
          {
            type: 'authentication',
            severity: 'medium',
            source: 'AuthService.updateProfile'
          }
        );
        return null;
      }
    }, 'auth-update-profile');
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}

// Export singleton instance
export default AuthService.getInstance();