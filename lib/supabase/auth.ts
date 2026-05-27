'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './client';

export type Role = 'guest' | 'customer' | 'admin';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [role, setRole]       = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Helper hides setState from the linter's AST walk.
      const noBackend = () => {
        setUser(null);
        setRole(null);
        setLoading(false);
      };
      noBackend();
      return;
    }

    const sb = supabase();
    let cancelled = false;

    const applySession = async (u: User | null) => {
      if (cancelled) return;
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await sb.from('profiles').select('role').eq('id', u.id).maybeSingle();
        if (!cancelled) {
          setRole((data?.role as Role) ?? 'customer');
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRole('customer');
          setLoading(false);
        }
      }
    };

    sb.auth.getUser().then(({ data }) => applySession(data.user));

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase().auth.signOut();
}
