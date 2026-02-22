'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Copy, RefreshCw, UserX, Clock, Settings2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { toast } = useToast();
  const [invite, setInvite] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [delegates, setDelegates] = useState([]);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    loadDelegates();
  }, []);

  async function loadDelegates() {
    try {
      const res = await fetch('/api/delegations');
      if (!res.ok) return;
      const { delegates: d } = await res.json();
      setDelegates(d ?? []);
    } catch {}
  }

  async function generateInvite() {
    setGenerating(true);
    try {
      const res = await fetch('/api/invite/create', { method: 'POST' });
      if (!res.ok) {
        const { error } = await res.json();
        toast({ title: 'Error', description: error, variant: 'destructive' });
        return;
      }
      const { invite: inv } = await res.json();
      setInvite(inv);
      toast({ title: 'Invite code generated!', description: 'Share it with your wingman. It expires in 10 minutes.' });
    } finally {
      setGenerating(false);
    }
  }

  async function copyCode() {
    if (!invite?.code) return;
    await navigator.clipboard.writeText(invite.code);
    toast({ title: 'Copied!', description: `Code ${invite.code} copied to clipboard.` });
  }

  async function revokeDelegate(delegationId) {
    setRevoking(delegationId);
    try {
      const res = await fetch('/api/delegations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delegation_id: delegationId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast({ title: 'Error', description: error, variant: 'destructive' });
        return;
      }
      setDelegates((d) => d.filter((del) => del.id !== delegationId));
      toast({ title: 'Delegate removed', description: 'They can no longer swipe for you.' });
    } finally {
      setRevoking(null);
    }
  }

  function expiresIn(isoStr) {
    const diff = new Date(isoStr) - new Date();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!invite) return;
    const interval = setInterval(() => {
      setCountdown(expiresIn(invite.expires_at));
    }, 1000);
    setCountdown(expiresIn(invite.expires_at));
    return () => clearInterval(interval);
  }, [invite]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/feed">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Manage your wingmen</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-10 animate-fade-in">
        {/* Generate invite code */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Invite a wingman</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5">
            Generate a one-time invite code and share it with a friend. They&apos;ll use it at{' '}
            <span className="font-medium text-rose-500">/delegate</span> to start swiping for you.
          </p>

          {invite && countdown !== 'Expired' ? (
            <div className="border-2 border-rose-100 rounded-2xl p-5 bg-rose-50/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 font-medium">Your invite code</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {countdown}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-mono font-bold tracking-widest text-rose-600">
                  {invite.code}
                </span>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-3">One-time use · Expires in ~10 minutes</p>
            </div>
          ) : (
            <Button onClick={generateInvite} disabled={generating} className="gap-2">
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Generate invite code
            </Button>
          )}

          {invite && countdown === 'Expired' && (
            <div className="mt-3">
              <p className="text-sm text-slate-400 mb-2">Code expired.</p>
              <Button onClick={generateInvite} disabled={generating} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Generate new code
              </Button>
            </div>
          )}
        </section>

        {/* Active delegates */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Active wingmen
            {delegates.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">({delegates.length})</span>
            )}
          </h2>

          {delegates.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No active wingmen yet.</p>
              <p className="text-slate-400 text-xs mt-1">Generate a code to invite your first one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {delegates.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {d.profiles?.name || `@${d.profiles?.netid}`}
                    </p>
                    <p className="text-xs text-slate-400">@{d.profiles?.netid}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeDelegate(d.id)}
                    disabled={revoking === d.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
                  >
                    <UserX className="w-4 h-4" />
                    {revoking === d.id ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
