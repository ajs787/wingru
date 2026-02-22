'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, X, Heart, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

const TAGS = ['Green flag 💚', 'Funny 😂', 'Sus 🤨', 'Cute 🥺', 'Smart 🧠', 'No reason needed ✨'];

function CardSkeleton() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[3/5] rounded-3xl overflow-hidden bg-slate-100 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-200 to-transparent h-48" />
    </div>
  );
}

function ProfileCard({ candidate, onSwipe }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [swiping, setSwiping] = useState(null); // 'left' | 'right'

  const photos = candidate.photos ?? [];
  const currentPhoto = photos[photoIdx];
  const photoCount = photos.length;

  function prevPhoto() {
    setPhotoIdx((i) => Math.max(0, i - 1));
  }
  function nextPhoto() {
    setPhotoIdx((i) => Math.min(photoCount - 1, i + 1));
  }

  async function handleLike() {
    if (showTags) {
      await doSwipe('right', selectedTag);
      setShowTags(false);
      setSelectedTag('');
    } else {
      setShowTags(true);
    }
  }

  async function handlePass() {
    setShowTags(false);
    await doSwipe('left', null);
  }

  async function doSwipe(direction, tag) {
    setSwiping(direction);
    setTimeout(() => {
      onSwipe(candidate.id, direction, tag);
      setSwiping(null);
    }, 350);
  }

  return (
    <div
      className={`relative w-full max-w-sm mx-auto transition-all duration-350
        ${swiping === 'left' ? 'animate-swipe-left' : swiping === 'right' ? 'animate-swipe-right' : 'animate-card-enter'}`}
    >
      {/* Photo container */}
      <div className="relative aspect-[3/5] rounded-3xl overflow-hidden shadow-xl card-swipe bg-slate-100">
        {currentPhoto ? (
          <Image
            src={currentPhoto.publicUrl}
            alt={candidate.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
            <span className="text-6xl font-bold text-rose-200">{candidate.name?.[0]}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Photo navigation */}
        {photoCount > 1 && (
          <>
            <div className="absolute top-3 left-3 right-3 flex gap-1">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors ${i === photoIdx ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
            <button
              onClick={prevPhoto}
              disabled={photoIdx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white disabled:opacity-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextPhoto}
              disabled={photoIdx === photoCount - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white disabled:opacity-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white text-2xl font-bold">
            {candidate.name}, {candidate.age}
          </h3>
          <p className="text-white/80 text-sm mt-0.5">
            {candidate.year} · {candidate.major}
          </p>
          {candidate.personality_answer && (
            <Badge variant="secondary" className="mt-2 text-xs bg-white/20 text-white border-transparent">
              {candidate.personality_answer}
            </Badge>
          )}

          {/* Prompt snippet */}
          {photos[photoIdx]?.prompts?.text && photos[photoIdx]?.prompt_answer && (
            <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs">{photos[photoIdx].prompts.text}</p>
              <p className="text-white text-sm font-medium mt-0.5">{photos[photoIdx].prompt_answer}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tag picker (shown when pressing like) */}
      {showTags && (
        <div className="mt-4 p-4 rounded-2xl border border-slate-100 bg-white animate-fade-in">
          <p className="text-sm text-slate-500 mb-3 font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" /> Add a tag (optional)
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTag(t === selectedTag ? '' : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedTag === t
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'border-slate-200 text-slate-600 hover:border-rose-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button onClick={handleLike} size="sm" className="w-full gap-2">
            <Heart className="w-4 h-4" />
            Confirm like{selectedTag ? ` — ${selectedTag}` : ''}
          </Button>
        </div>
      )}

      {/* Action buttons */}
      {!showTags && (
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={handlePass}
            className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all group shadow-sm"
          >
            <X className="w-7 h-7 text-slate-400 group-hover:text-red-400" />
          </button>
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full border-2 border-rose-200 flex items-center justify-center hover:border-rose-400 hover:bg-rose-50 transition-all group shadow-sm"
          >
            <Heart className="w-7 h-7 text-rose-400 group-hover:text-rose-500" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function OwnerFeedPage() {
  const { ownerId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [candidates, setCandidates] = useState([]);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/feed?ownerId=${ownerId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Could not load feed.');
          return;
        }
        setCandidates(data.candidates ?? []);
        // Load owner profile separately
        const pRes = await fetch(`/api/profile`);
        // We don't have owner profile directly; we'll derive from delegations
      } catch {
        setError('Something went wrong loading the feed.');
      } finally {
        setLoading(false);
      }
    }

    // Load owner info from delegations list
    async function loadOwnerProfile() {
      const res = await fetch('/api/delegations');
      if (!res.ok) return;
      const { owners } = await res.json();
      const owner = owners?.find((o) => o.owner_user_id === ownerId);
      if (owner?.profiles) setOwnerProfile(owner.profiles);
    }

    load();
    loadOwnerProfile();
  }, [ownerId]);

  async function handleSwipe(targetId, direction, tag) {
    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_user_id: ownerId,
          target_user_id: targetId,
          direction,
          tag: tag || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Swipe error', description: data.error, variant: 'destructive' });
        return;
      }

      if (data.matched) {
        toast({
          title: "It's a match! 🎉",
          description: `${ownerProfile?.name || 'Your friend'} matched!`,
        });
      }

      // Advance to next card
      setCurrentIdx((i) => i + 1);
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'destructive' });
    }
  }

  const currentCandidate = candidates[currentIdx];
  const isExhausted = !loading && !error && currentIdx >= candidates.length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <Link href="/feed">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Swiping for</p>
            <p className="text-sm font-bold text-slate-800">
              {ownerProfile?.name || '...'}
            </p>
          </div>
          <Link href={`/matches/${ownerId}`}>
            <Button variant="ghost" size="icon">
              <Heart className="w-4 h-4 text-rose-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        <div className="w-full max-w-sm">
          {loading && <CardSkeleton />}

          {error && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-300" />
              </div>
              <p className="text-slate-500 font-medium">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/feed')}
              >
                Back to feed
              </Button>
            </div>
          )}

          {isExhausted && (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You&apos;re all caught up!</h3>
              <p className="text-slate-500 text-sm mb-6">
                You&apos;ve swiped through all available profiles for {ownerProfile?.name || 'your friend'}.
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/matches/${ownerId}`}>
                  <Button className="w-full gap-2">
                    <Heart className="w-4 h-4" /> View matches
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button variant="outline" className="w-full">
                    Back to feed
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && currentCandidate && (
            <ProfileCard
              key={currentCandidate.id}
              candidate={currentCandidate}
              onSwipe={handleSwipe}
            />
          )}
        </div>
      </div>
    </div>
  );
}
