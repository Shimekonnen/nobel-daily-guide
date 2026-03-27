import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, supabaseConfigError } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { ChildProfile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  childProfile: ChildProfile | null;
  loading: boolean;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshChildProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch child profile for the current user
  const fetchChildProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching child profile:', error);
      }

      setChildProfile(data || null);
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
    // Get initial session
    const initializeAuth = async () => {
      // If Supabase is not configured, stop loading and show error
      if (supabaseConfigError) {
        console.error('Supabase config error:', supabaseConfigError);
        setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchChildProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchChildProfile(currentSession.user.id);
        } else {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setChildProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
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
