import { useMemo } from 'react';
import { ArrowLeft, Bookmark, Check, Share2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import { copyShareLink } from '@/src/lib/seoUtils';

interface MemberDetailPageProps {
  memberUid: string;
  onBack: () => void;
  onSelectOrg: (orgId: string) => void;
  onSelectOuting: (outingId: string) => void;
  onSelectPost: (postId: string) => void;
  onEditProfile: () => void;
}

export function MemberDetailPage({
  memberUid,
  onBack,
  onSelectOrg,
  onSelectOuting,
  onSelectPost,
  onEditProfile,
}: MemberDetailPageProps) {
  const {
    user,
    profiles,
    organizations,
    memberships,
    bookmarks,
    posts,
    outings,
    rsvps,
    carpoolOffers,
    follows,
    toggleFollowMember,
    signInWithGoogle,
  } = useCommunity();

  const member = useMemo(
    () => profiles.find((p) => p.uid === memberUid) || null,
    [profiles, memberUid]
  );

  const memberClubs = useMemo(
    () => memberships.filter((m) => m.userId === memberUid),
    [memberships, memberUid]
  );

  const memberPosts = useMemo(
    () => posts.filter((p) => p.authorId === memberUid),
    [posts, memberUid]
  );

  const memberOutings = useMemo(() => {
    const ids = new Set(rsvps.filter((r) => r.userId === memberUid).map((r) => r.outingId));
    return outings.filter((o) => ids.has(o.id));
  }, [rsvps, outings, memberUid]);

  const followers = useMemo(
    () => follows.filter((f) => f.targetUserId === memberUid),
    [follows, memberUid]
  );

  const following = useMemo(
    () => follows.filter((f) => f.followerId === memberUid),
    [follows, memberUid]
  );

  const isSelf = Boolean(user && user.uid === memberUid);
  const isFollowing = Boolean(user && followers.some((f) => f.followerId === user.uid));

  const hostedOffersCount = useMemo(
    () => carpoolOffers.filter((offer) => offer.hostId === memberUid).length,
    [carpoolOffers, memberUid]
  );

  const orgById = useMemo(() => {
    const map = new Map<string, (typeof organizations)[number]>();
    for (const o of organizations) map.set(o.id, o);
    return map;
  }, [organizations]);

  if (!user) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-12 space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Members
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-4 max-w-xl">
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Sign in to view member profiles.
          </h1>
          <p className="text-sm text-muted-foreground">
            Member profiles and rosters are shared with signed-in Fieldline community members.
          </p>
          <Button onClick={() => void signInWithGoogle()}>Sign in with Google</Button>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-12 space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Members
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3 max-w-xl">
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Member profile not found.
          </h1>
          <p className="text-sm text-muted-foreground">
            This member may not have created a public profile yet.
          </p>
          <Button onClick={onBack}>Return to Members</Button>
        </div>
      </div>
    );
  }

  const initials = member.displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="mx-auto max-w-[1280px] px-6 py-8 md:py-12 space-y-10 pb-20">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Members
      </button>

      {/* Member Header */}
      <header className="pb-8 border-b border-border flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <Avatar className="size-16 md:size-20 shrink-0">
            <AvatarImage
              src={member.photoURL}
              alt={member.displayName}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              {member.homeRegion} {isSelf ? '· Your Profile' : '· Fieldline Member'}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              {member.displayName}
            </h1>
            {member.bio && (
              <p className="text-base text-muted-foreground leading-relaxed">{member.bio}</p>
            )}
            {member.disciplines.length > 0 && (
              <p className="text-xs font-medium text-primary pt-1">
                {member.disciplines.join(' · ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            onClick={() => void copyShareLink('Member profile link')}
            className="h-10 px-3.5 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="size-4" aria-hidden="true" />
            Share
          </Button>
          {isSelf ? (
            <Button variant="outline" onClick={onEditProfile} className="h-10 px-5">
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'secondary' : 'default'}
              onClick={() => void toggleFollowMember(member)}
              className="h-10 px-5"
            >
              {isFollowing ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="size-4" aria-hidden="true" />
                  Follow Member
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Personal Trail Log & Network Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-border pb-8 gap-6">
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {memberClubs.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Joined Clubs</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {memberOutings.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Outings RSVP’d</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {memberPosts.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Field Dispatches</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {hostedOffersCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Rides &amp; Gear Shared</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {followers.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Followers</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {following.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Following</p>
        </div>
      </div>

      {/* 70 / 30 Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-10">
          {/* Joined Clubs */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              Joined Clubs ({memberClubs.length})
            </h2>
            {memberClubs.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                No clubs joined yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberClubs.map((club) => {
                  const org = orgById.get(club.orgId);
                  return (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => onSelectOrg(club.orgId)}
                      className="text-left rounded-lg border border-border bg-card p-4 flex items-center gap-3.5 hover:border-foreground/30 transition-colors cursor-pointer"
                    >
                      <OrgLogo
                        orgId={club.orgId}
                        name={club.orgName}
                        discipline={org?.discipline}
                        size="md"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-serif text-base font-medium text-foreground truncate">
                          {club.orgName}
                        </p>
                        {org && (
                          <p className="text-xs text-muted-foreground truncate">
                            {org.discipline} · {org.region}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Field Dispatches */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              Field Dispatches ({memberPosts.length})
            </h2>
            {memberPosts.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                No trail notes or dispatches published yet.
              </div>
            ) : (
              <div className="space-y-4">
                {memberPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => onSelectPost(post.id)}
                    className="w-full text-left rounded-lg border border-border bg-card p-6 space-y-2.5 hover:border-foreground/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-primary">{post.category}</span> ·{' '}
                        {post.orgName}
                      </span>
                      <span className="font-mono">{post.timestampLabel}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-prose line-clamp-3">
                      {post.body}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Upcoming Outings + Saved Clubs (Self Only) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Upcoming Outings ({memberOutings.length})
            </h2>
            {memberOutings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not RSVP’d to any upcoming outings yet.
              </p>
            ) : (
              <div className="space-y-3">
                {memberOutings.map((outing) => (
                  <button
                    key={outing.id}
                    type="button"
                    onClick={() => onSelectOuting(outing.id)}
                    className="w-full text-left rounded-md border border-border bg-background p-4 space-y-1 hover:border-foreground/30 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-mono text-primary">{outing.dateLabel}</p>
                    <p className="font-serif text-base font-medium text-foreground">
                      {outing.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{outing.location}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isSelf && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="size-3.5" aria-hidden="true" />
                Saved Clubs ({bookmarks.length})
              </h2>
              {bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bookmark organizations in the directory to keep a private shortlist for future
                  trips.
                </p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {bookmarks.map((bm) => {
                    const org = orgById.get(bm.orgId);
                    return (
                      <li key={bm.id} className="py-2.5 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => onSelectOrg(bm.orgId)}
                          className="w-full flex items-center gap-2.5 text-left text-foreground font-medium hover:text-primary transition-colors cursor-pointer"
                        >
                          <OrgLogo
                            orgId={bm.orgId}
                            name={bm.orgName}
                            discipline={org?.discipline}
                            size="xs"
                          />
                          <span className="truncate">{bm.orgName}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
