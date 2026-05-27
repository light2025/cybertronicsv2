'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';

type Props = { children: ReactNode };

export default function AuthGate({ children }: Props) {
  const { user, role, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname ?? '/admin');
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [user, loading, pathname, router]);

  // Supabase not configured → open admin (Stage 1 behaviour).
  if (!isSupabaseConfigured()) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking session…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="text-[12px] text-gray-500">Redirecting to sign-in…</div>
      </div>
    );
  }

  if (role && role !== 'admin') {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-[18px] font-bold text-gray-900">Admin access required</h1>
          <p className="text-[13px] text-gray-600">
            Your account ({user.email}) doesn&apos;t have the <code>admin</code> role.
            Have a project owner run this in Supabase SQL Editor:
          </p>
          <pre className="text-[11px] bg-gray-100 rounded-md p-2 font-mono text-left">
            update profiles set role = &apos;admin&apos; where email = &apos;{user.email}&apos;;
          </pre>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
