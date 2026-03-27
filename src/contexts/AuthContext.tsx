import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { supabase, supabaseConfigError } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { ChildProfile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  childProfile: ChildProfile | null;
  loading: boolean;
  configError: string | null;
  connectionError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshChildProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Timeout wrapper for async operations
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  // Fetch child profile for the current user with timeout
  const fetchChildProfile = async (userId: string) => {
    try {
      const queryPromise = new Promise<{ data: ChildProfile | null; error: { code?: string } | null }>((resolve) => {
        supabase
          .from('child_profiles')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          .single()
          .then(resolve);
      });

      const result = await withTimeout(queryPromise, 5000, 'Profile fetch timeout');

      if (result.error && result.error.code !== 'PGRST116') {
        console.error('Error fetching child profile:', result.error);
      }

      setChildProfile(result.data || null);
    } catch (err) {
      console.error('Error fetching child profile:', err);
      setChildProfile(null);
    }
  };

  const refreshChildProfile = async () => {
    if (user) {
      await fetchChildProfile(user.id);
    }
  };

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    // Get initial session with timeout
    const initializeAuth = async () => {
      // If Supabase is not configured, stop loading and show error
      if (supabaseConfigError) {
        console.error('Supabase config error:', supabaseConfigError);
        setLoading(false);
        return;
      }

      try {
        // Try to get session with 3-second timeout
        const { data: { session: initialSession } } = await withTimeout(
          supabase.auth.getSession(),
          3000,
          'Connection timeout'
        );

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setConnectionError(null);

        if (initialSession?.user) {
          // Fetch profile with separate timeout (don't block on this)
          fetchChildProfile(initialSession.user.id).catch(console.error);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);

        // Determine the type of error
        if (error instanceof Error) {
          if (error.message === 'Connection timeout') {
            setConnectionError('Connection timed out. Please check your internet connection.');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            setConnectionError('Unable to connect. Please check your internet connection.');
          } else {
            setConnectionError('Authentication service unavailable. Please try again.');
          }
        }

        // Clear user state on error - will show login page
        setUser(null);
        setSession(null);
        setChildProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setConnectionError(null); // Clear errors on successful auth change

        if (currentSession?.user) {
          // Don't await - let it complete in background
          fetchChildProfile(currentSession.user.id).catch(console.error);
        } else {
          setChildProfile(null);
        }

        // Handle specific auth events
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          setChildProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setConnectionError(null);
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        10000,
        'Sign in timed out. Please try again.'
      );
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('timeout')) {
        setConnectionError('Connection timed out. Please try again.');
      }
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setConnectionError(null);
      const { error } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        10000,
        'Sign up timed out. Please try again.'
      );
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('timeout')) {
        setConnectionError('Connection timed out. Please try again.');
      }
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await withTimeout(
        supabase.auth.signOut(),
        5000,
        'Sign out timed out'
      );
    } catch (err) {
      console.error('Sign out error:', err);
    }
    // Always clear local state
    setUser(null);
    setSession(null);
    setChildProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      setConnectionError(null);
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        }),
        10000,
        'Password reset timed out. Please try again.'
      );
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const value = {
    user,
    session,
    childProfile,
    loading,
    configError: supabaseConfigError,
    connectionError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshChildProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
