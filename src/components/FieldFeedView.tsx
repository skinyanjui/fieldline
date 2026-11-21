import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, MessageSquare, PenLine, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import type { DirectoryOrganization, SeedPost } from '@/src/data/seedOrganizations';
import { copyShareLink } from '@/src/lib/seoUtils';
import { SCHEMA_LIMITS } from '@/src/lib/validation';

const POST_CATEGORIES: SeedPost['category'][] = [
  'Trail Report',
  'Trip Recap',
  'Carpool & Gear',
  'Conservation',
  'Introduction',
];

interface FieldFeedViewProps {
  preselectedClub: DirectoryOrganization | null;
  onClearPreselectedClub: () => void;
  onOpenProfile: () => void;
  onSelectOrg: (orgId: string) => void;
  onSelectPost: (postId: string) => void;
  onSelectMember: (uid: string) => void;
}

export function FieldFeedView({
  preselectedClub,
  onClearPreselectedClub,
  onOpenProfile,
  onSelectOrg,
  onSelectPost,
  onSelectMember,
}: FieldFeedViewProps) {
  const {
    user,
    currentProfile,
    profiles,
    organizations,
    memberships,
    posts,
    postLikes,
    postComments,
    follows,
    createPost,
    deletePost,
    togglePostLike,
    addComment,
    deleteComment,
    signInWithGoogle,
  } = useCommunity();

  const [feedScope, setFeedScope] = useState<'all' | 'clubs' | 'following'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SeedPost['category']>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingPost, setSubmittingPost] = useState(false);

  // Composer fields
  const [postCategory, setPostCategory] = useState<SeedPost['category']>('Trail Report');
  const [postOrgId, setPostOrgId] = useState<string>('commons');
  const [postTitle, setPostTitle] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postBody, setPostBody] = useState('');

  useEffect(() => {
    if (preselectedClub) {
      setPostOrgId(preselectedClub.id);
      setComposerOpen(true);
      onClearPreselectedClub();
    }
  }, [preselectedClub, onClearPreselectedClub]);

  const myMemberships = useMemo(() => {
    if (!user) return [];
    return memberships.filter((m) => m.userId === user.uid);
  }, [memberships, user]);

  const myClubIdSet = useMemo(() => {
    return new Set(myMemberships.map((m) => m.orgId));
  }, [myMemberships]);

  const followingIdSet = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(follows.filter((f) => f.followerId === user.uid).map((f) => f.targetUserId));
  }, [follows, user]);

  const orgById = useMemo(() => {
    const map = new Map<string, DirectoryOrganization>();
    for (const org of organizations) {
      map.set(org.id, org);
    }
    return map;
  }, [organizations]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (feedScope === 'clubs' && !myClubIdSet.has(p.orgId)) return false;
      if (feedScope === 'following' && !followingIdSet.has(p.authorId)) return false;
      return true;
    });
  }, [posts, categoryFilter, feedScope, myClubIdSet, followingIdSet]);

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPost(true);
    try {
      const selectedOrg = organizations.find((o) => o.id === postOrgId);
      const ok = await createPost({
        orgId: selectedOrg ? selectedOrg.id : '',
        orgName: selectedOrg ? selectedOrg.name : 'Fieldline Commons',
        category: postCategory,
        title: postTitle,
        body: postBody,
        location: postLocation,
      });
      if (ok) {
        setPostTitle('');
        setPostLocation('');
        setPostBody('');
        setPostOrgId('commons');
        setComposerOpen(false);
      }
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleReplySubmit = async (postId: string) => {
    const draft = commentDrafts[postId] || '';
    if (!draft.trim()) return;
    const ok = await addComment(postId, draft);
    if (ok) {
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    }
  };

  if (composerOpen) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-10 space-y-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setComposerOpen(false)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Field Feed
          </button>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            New Field Dispatch
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              Publish a Field Note
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Share trail conditions, trip recaps, carpool seats, or conservation calls with the
              community.
            </p>
          </div>

          <form
            onSubmit={(e) => void handlePublishPost(e)}
            className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="post-category">Category</Label>
                <Select
                  value={postCategory}
                  onValueChange={(val) => {
                    if (val) setPostCategory(val as SeedPost['category']);
                  }}
                >
                  <SelectTrigger id="post-category" className="w-full h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="post-club">Related Organization</Label>
                <Select
                  value={postOrgId}
                  onValueChange={(val) => {
                    if (val) setPostOrgId(val);
                  }}
                >
                  <SelectTrigger id="post-club" className="w-full h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commons">Fieldline Commons (General)</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="post-title">Headline</Label>
              <Input
                id="post-title"
                required
                minLength={SCHEMA_LIMITS.postTitle.min}
                maxLength={SCHEMA_LIMITS.postTitle.max}
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="e.g., Shenandoah ridge conditions & 2 carpool seats from DC"
                className="h-10 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="post-location">Trailhead or Region (optional)</Label>
              <Input
                id="post-location"
                maxLength={SCHEMA_LIMITS.location.max}
                value={postLocation}
                onChange={(e) => setPostLocation(e.target.value)}
                placeholder="e.g., Rockaway Beach, NY"
                className="h-10 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="post-body">Details</Label>
              <Textarea
                id="post-body"
                required
                rows={6}
                minLength={SCHEMA_LIMITS.postBody.min}
                maxLength={SCHEMA_LIMITS.postBody.max}
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Share trail notes, gear needed, pace, or how others can link up..."
                className="bg-background resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setComposerOpen(false)}
                className="h-10 px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingPost} className="h-10 px-5">
                {submittingPost ? 'Publishing...' : 'Publish Field Note'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Community Dispatches
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Field Feed
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Share trail conditions, coordinate carpools and loaner gear, recap club trips, and
            meet outdoor stewards across regions.
          </p>
        </div>

        <Button
          onClick={() => setComposerOpen(true)}
          className="h-10 px-5 whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <PenLine className="size-4" aria-hidden="true" />
          Write Field Note
        </Button>
      </div>

      {/* 70 / 30 Asymmetric Reading & Community Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Feed Scope & Category Filters */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary">
              {(
                [
                  { id: 'all', label: 'All Network' },
                  { id: 'clubs', label: `My Clubs (${myClubIdSet.size})` },
                  { id: 'following', label: `Following (${followingIdSet.size})` },
                ] as const
              ).map((scope) => (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => setFeedScope(scope.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    feedScope === scope.id
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['all', ...POST_CATEGORIES] as const).map((cat) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center space-y-3">
              <h3 className="font-serif text-xl font-medium text-foreground">
                No dispatches in this category yet.
              </h3>
              <p className="text-sm text-muted-foreground">
                Start the conversation with a trail condition update, gear share, or hello.
              </p>
              <Button onClick={() => setComposerOpen(true)}>Write Field Note</Button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post) => {
                const likes = postLikes.filter((l) => l.postId === post.id);
                const userLiked = Boolean(user && likes.some((l) => l.userId === user.uid));
                const comments = postComments.filter((c) => c.postId === post.id);
                const commentsOpen = Boolean(expandedComments[post.id]);
                const canDelete = Boolean(
                  user && post.source === 'community' && post.authorId === user.uid
                );

                return (
                  <article
                    key={post.id}
                    className="rounded-lg border border-border bg-card p-6 space-y-4"
                  >
                    {/* Unboxed Metadata Row with Org Emblem */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {post.orgId && orgById.has(post.orgId) ? (
                          <button
                            type="button"
                            onClick={() => onSelectOrg(post.orgId)}
                            className="inline-flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                          >
                            <OrgLogo
                              orgId={post.orgId}
                              name={post.orgName}
                              discipline={orgById.get(post.orgId)?.discipline}
                              size="xs"
                            />
                            <span className="font-medium text-foreground hover:text-primary transition-colors">
                              {post.orgName}
                            </span>
                          </button>
                        ) : (
                          <>
                            <OrgLogo
                              orgId={post.orgId || 'fieldline-commons'}
                              name={post.orgName}
                              discipline={orgById.get(post.orgId)?.discipline}
                              size="xs"
                            />
                            <span className="font-medium text-foreground">{post.orgName}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-primary">{post.category}</span>
                        {post.location && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{post.location}</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap shrink-0">
                        {post.timestampLabel}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onSelectPost(post.id)}
                        className="block text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </button>
                      <p className="text-sm leading-relaxed text-foreground/85 max-w-prose whitespace-pre-line">
                        {post.body}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        By <span className="font-medium text-foreground">{post.authorName}</span> ·{' '}
                        {post.authorRegion}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void togglePostLike(post.id)}
                          aria-pressed={userLiked}
                          className={`h-9 px-3 gap-1.5 text-xs font-mono tabular-nums ${
                            userLiked ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                          }`}
                        >
                          <Heart
                            className={`size-3.5 ${userLiked ? 'fill-current' : ''}`}
                            aria-hidden="true"
                          />
                          {likes.length}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="h-9 px-3 gap-1.5 text-xs font-mono tabular-nums text-muted-foreground"
                        >
                          <MessageSquare className="size-3.5" aria-hidden="true" />
                          {comments.length}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectPost(post.id)}
                          className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                        >
                          Open Thread
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Copy dispatch share link"
                          onClick={() => {
                            const permalink = `${window.location.origin}${window.location.pathname}#/feed/${encodeURIComponent(post.id)}`;
                            void copyShareLink('Dispatch link', permalink);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Share2 className="size-3.5" />
                        </Button>

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete post"
                            onClick={() => void deletePost(post.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Comments Thread */}
                    {commentsOpen && (
                      <div className="pt-4 border-t border-border space-y-4">
                        {comments.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No replies yet. Add trail beta, gear offers, or a quick note.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start justify-between gap-3 text-sm"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium text-foreground">
                                    {comment.authorName}
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {comment.body}
                                  </p>
                                </div>
                                {user && comment.authorId === user.uid && (
                                  <button
                                    type="button"
                                    onClick={() => void deleteComment(comment.id)}
                                    className="text-xs text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void handleReplySubmit(post.id);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            maxLength={SCHEMA_LIMITS.commentBody.max}
                            placeholder={
                              user ? 'Add a reply...' : 'Sign in to reply to this dispatch...'
                            }
                            className="h-9 bg-background"
                          />
                          <Button type="submit" size="sm" className="h-9 px-4 shrink-0">
                            Reply
                          </Button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Community Rail (30%) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Member Card / Sign-in Callout */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg font-medium text-foreground">
              {user ? 'Your Member Profile' : 'Join the Network'}
            </h2>
            {user && currentProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={currentProfile.photoURL}
                      alt={currentProfile.displayName}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentProfile.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentProfile.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentProfile.homeRegion}
                    </p>
                  </div>
                </div>
                {currentProfile.bio && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {currentProfile.bio}
                  </p>
                )}
                {currentProfile.disciplines.length > 0 && (
                  <p className="text-xs text-primary">
                    {currentProfile.disciplines.join(' · ')}
                  </p>
                )}
                <Button variant="outline" size="sm" onClick={onOpenProfile} className="w-full h-9">
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign in with Google to post trail reports, join club rosters, RSVP to outings,
                  and connect with members in your region.
                </p>
                <Button onClick={() => void signInWithGoogle()} className="w-full h-10">
                  Sign in with Google
                </Button>
              </div>
            )}
          </div>

          {/* Your Joined Clubs */}
          {user && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Your Joined Clubs ({myMemberships.length})
              </h3>
              {myMemberships.length === 0 ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join organizations in the Directory to see your home chapters listed here.
                </p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {myMemberships.map((m) => (
                    <li key={m.id} className="py-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectOrg(m.orgId)}
                        className="w-full flex items-center gap-2.5 text-left text-foreground font-medium hover:text-primary transition-colors cursor-pointer"
                      >
                        <OrgLogo
                          orgId={m.orgId}
                          name={m.orgName}
                          discipline={orgById.get(m.orgId)?.discipline}
                          size="xs"
                        />
                        <span className="truncate">{m.orgName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Community Members Directory */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Community Members ({profiles.length})
            </h3>
            {!user ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Member profiles appear here once you sign in to the network.
              </p>
            ) : profiles.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No public profiles loaded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {profiles.slice(0, 8).map((member, idx) => (
                  <div key={member.uid}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <button
                      type="button"
                      onClick={() => onSelectMember(member.uid)}
                      className="w-full text-left space-y-1 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {member.displayName}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {member.homeRegion}
                        </span>
                      </div>
                      {member.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{member.bio}</p>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
