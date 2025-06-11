import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ data: any; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Handle refresh token errors
        if (error) {
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token')) {
            // Clear the invalid session
            await supabase.auth.signOut();
            if (mounted) {
              setSession(null);
              setUser(null);
              router.replace('/auth');
            }
            return;
          }
          console.error('Error getting session:', error.message);
          if (mounted) {
            router.replace('/auth');
          }
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          // Handle initial navigation based on session state
          if (session?.user) {
            try {
              // Check onboarding status
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_onboarding_complete')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profileError) {
                console.error('Error fetching profile:', profileError);
                // Fallback to main app if there's an error
                router.replace('/(tabs)');
                return;
              }

              if (profile?.is_onboarding_complete) {
                router.replace('/(tabs)');
              } else {
                router.replace('/onboarding');
              }
            } catch (error) {
              console.error('Error during post-auth navigation:', error);
              // Fallback to main app
              router.replace('/(tabs)');
            }
          } else {
            // No session, go to auth
            router.replace('/auth');
          }
        }
      } catch (error) {
        console.error('Unexpected error during session initialization:', error);
        if (mounted) {
          router.replace('/auth');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth().catch(console.error);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }

          // Create profile on sign up
          if (event === 'SIGNED_UP' && session?.user) {
            await createProfile(session.user);
          }

          // Handle successful sign in/up - navigate directly to appropriate screen
          if ((event === 'SIGNED_IN' || event === 'SIGNED_UP') && session?.user) {
            try {
              // Check onboarding status
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('is_onboarding_complete')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching profile:', error);
                // Fallback to main app if there's an error
                router.replace('/(tabs)');
                return;
              }

              if (profile?.is_onboarding_complete) {
                router.replace('/(tabs)');
              } else {
                router.replace('/onboarding');
              }
            } catch (error) {
              console.error('Error during post-auth navigation:', error);
              // Fallback to main app
              router.replace('/(tabs)');
            }
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            router.replace('/auth');
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const createProfile = async (user: User, firstName?: string, lastName?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          first_name: firstName || null,
          last_name: lastName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error && error.code !== '23505') {
        console.error('Error creating profile:', error.message);
      }
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const result = await supabase.auth.signUp({ email, password });
      
      // If sign up was successful and we have a user, create profile with name
      if (result.data.user && !result.error) {
        await createProfile(result.data.user, firstName, lastName);
      }
      
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local state
      setUser(null);
      setSession(null);
      
      // Navigate to auth screen
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};