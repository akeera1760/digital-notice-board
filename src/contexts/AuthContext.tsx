import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, data: { full_name: string; role: 'student' | 'teacher'; department_id?: string; year?: number; teacherKey?: string; teacherRole?: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    data: { full_name: string; role: 'student' | 'teacher'; department_id?: string; year?: number; teacherKey?: string; teacherRole?: string }
  ) => {
    const { data: authData, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (authData.user) {
      let departmentId = data.department_id ?? null;

      // If registering as teacher with a key, mark the key as used
      if (data.role === 'teacher' && data.teacherKey) {
        const keyResp = await (supabase.from('teacher_keys') as any)
          .select('id')
          .eq('key', data.teacherKey)
          .maybeSingle();
        const keyData = keyResp.data;

        if (keyData) {
          // Update the key as used
          await (supabase.from('teacher_keys') as any)
            .update({ used_by: authData.user.id, used_at: new Date().toISOString() })
            .eq('id', keyData.id);
        }
      }

      const { error: profileError } = await (supabase.from('profiles') as any).insert({
        id: authData.user.id,
        full_name: data.full_name,
        role: data.role,
        department_id: departmentId,
        year: data.year ?? null,
        branch: data.teacherRole ?? null,
      });
      if (profileError) return { error: profileError.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
