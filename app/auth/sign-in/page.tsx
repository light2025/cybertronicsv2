'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, AlertTriangle } from 'lucide-react';
import { signIn } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function SignInForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '/admin';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 grid place-items-center rounded-full bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-[16px] font-bold text-gray-900">Supabase not configured</h1>
              <p className="text-[12px] text-gray-600 mt-1">
                Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
                your <code className="bg-gray-100 px-1 rounded">.env.local</code> and restart the
                dev server.
              </p>
              <p className="text-[12px] text-gray-600 mt-2">
                See <code className="bg-gray-100 px-1 rounded">docs/supabase-setup.md</code> for
                the full setup walkthrough.
              </p>
            </div>
          </div>
          <Link href="/" className="inline-block text-[12px] text-cyber-dark hover:underline mt-2">
            ← Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-6">
      <form
        onSubmit={submit}
        className="max-w-sm w-full bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber to-cyber-dark grid place-items-center text-white font-bold text-[14px]">
            C
          </span>
          <div>
            <h1 className="text-[16px] font-bold text-gray-900 leading-none">Cybertronics</h1>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">admin sign-in</p>
          </div>
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-[11px] text-gray-500 text-center">
          Sign-up is admin-only for Stage 2. Have a project owner invite you via the Supabase dashboard.
        </p>

        <Link href="/" className="block text-[11px] text-gray-500 text-center hover:text-gray-700">
          ← Back to storefront
        </Link>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-gray-50">
          <div className="text-[12px] text-gray-500">Loading…</div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
