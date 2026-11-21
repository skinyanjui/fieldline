import { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  CalendarPlus,
  Check,
  PenLine,
  Plus,
  Share2,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EditorialImage } from '@/src/components/EditorialImage';
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import type { DirectoryOrganization } from '@/src/data/seedOrganizations';
import { getOrganizationAccessTags } from '@/src/lib/accessTags';
import { copyShareLink } from '@/src/lib/seoUtils';
import { isSafeExternalUrl } from '@/src/lib/validation';

interface OrganizationDetailPageProps {
  orgId: string;
  onBack: () => void;
  onSelectOrg: (orgId: string) => void;
  onSelectOuting: (outingId: string) => void;
  onSelectPost: (postId: string) => void;
  onSelectMember: (uid: string) => void;
  onEditOrg: (orgId: string) => void;
  onWriteNoteForClub: (org: DirectoryOrganization) => void;
  onHostOutingForClub: (org: DirectoryOrganization) => void;
}

export function OrganizationDetailPage({
  orgId,
  onBack,
  onSelectOrg,
  onSelectOuting,
  onSelectPost,
  onSelectMember,
  onEditOrg,
  onWriteNoteForClub,
  onHostOutingForClub,
}: OrganizationDetailPageProps) {
  const {
    user,
    isAdmin,
    organizations,
    memberships,
    bookmarks,
    outings,
    posts,
    toggleClubMembership,
    toggleClubBookmark,
    deleteOrganization,
  } = useCommunity();

  const org = useMemo(
    () => organizations.find((o) => o.id === orgId) || null,
    [organizations, orgId]
  );

  const orgMembers = useMemo(
    () => memberships.filter((m) => m.orgId === orgId),
    [memberships, orgId]
  );

  const isJoined = useMemo(
    () => Boolean(user && orgMembers.some((m) => m.userId === user.uid)),
    [user, orgMembers]
  );

  const isSaved = useMemo(
    () => Boolean(user && bookmarks.some((b) => b.orgId === orgId)),
    [user, bookmarks, orgId]
  );

  const accessTags = useMemo(() => (org ? getOrganizationAccessTags(org) : []), [org]);

  const canDirectEdit = Boolean(
    user && org && ((org.source === 'community' && org.authorId === user.uid) || isAdmin)
  );

  const orgOutings = useMemo(
    () => outings.filter((o) => o.orgId === orgId),
    [outings, orgId]
  );

  const orgPosts = useMemo(
    () => posts.filter((p) => p.orgId === orgId),
    [posts, orgId]
  );

  const relatedOrgs = useMemo(() => {
    if (!org) return [];
    return organizations
      .filter(
        (candidate) =>
          candidate.id !== org.id &&
          (candidate.discipline === org.discipline || candidate.region === org.region)
      )
      .slice(0, 3);
  }, [organizations, org]);

  if (!org) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Directory
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3 max-w-xl">
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Organization not found.
          </h1>
          <p className="text-sm text-muted-foreground">
            This listing may have been removed or moved. Return to the directory to browse all
            indexed clubs.
          </p>
          <div className="pt-2">
            <Button onClick={onBack}>Return to Directory</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[1280px] px-6 py-8 md:py-12 space-y-10 pb-20">
      {/* Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Directory
        </button>
        <span className="text-xs font-mono text-muted-foreground">
          {org.discipline} / {org.region}
        </span>
      </div>

      {/* Editorial Full-Width Hero Header */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pb-10 border-b border-border">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <OrgLogo
                orgId={org.id}
                name={org.name}
                discipline={org.discipline}
                size="lg"
                className="mt-1"
              />
              <div className="space-y-2 min-w-0">
                <p className="text-xs font-medium text-primary">
                  {org.discipline} · {org.orgType} · Est. {org.founded}
                </p>
                <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.08]">
                  {org.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {org.location} · {org.chapterCount}
                </p>
                {accessTags.length > 0 && (
                  <p className="text-xs text-muted-foreground pt-0.5">
                    Access &amp; Welcome:{' '}
                    <span className="text-foreground">{accessTags.join(' · ')}</span>
                  </p>
                )}
              </div>
            </div>

            <p className="text-base leading-relaxed text-foreground/85 max-w-prose">
              {org.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Button
              variant={isJoined ? 'secondary' : 'default'}
              size="lg"
              onClick={() => void toggleClubMembership(org)}
              className="h-10 px-5 whitespace-nowrap shrink-0"
            >
              {isJoined ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Joined Club
                </>
              ) : (
                <>
                  <Plus className="size-4" aria-hidden="true" />
                  Join Club Network
                </>
              )}
            </Button>

            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              onClick={() => void toggleClubBookmark(org)}
              aria-pressed={isSaved}
              className="h-10 px-4 whitespace-nowrap shrink-0"
            >
              <Bookmark
                className={`size-4 ${isSaved ? 'fill-current text-primary' : ''}`}
                aria-hidden="true"
              />
              {isSaved ? 'Saved' : 'Save Club'}
            </Button>

            <Button
              variant="outline"
              onClick={() => onWriteNoteForClub(org)}
              className="h-10 px-4 whitespace-nowrap shrink-0"
            >
              <PenLine className="size-4" aria-hidden="true" />
              Write Field Note
            </Button>

            <Button
              variant="outline"
              onClick={() => onHostOutingForClub(org)}
              className="h-10 px-4 whitespace-nowrap shrink-0"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Host Outing
            </Button>

            <Button
              variant="ghost"
              onClick={() => void copyShareLink('Club link')}
              className="h-10 px-3.5 text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
            >
              <Share2 className="size-4" aria-hidden="true" />
              Share
            </Button>

            <Button
              variant="ghost"
              onClick={() => onEditOrg(org.id)}
              className="h-10 px-3.5 text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              {canDirectEdit ? 'Edit Listing' : 'Claim / Suggest Edit'}
            </Button>

            {org.source === 'community' && user && (org.authorId === user.uid || isAdmin) && (
              <Button
                variant="destructive"
                onClick={async () => {
                  await deleteOrganization(org.id);
                  onBack();
                }}
                className="h-10 px-4 whitespace-nowrap shrink-0"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove Listing
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 min-h-[240px] lg:min-h-[300px] overflow-hidden rounded-lg border border-border bg-secondary">
            <EditorialImage
              src={org.imageUrl}
              alt={org.name}
              title={org.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* 70 / 30 Asymmetric Detail Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Editorial Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* Programs & Focus */}
          {org.highlights.length > 0 && (
            <section className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                01. Programs &amp; Community Focus
              </p>
              <div className="rounded-lg border border-border bg-card p-6">
                <ul className="divide-y divide-border text-sm text-foreground">
                  {org.highlights.map((item) => (
                    <li key={item} className="py-3 first:pt-0 last:pb-0 leading-relaxed">
                      — {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Upcoming Outings for this Club */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  02. Trailhead Calendar
                </p>
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Upcoming Outings ({orgOutings.length})
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => onHostOutingForClub(org)}>
                Host Outing
              </Button>
            </div>

            {orgOutings.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                No upcoming outings are currently scheduled for {org.name}. Members can post a
                local meetup or trailhead gathering anytime.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orgOutings.map((outing) => (
                  <button
                    key={outing.id}
                    type="button"
                    onClick={() => onSelectOuting(outing.id)}
                    className="text-left rounded-lg border border-border bg-card p-5 space-y-2 hover:border-foreground/30 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-mono text-primary font-medium">
                      {outing.dateLabel}
                    </p>
                    <h3 className="font-serif text-lg font-medium text-foreground leading-snug">
                      {outing.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {outing.location} · {outing.difficulty}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Field Dispatches linked to this Club */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  03. Field Feed Dispatches
                </p>
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Recent Field Notes ({orgPosts.length})
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => onWriteNoteForClub(org)}>
                Write Field Note
              </Button>
            </div>

            {orgPosts.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                No trail reports or carpool notes have been posted for {org.name} yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orgPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => onSelectPost(post.id)}
                    className="w-full text-left rounded-lg border border-border bg-card p-6 space-y-2.5 hover:border-foreground/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-primary">{post.category}</span> ·{' '}
                        {post.authorName}
                        {post.location ? ` · ${post.location}` : ''}
                      </span>
                      <span className="font-mono">{post.timestampLabel}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-prose line-clamp-3">
                      {post.body}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Accession Metadata & Roster Rail */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Accession Facts Card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Organization Record
            </h2>
            <dl className="divide-y divide-border text-sm">
              <div className="py-3 first:pt-0 grid grid-cols-3 gap-3">
                <dt className="text-muted-foreground">Discipline</dt>
                <dd className="col-span-2 font-medium text-foreground">{org.discipline}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-3">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="col-span-2 text-foreground">{org.orgType}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-3">
                <dt className="text-muted-foreground">Region</dt>
                <dd className="col-span-2 text-foreground">{org.region}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-3">
                <dt className="text-muted-foreground">Base</dt>
                <dd className="col-span-2 text-foreground">{org.location}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-3">
                <dt className="text-muted-foreground">Founded</dt>
                <dd className="col-span-2 font-mono tabular-nums text-foreground">
                  {org.founded}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-3">
                <dt className="text-muted-foreground">Footprint</dt>
                <dd className="col-span-2 text-foreground">{org.chapterCount}</dd>
              </div>
              {accessTags.length > 0 && (
                <div className="py-3 grid grid-cols-3 gap-3">
                  <dt className="text-muted-foreground">Access</dt>
                  <dd className="col-span-2 text-foreground">{accessTags.join(' · ')}</dd>
                </div>
              )}
              {org.website && isSafeExternalUrl(org.website) && (
                <div className="py-3 grid grid-cols-3 gap-3">
                  <dt className="text-muted-foreground">Website</dt>
                  <dd className="col-span-2">
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4 break-all"
                    >
                      {org.website.replace(/^https?:\/\//, '')}
                      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  </dd>
                </div>
              )}
              {org.instagram && (
                <div className="py-3 last:pb-0 grid grid-cols-3 gap-3">
                  <dt className="text-muted-foreground">Social</dt>
                  <dd className="col-span-2 font-mono text-xs text-foreground">{org.instagram}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Fieldline Member Roster */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              Fieldline Members ({orgMembers.length})
            </h2>
            {orgMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                No Fieldline members on this roster yet. Join to connect with others exploring this
                organization.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {orgMembers.map((member) => (
                  <li key={member.id} className="py-2.5 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => onSelectMember(member.userId)}
                      className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {member.userName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Related Organizations */}
          {relatedOrgs.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Related Organizations
              </h2>
              <div className="space-y-4">
                {relatedOrgs.map((related, idx) => (
                  <div key={related.id}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <button
                      type="button"
                      onClick={() => onSelectOrg(related.id)}
                      className="w-full text-left flex items-center gap-3 group cursor-pointer"
                    >
                      <OrgLogo
                        orgId={related.id}
                        name={related.name}
                        discipline={related.discipline}
                        size="sm"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-serif text-base font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {related.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {related.discipline} · {related.region}
                        </p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
