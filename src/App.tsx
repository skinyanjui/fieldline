import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { CommunityProvider, useCommunity } from '@/src/context/CommunityContext';
import { TopBar, type ActiveTab } from '@/src/components/TopBar';
import { OfflineIndicator } from '@/src/components/OfflineIndicator';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';
import { DirectoryView } from '@/src/components/DirectoryView';
import { AtlasView } from '@/src/components/AtlasView';
import { FieldFeedView } from '@/src/components/FieldFeedView';
import { DispatchDetailPage } from '@/src/components/DispatchDetailPage';
import { OutingsView } from '@/src/components/OutingsView';
import { MembersView } from '@/src/components/MembersView';
import { ActivityView } from '@/src/components/ActivityView';
import { SubmitClubView } from '@/src/components/SubmitClubView';
import { OrganizationDetailPage } from '@/src/components/OrganizationDetailPage';
import { OrganizationEditPage } from '@/src/components/OrganizationEditPage';
import { OutingDetailPage } from '@/src/components/OutingDetailPage';
import { MemberDetailPage } from '@/src/components/MemberDetailPage';
import { ProfileEditPage } from '@/src/components/ProfileEditPage';
import type { DirectoryOrganization } from '@/src/data/seedOrganizations';
import { updateRouteSeo } from '@/src/lib/seoUtils';

type AppRoute =
  | { page: 'directory' }
  | { page: 'atlas' }
  | { page: 'org-detail'; orgId: string }
  | { page: 'org-edit'; orgId: string }
  | { page: 'feed' }
  | { page: 'post-detail'; postId: string }
  | { page: 'outings' }
  | { page: 'outing-detail'; outingId: string }
  | { page: 'members' }
  | { page: 'member-detail'; memberUid: string }
  | { page: 'activity' }
  | { page: 'submit' }
  | { page: 'profile-edit' };

function parseHashRoute(hash: string): AppRoute {
  const cleaned = hash.replace(/^#\/?/, '').trim();
  if (!cleaned || cleaned === 'directory') return { page: 'directory' };

  const parts = cleaned.split('/').map((part) => decodeURIComponent(part));
  if (parts[0] === 'atlas') return { page: 'atlas' };
  if (parts[0] === 'clubs' && parts[1] && parts[2] === 'edit') {
    return { page: 'org-edit', orgId: parts[1] };
  }
  if (parts[0] === 'clubs' && parts[1]) {
    return { page: 'org-detail', orgId: parts[1] };
  }
  if (parts[0] === 'feed' && parts[1]) {
    return { page: 'post-detail', postId: parts[1] };
  }
  if (parts[0] === 'outings' && parts[1]) {
    return { page: 'outing-detail', outingId: parts[1] };
  }
  if (parts[0] === 'members' && parts[1]) {
    return { page: 'member-detail', memberUid: parts[1] };
  }
  if (parts[0] === 'profile' && parts[1] === 'edit') {
    return { page: 'profile-edit' };
  }
  if (parts[0] === 'feed') return { page: 'feed' };
  if (parts[0] === 'outings') return { page: 'outings' };
  if (parts[0] === 'members') return { page: 'members' };
  if (parts[0] === 'activity') return { page: 'activity' };
  if (parts[0] === 'submit') return { page: 'submit' };

  return { page: 'directory' };
}

function serializeRoute(route: AppRoute): string {
  switch (route.page) {
    case 'directory':
      return '#/directory';
    case 'atlas':
      return '#/atlas';
    case 'org-detail':
      return `#/clubs/${encodeURIComponent(route.orgId)}`;
    case 'org-edit':
      return `#/clubs/${encodeURIComponent(route.orgId)}/edit`;
    case 'feed':
      return '#/feed';
    case 'post-detail':
      return `#/feed/${encodeURIComponent(route.postId)}`;
    case 'outings':
      return '#/outings';
    case 'outing-detail':
      return `#/outings/${encodeURIComponent(route.outingId)}`;
    case 'members':
      return '#/members';
    case 'member-detail':
      return `#/members/${encodeURIComponent(route.memberUid)}`;
    case 'activity':
      return '#/activity';
    case 'submit':
      return '#/submit';
    case 'profile-edit':
      return '#/profile/edit';
  }
}

function getActiveTabForRoute(route: AppRoute): ActiveTab {
  switch (route.page) {
    case 'directory':
    case 'org-detail':
    case 'org-edit':
      return 'directory';
    case 'atlas':
      return 'atlas';
    case 'feed':
    case 'post-detail':
      return 'feed';
    case 'outings':
    case 'outing-detail':
      return 'outings';
    case 'members':
    case 'member-detail':
    case 'profile-edit':
      return 'members';
    case 'activity':
      return 'activity';
    case 'submit':
      return 'submit';
  }
}

function FieldlineApp() {
  const { organizations, outings, posts, profiles } = useCommunity();
  const [route, setRoute] = useState<AppRoute>(() => parseHashRoute(window.location.hash));
  const [preselectedClubForPost, setPreselectedClubForPost] =
    useState<DirectoryOrganization | null>(null);
  const [preselectedClubForOuting, setPreselectedClubForOuting] =
    useState<DirectoryOrganization | null>(null);

  const navigate = useCallback((nextRoute: AppRoute) => {
    const nextHash = serializeRoute(nextRoute);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = canonicalUrl;
  }, []);

  // Synchronize document <title>, description, and Schema.org JSON-LD per active route
  useEffect(() => {
    switch (route.page) {
      case 'directory':
        updateRouteSeo({
          title: '',
          description:
            'Discover 42+ Black outdoor clubs, hiking groups, surf & ski crews, and land stewardship organizations. Join clubs, share trail notes, and RSVP to outings.',
          jsonLd: null,
        });
        break;
      case 'atlas':
        updateRouteSeo({
          title: 'Regional Chapter & Trailhead Atlas',
          description:
            'Explore Black outdoor clubs, local chapters, and scheduled group outings across U.S. regions and the global diaspora.',
          jsonLd: null,
        });
        break;
      case 'org-detail': {
        const org = organizations.find((o) => o.id === route.orgId);
        if (org) {
          updateRouteSeo({
            title: org.name,
            description: org.summary,
            jsonLd: {
              '@type': 'Organization',
              name: org.name,
              description: org.summary,
              url: org.website || window.location.href,
              foundingDate: org.founded,
              areaServed: org.location,
            },
          });
        }
        break;
      }
      case 'org-edit': {
        const org = organizations.find((o) => o.id === route.orgId);
        updateRouteSeo({
          title: org ? `Edit or Claim ${org.name}` : 'Edit Organization',
          description: 'Update chapter details or submit a verified stewardship update on Fieldline.',
          jsonLd: null,
        });
        break;
      }
      case 'feed':
        updateRouteSeo({
          title: 'Field Feed',
          description:
            'Community trail reports, carpool coordination, gear shares, and trip recaps across Black outdoor clubs.',
          jsonLd: null,
        });
        break;
      case 'post-detail': {
        const post = posts.find((p) => p.id === route.postId);
        if (post) {
          updateRouteSeo({
            title: post.title,
            description: post.body.slice(0, 160),
            jsonLd: {
              '@type': 'DiscussionForumPosting',
              headline: post.title,
              articleBody: post.body,
              author: {
                '@type': 'Person',
                name: post.authorName,
              },
              url: window.location.href,
            },
          });
        }
        break;
      }
      case 'outings':
        updateRouteSeo({
          title: 'Upcoming Group Outings',
          description:
            'RSVP to Black outdoor club hikes, dawn surf patrols, gravel rides, birding walks, and conservation workdays.',
          jsonLd: null,
        });
        break;
      case 'outing-detail': {
        const outing = outings.find((o) => o.id === route.outingId);
        if (outing) {
          updateRouteSeo({
            title: outing.title,
            description: `${outing.dateLabel} at ${outing.location}. ${outing.description}`,
            jsonLd: {
              '@type': 'Event',
              name: outing.title,
              description: outing.description,
              location: {
                '@type': 'Place',
                name: outing.location,
              },
              organizer: {
                '@type': 'Organization',
                name: outing.orgName,
              },
              url: window.location.href,
            },
          });
        }
        break;
      }
      case 'members':
        updateRouteSeo({
          title: 'Community Members',
          description: 'Connect with outdoor leaders, trail stewards, and club members across regions.',
          jsonLd: null,
        });
        break;
      case 'member-detail': {
        const member = profiles.find((p) => p.uid === route.memberUid);
        if (member) {
          updateRouteSeo({
            title: member.displayName,
            description: member.bio || `${member.displayName} in ${member.homeRegion} on Fieldline.`,
            jsonLd: {
              '@type': 'Person',
              name: member.displayName,
              description: member.bio,
              homeLocation: member.homeRegion,
            },
          });
        }
        break;
      }
      case 'activity':
        updateRouteSeo({
          title: 'Activity & Inbox',
          description: 'Recent replies, outing RSVPs, carpool claims, and directory stewardship updates.',
          jsonLd: null,
        });
        break;
      case 'submit':
        updateRouteSeo({
          title: 'Submit an Organization',
          description: 'Add a Black outdoor club, local trail chapter, or land stewardship collective to Fieldline.',
          jsonLd: null,
        });
        break;
      case 'profile-edit':
        updateRouteSeo({
          title: 'Edit Member Profile',
          description: 'Manage your Fieldline profile, home region, and outdoor disciplines.',
          jsonLd: null,
        });
        break;
    }
  }, [route, organizations, outings, posts, profiles]);

  const handleSelectTab = useCallback(
    (tab: ActiveTab) => {
      navigate({ page: tab });
    },
    [navigate]
  );

  const handleSelectOrg = useCallback(
    (orgId: string) => {
      navigate({ page: 'org-detail', orgId });
    },
    [navigate]
  );

  const handleEditOrg = useCallback(
    (orgId: string) => {
      navigate({ page: 'org-edit', orgId });
    },
    [navigate]
  );

  const handleSelectPost = useCallback(
    (postId: string) => {
      navigate({ page: 'post-detail', postId });
    },
    [navigate]
  );

  const handleSelectOuting = useCallback(
    (outingId: string) => {
      navigate({ page: 'outing-detail', outingId });
    },
    [navigate]
  );

  const handleSelectMember = useCallback(
    (memberUid: string) => {
      navigate({ page: 'member-detail', memberUid });
    },
    [navigate]
  );

  const handleOpenProfileEdit = useCallback(() => {
    navigate({ page: 'profile-edit' });
  }, [navigate]);

  const handleWriteNoteForClub = useCallback(
    (org: DirectoryOrganization) => {
      setPreselectedClubForPost(org);
      navigate({ page: 'feed' });
    },
    [navigate]
  );

  const handleHostOutingForClub = useCallback(
    (org: DirectoryOrganization) => {
      setPreselectedClubForOuting(org);
      navigate({ page: 'outings' });
    },
    [navigate]
  );

  const activeTab = getActiveTabForRoute(route);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenProfile={handleOpenProfileEdit}
        onViewMyProfile={handleSelectMember}
      />
      <OfflineIndicator />

      <main className="flex-1">
        {route.page === 'directory' && (
          <DirectoryView
            onSelectOrg={handleSelectOrg}
            onNavigateTab={handleSelectTab}
          />
        )}
        {route.page === 'atlas' && (
          <AtlasView
            onSelectOrg={handleSelectOrg}
            onSelectOuting={handleSelectOuting}
          />
        )}
        {route.page === 'org-detail' && (
          <OrganizationDetailPage
            orgId={route.orgId}
            onBack={() => handleSelectTab('directory')}
            onSelectOrg={handleSelectOrg}
            onSelectOuting={handleSelectOuting}
            onSelectPost={handleSelectPost}
            onSelectMember={handleSelectMember}
            onEditOrg={handleEditOrg}
            onWriteNoteForClub={handleWriteNoteForClub}
            onHostOutingForClub={handleHostOutingForClub}
          />
        )}
        {route.page === 'org-edit' && (
          <OrganizationEditPage
            orgId={route.orgId}
            onBack={() => handleSelectOrg(route.orgId)}
          />
        )}
        {route.page === 'feed' && (
          <FieldFeedView
            preselectedClub={preselectedClubForPost}
            onClearPreselectedClub={() => setPreselectedClubForPost(null)}
            onOpenProfile={handleOpenProfileEdit}
            onSelectOrg={handleSelectOrg}
            onSelectPost={handleSelectPost}
            onSelectMember={handleSelectMember}
          />
        )}
        {route.page === 'post-detail' && (
          <DispatchDetailPage
            postId={route.postId}
            onBack={() => handleSelectTab('feed')}
            onSelectOrg={handleSelectOrg}
            onSelectMember={handleSelectMember}
          />
        )}
        {route.page === 'outings' && (
          <OutingsView
            preselectedClub={preselectedClubForOuting}
            onClearPreselectedClub={() => setPreselectedClubForOuting(null)}
            onSelectOuting={handleSelectOuting}
            onSelectOrg={handleSelectOrg}
          />
        )}
        {route.page === 'outing-detail' && (
          <OutingDetailPage
            outingId={route.outingId}
            onBack={() => handleSelectTab('outings')}
            onSelectOrg={handleSelectOrg}
            onSelectMember={handleSelectMember}
          />
        )}
        {route.page === 'members' && (
          <MembersView
            onOpenProfile={handleOpenProfileEdit}
            onSelectMember={handleSelectMember}
          />
        )}
        {route.page === 'member-detail' && (
          <MemberDetailPage
            memberUid={route.memberUid}
            onBack={() => handleSelectTab('members')}
            onSelectOrg={handleSelectOrg}
            onSelectOuting={handleSelectOuting}
            onSelectPost={handleSelectPost}
            onEditProfile={handleOpenProfileEdit}
          />
        )}
        {route.page === 'activity' && (
          <ActivityView
            onSelectOrg={handleSelectOrg}
            onSelectOuting={handleSelectOuting}
            onSelectPost={handleSelectPost}
            onSelectMember={handleSelectMember}
          />
        )}
        {route.page === 'submit' && (
          <SubmitClubView onSuccessNavigate={() => handleSelectTab('directory')} />
        )}
        {route.page === 'profile-edit' && (
          <ProfileEditPage onBack={() => handleSelectTab('members')} />
        )}
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-[1280px] px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            <span className="font-serif text-sm font-medium text-foreground">Fieldline</span> ·
            Directory &amp; community network for Black outdoor clubs and land stewardship
            collectives.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleSelectTab('directory')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Directory
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('atlas')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Atlas
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('feed')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Field Feed
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('outings')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Outings
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('members')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Members
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('activity')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Activity
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('submit')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Submit Club
            </button>
            <a
              href="/lamd.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-foreground transition-colors"
            >
              lamd.txt
            </a>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-foreground transition-colors"
            >
              llms.txt
            </a>
            <PWAInstallButton compact />
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CommunityProvider>
        <FieldlineApp />
      </CommunityProvider>
    </ErrorBoundary>
  );
}
