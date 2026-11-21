import { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, Check, MessageSquare, ShieldCheck, UserPlus, Car, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommunity } from '@/src/context/CommunityContext';

interface ActivityViewProps {
  onSelectOrg: (orgId: string) => void;
  onSelectOuting: (outingId: string) => void;
  onSelectPost: (postId: string) => void;
  onSelectMember: (uid: string) => void;
}

interface ActivityNotification {
  id: string;
  kind: 'reply' | 'rsvp' | 'follow' | 'club-post' | 'carpool';
  title: string;
  detail: string;
  timestampMs: number;
  onOpen: () => void;
}

const LAST_SEEN_KEY = 'fieldline_activity_last_seen';

function formatRelative(ms: number): string {
  const diffMin = Math.floor((Date.now() - ms) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 14) return `${diffDay}d ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityView({
  onSelectOrg,
  onSelectOuting,
  onSelectPost,
  onSelectMember,
}: ActivityViewProps) {
  const {
    user,
    isAdmin,
    memberships,
    posts,
    postComments,
    outings,
    rsvps,
    follows,
    carpoolOffers,
    carpoolClaims,
    clubClaims,
    reviewClubClaim,
    signInWithGoogle,
  } = useCommunity();

  const [section, setSection] = useState<'inbox' | 'stewardship'>('inbox');

  useEffect(() => {
    if (user) {
      try {
        window.localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      } catch {
        // ignore storage errors
      }
    }
  }, [user]);

  const notifications = useMemo<ActivityNotification[]>(() => {
    if (!user) return [];
    const items: ActivityNotification[] = [];

    // 1. Replies on your Field Notes
    const myPostMap = new Map(posts.filter((p) => p.authorId === user.uid).map((p) => [p.id, p]));
    for (const comment of postComments) {
      const parentPost = myPostMap.get(comment.postId);
      if (parentPost && comment.authorId !== user.uid) {
        items.push({
          id: `reply-${comment.id}`,
          kind: 'reply',
          title: `${comment.authorName} replied to "${parentPost.title}"`,
          detail: comment.body,
          timestampMs: comment.createdAtMs,
          onOpen: () => onSelectPost(parentPost.id),
        });
      }
    }

    // 2. RSVPs on outings you host
    const myOutingMap = new Map(
      outings.filter((o) => o.hostId === user.uid).map((o) => [o.id, o])
    );
    for (const rsvp of rsvps) {
      const hosted = myOutingMap.get(rsvp.outingId);
      if (hosted && rsvp.userId !== user.uid) {
        items.push({
          id: `rsvp-${rsvp.id}`,
          kind: 'rsvp',
          title: `${rsvp.userName} RSVP'd to ${hosted.title}`,
          detail: `${hosted.dateLabel} · ${hosted.location}`,
          timestampMs: rsvp.createdAtMs,
          onOpen: () => onSelectOuting(hosted.id),
        });
      }
    }

    // 3. Claims on your carpool or loaner gear offers
    const myOfferMap = new Map(
      carpoolOffers.filter((o) => o.hostId === user.uid).map((o) => [o.id, o])
    );
    for (const claim of carpoolClaims) {
      const offer = myOfferMap.get(claim.offerId);
      if (offer && claim.userId !== user.uid) {
        items.push({
          id: `claim-${claim.id}`,
          kind: 'carpool',
          title: `${claim.userName} claimed a ${offer.offerType === 'carpool' ? 'carpool seat' : 'loaner gear slot'}`,
          detail: `${offer.itemSummary} · ${offer.departurePoint}`,
          timestampMs: claim.createdAtMs,
          onOpen: () => onSelectOuting(offer.outingId),
        });
      }
    }

    // 4. New followers
    for (const follow of follows) {
      if (follow.targetUserId === user.uid) {
        items.push({
          id: `follow-${follow.id}`,
          kind: 'follow',
          title: `${follow.followerName} started following you`,
          detail: 'View their member profile and joined chapters.',
          timestampMs: follow.createdAtMs,
          onOpen: () => onSelectMember(follow.followerId),
        });
      }
    }

    // 5. Recent dispatches in clubs you joined
    const myClubIds = new Set(
      memberships.filter((m) => m.userId === user.uid).map((m) => m.orgId)
    );
    for (const post of posts) {
      if (post.orgId && myClubIds.has(post.orgId) && post.authorId !== user.uid) {
        items.push({
          id: `club-post-${post.id}`,
          kind: 'club-post',
          title: `New ${post.category} in ${post.orgName}`,
          detail: `${post.title} — by ${post.authorName}`,
          timestampMs: post.createdAtMs,
          onOpen: () => onSelectPost(post.id),
        });
      }
    }

    return items.sort((a, b) => b.timestampMs - a.timestampMs);
  }, [
    user,
    posts,
    postComments,
    outings,
    rsvps,
    carpoolOffers,
    carpoolClaims,
    follows,
    memberships,
    onSelectOuting,
    onSelectPost,
    onSelectMember,
  ]);

  const pendingClaimsCount = clubClaims.filter((c) => c.status === 'pending').length;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Member Inbox
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Activity &amp; Stewardship
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Track replies on your Field Notes, outing RSVPs, carpool seat claims, new followers, and
            chapter listing update requests.
          </p>
        </div>

        {user && (
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSection('inbox')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                section === 'inbox'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setSection('stewardship')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                section === 'stewardship'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isAdmin
                ? `Stewardship Queue (${pendingClaimsCount})`
                : `My Club Requests (${clubClaims.length})`}
            </button>
          </div>
        )}
      </div>

      {!user ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-4 max-w-xl mx-auto">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Sign in to view your community activity.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Receive updates when trail partners reply to your notes, claim carpool seats, RSVP to
            your outings, or post inside clubs you joined.
          </p>
          <Button onClick={() => void signInWithGoogle()} className="h-10 px-6">
            Sign in with Google
          </Button>
        </div>
      ) : section === 'inbox' ? (
        notifications.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3 max-w-xl">
            <Bell className="size-6 text-muted-foreground mx-auto" aria-hidden="true" />
            <h2 className="font-serif text-xl font-medium text-foreground">
              Your inbox is quiet for now.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join local clubs, publish a Field Note, or host an outing to start seeing replies,
              RSVPs, and trail updates here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onOpen}
                className="w-full text-left p-5 hover:bg-secondary/50 transition-colors flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="mt-0.5 text-primary shrink-0">
                    {item.kind === 'reply' && <MessageSquare className="size-4" aria-hidden="true" />}
                    {item.kind === 'rsvp' && <Calendar className="size-4" aria-hidden="true" />}
                    {item.kind === 'follow' && <UserPlus className="size-4" aria-hidden="true" />}
                    {item.kind === 'carpool' && <Car className="size-4" aria-hidden="true" />}
                    {item.kind === 'club-post' && <Bell className="size-4" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.detail}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap shrink-0">
                  {formatRelative(item.timestampMs)}
                </span>
              </button>
            ))}
          </div>
        )
      ) : (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <span>
              {isAdmin
                ? 'Admin Directory Stewardship Queue'
                : 'Your Submitted Chapter Claim & Update Requests'}
            </span>
          </div>

          {clubClaims.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center space-y-2 max-w-xl">
              <h2 className="font-serif text-xl font-medium text-foreground">
                No chapter update requests yet.
              </h2>
              <p className="text-sm text-muted-foreground">
                Open any organization page and choose &ldquo;Claim or Update Listing&rdquo; to
                submit official chapter updates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clubClaims.map((claim) => (
                <article
                  key={claim.id}
                  className="rounded-lg border border-border bg-card p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => onSelectOrg(claim.orgId)}
                        className="font-serif text-xl font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {claim.orgName}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Requested by <span className="text-foreground">{claim.requesterName}</span>{' '}
                        ({claim.roleTitle}) ·{' '}
                        <span className="font-mono uppercase">{claim.status}</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatRelative(claim.createdAtMs)}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed">{claim.notes}</p>

                  {(claim.proposedSummary || claim.proposedWebsite || claim.proposedChapterCount) && (
                    <dl className="divide-y divide-border border-y border-border text-xs">
                      {claim.proposedChapterCount && (
                        <div className="py-2 grid grid-cols-3 gap-4">
                          <dt className="text-muted-foreground">Proposed Footprint</dt>
                          <dd className="col-span-2 text-foreground">{claim.proposedChapterCount}</dd>
                        </div>
                      )}
                      {claim.proposedWebsite && (
                        <div className="py-2 grid grid-cols-3 gap-4">
                          <dt className="text-muted-foreground">Proposed Website</dt>
                          <dd className="col-span-2 text-foreground break-all">
                            {claim.proposedWebsite}
                          </dd>
                        </div>
                      )}
                      {claim.proposedSummary && (
                        <div className="py-2 grid grid-cols-3 gap-4">
                          <dt className="text-muted-foreground">Proposed Summary</dt>
                          <dd className="col-span-2 text-foreground leading-relaxed">
                            {claim.proposedSummary}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {isAdmin && claim.status === 'pending' && (
                    <div className="flex items-center gap-2.5 pt-1">
                      <Button
                        size="sm"
                        onClick={() => void reviewClubClaim(claim.id, 'approved')}
                        className="h-9 px-4 gap-1.5"
                      >
                        <Check className="size-3.5" aria-hidden="true" />
                        Approve Request
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void reviewClubClaim(claim.id, 'rejected')}
                        className="h-9 px-4 gap-1.5"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
