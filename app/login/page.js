'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const ALLOWED_DOMAINS = ['rutgers.edu', 'scarletmail.rutgers.edu'];

function isRutgersEmail(email) {
  return true; // dev mode: accept any email
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const errParam = searchParams.get('error');
    const netid = searchParams.get('netid');
    if (errParam === 'netid_taken') {
      setError(`NetID "${netid}" already has an account linked to a different email. Please use the original email you signed up with.`);
    } else if (errParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = email.trim().toLowerCase();

    if (!isRutgersEmail(trimmed)) {
      setError('Only @rutgers.edu or @scarletmail.rutgers.edu emails are allowed.');
      return;
    }

    setLoading(true);
    try {
      const { error: sbError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (sbError) {
        if (sbError.message.toLowerCase().includes('fetch')) {
          setError('Cannot reach Supabase. Check that your project is active (not paused) at supabase.com and that your .env.local keys are correct.');
        } else {
          setError(sbError.message);
        }
        return;
      }

      setSent(true);
    } catch (err) {
      setError('Network error — cannot reach Supabase. Is your project paused?');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your inbox</h1>
          <p className="text-slate-500 mb-2">
            We sent a magic link to
          </p>
          <p className="font-semibold text-slate-800 mb-6">{email}</p>
          <p className="text-sm text-slate-400 mb-8">
            Click the link in the email to sign in. It expires in 1 hour.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="text-sm text-rose-500 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
            Sign in to WingRu
          </h1>
          <p className="text-slate-500 text-center mb-8 text-sm">
            Enter any email to get a magic link
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-6">
            Dev mode: any email accepted. One account per email prefix.
          </p>
        </div>
      </div>
    </div>
  );
}
