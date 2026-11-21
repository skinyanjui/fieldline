import { useMemo, useState } from 'react';
import { ArrowLeft, Heart, Link2, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import { copyShareLink } from '@/src/lib/seoUtils';
import { SCHEMA_LIMITS } from '@/src/lib/validation';

interface DispatchDetailPageProps {
  postId: string;
  onBack: () => void;
  onSelectOrg: (orgId: string) => void;
  onSelectMember: (uid: string) => void;
}

export function DispatchDetailPage({
  postId,
  onBack,
  onSelectOrg,
  onSelectMember,
}: DispatchDetailPageProps) {
  const {
    user,
    organizations,
    profiles,
    posts,
    postLikes,
    postComments,
    togglePostLike,
    addComment,
    deleteComment,
    deletePost,
  } = useCommunity();

  const [replyDraft, setReplyDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const post = useMemo(() => posts.find((p) => p.id === postId) || null, [posts, postId]);

  const relatedOrg = useMemo(() => {
    if (!post?.orgId) return null;
    return organizations.find((o) => o.id === post.orgId) || null;
  }, [organizations, post]);

  const likes = useMemo(
    () => postLikes.filter((l) => l.postId === postId),
    [postLikes, postId]
  );

  const comments = useMemo(
    () => postComments.filter((c) => c.postId === postId),
    [postComments, postId]
  );

  const authorProfileExists = useMemo(() => {
    if (!post?.authorId) return false;
    return profiles.some((p) => p.uid === post.authorId);
  }, [profiles, post]);

  if (!post) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Field Feed
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3 max-w-xl">
          <h1 className="font-serif text-2xl font-medium text-foreground">Dispatch not found.</h1>
          <p className="text-sm text-muted-foreground">
            This field note may have been deleted or moved.
          </p>
          <Button onClick={onBack}>Return to Field Feed</Button>
        </div>
      </div>
    );
  }

  const userLiked = Boolean(user && likes.some((l) => l.userId === user.uid));
  const canDelete = Boolean(user && post.source === 'community' && post.authorId === user.uid);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    setSubmitting(true);
    try {
      const ok = await addComment(post.id, replyDraft);
      if (ok) setReplyDraft('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-10 space-y-8">
      {/* Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Field Feed
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void copyShareLink('Dispatch link')}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <Link2 className="size-3.5" aria-hidden="true" />
            Copy Share Link
          </Button>
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await deletePost(post.id);
                onBack();
              }}
              className="h-9 px-3 text-xs gap-1.5"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <article className="lg:col-span-8 space-y-8">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                {relatedOrg ? (
                  <button
                    type="button"
                    onClick={() => onSelectOrg(relatedOrg.id)}
                    className="inline-flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                  >
                    <OrgLogo
                      orgId={relatedOrg.id}
                      name={relatedOrg.name}
                      discipline={relatedOrg.discipline}
                      size="xs"
                    />
                    <span className="font-medium text-foreground hover:text-primary transition-colors">
                      {relatedOrg.name}
                    </span>
                  </button>
                ) : (
                  <>
                    <OrgLogo
                      orgId={post.orgId || 'fieldline-commons'}
                      name={post.orgName}
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
              <span className="text-xs font-mono text-muted-foreground">{post.timestampLabel}</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground leading-tight">
                {post.title}
              </h1>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-line max-w-prose">
                {post.body}
              </p>
            </div>

            <div className="pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                By{' '}
                {authorProfileExists ? (
                  <button
                    type="button"
                    onClick={() => onSelectMember(post.authorId)}
                    className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline cursor-pointer"
                  >
                    {post.authorName}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{post.authorName}</span>
                )}{' '}
                · {post.authorRegion}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={userLiked ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => void togglePostLike(post.id)}
                  aria-pressed={userLiked}
                  className="h-9 px-3.5 gap-1.5 font-mono tabular-nums text-xs"
                >
                  <Heart
                    className={`size-3.5 ${userLiked ? 'fill-current text-primary' : ''}`}
                    aria-hidden="true"
                  />
                  {likes.length} {likes.length === 1 ? 'Appreciation' : 'Appreciations'}
                </Button>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-muted-foreground px-2">
                  <MessageSquare className="size-3.5" aria-hidden="true" />
                  {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            </div>
          </div>

          {/* Full Threaded Discussion */}
          <section className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Trailhead Replies ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No replies yet. Add trail conditions, carpool timing, or loaner gear notes below.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => onSelectMember(comment.authorId)}
                        className="text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {comment.authorName}
                      </button>
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
              onSubmit={(e) => void handleSubmitReply(e)}
              className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <Input
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                maxLength={SCHEMA_LIMITS.commentBody.max}
                placeholder={
                  user ? 'Add a reply to this dispatch...' : 'Sign in to reply to this dispatch...'
                }
                className="h-10 bg-background flex-1"
              />
              <Button type="submit" disabled={submitting} className="h-10 px-5 shrink-0">
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </form>
          </section>
        </article>

        {/* Right Context Rail */}
        <aside className="lg:col-span-4 space-y-6">
          {relatedOrg && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Affiliated Organization
              </p>
              <div className="flex items-start gap-3">
                <OrgLogo
                  orgId={relatedOrg.id}
                  name={relatedOrg.name}
                  discipline={relatedOrg.discipline}
                  size="sm"
                />
                <div className="min-w-0">
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {relatedOrg.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {relatedOrg.region} · {relatedOrg.location}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {relatedOrg.summary}
              </p>
              <Button
                variant="outline"
                onClick={() => onSelectOrg(relatedOrg.id)}
                className="w-full h-9 text-xs"
              >
                Open Organization Page
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
