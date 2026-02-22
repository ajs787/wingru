'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Users, Settings, Plus, Heart, ChevronRight } from 'lucide-react';

export default function FeedPage() {
  const router = useRouter();
  const supabase = createClient();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, delRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/delegations'),
        ]);
        if (profRes.ok) {
          const { profile } = await profRes.json();
          setMyProfile(profile);
        }
        if (delRes.ok) {
          const { owners: o } = await delRes.json();
          setOwners(o ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-rose-500">WingRu</span>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500">
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 animate-fade-in">
        {/* Greeting */}
        {myProfile?.name && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Hey, {myProfile.name} 👋</h1>
            <p className="text-slate-500 mt-1">Who are you swinging for today?</p>
          </div>
        )}

        {/* Who to swipe for */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Swipe for a friend</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : owners.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <Heart className="w-8 h-8 text-rose-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No friends delegated yet</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">Ask a friend to share their invite code</p>
              <Link href="/delegate">
                <Button variant="soft" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Enter invite code
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {owners.map((o) => {
                const profile = o.profiles;
                return (
                  <button
                    key={o.id}
                    onClick={() => router.push(`/feed/${o.owner_user_id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {profile?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">{profile?.name || `@${profile?.netid}`}</p>
                        <p className="text-xs text-slate-400">
                          {profile?.year} · {profile?.major}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/matches/${o.owner_user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-rose-400 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        Matches
                      </Link>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA to enter code */}
        <div className="flex items-center gap-3">
          <Link href="/delegate" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Enter a friend&apos;s code
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="soft" className="gap-2">
              <Settings className="w-4 h-4" />
              My code
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
