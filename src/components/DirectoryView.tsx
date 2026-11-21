import { useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  Download,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditorialImage } from '@/src/components/EditorialImage';
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import {
  DISCIPLINES,
  EDITORIAL_IMAGES,
  ORG_TYPES,
  REGIONS,
  type Discipline,
} from '@/src/data/seedOrganizations';
import { ACCESS_TAGS, getOrganizationAccessTags, type AccessTag } from '@/src/lib/accessTags';
import { downloadOrganizationsCsv } from '@/src/lib/exportUtils';

interface DirectoryViewProps {
  onSelectOrg: (orgId: string) => void;
  onNavigateTab: (tab: 'atlas' | 'feed' | 'outings' | 'members' | 'activity' | 'submit') => void;
}

const SPOTLIGHTS: {
  discipline: Discipline;
  title: string;
  caption: string;
  imageUrl: string;
}[] = [
  {
    discipline: 'Hiking & Camping',
    title: 'Trails & Basecamps',
    caption: 'National hiking chapters, overlanding crews, and welcoming campgrounds.',
    imageUrl: EDITORIAL_IMAGES.camping,
  },
  {
    discipline: 'Climbing & Snow',
    title: 'Crags & Alpine Summits',
    caption: 'Rock climbing collectives, mountaineering mentorship, and ski summits.',
    imageUrl: EDITORIAL_IMAGES.climbing,
  },
  {
    discipline: 'Water, Surf & Dive',
    title: 'Coastlines & Deep Water',
    caption: 'Surf lineups, scuba archaeology, sailing flotillas, and marine science.',
    imageUrl: EDITORIAL_IMAGES.water,
  },
  {
    discipline: 'Cycling & Running',
    title: 'Pelotons & Singletrack',
    caption: 'No-drop cycling chapters, gravel crews, mountain bikers, and run clubs.',
    imageUrl: EDITORIAL_IMAGES.cycling,
  },
];

export function DirectoryView({
  onSelectOrg,
  onNavigateTab,
}: DirectoryViewProps) {
  const {
    user,
    organizations,
    memberships,
    bookmarks,
    outings,
    toggleClubMembership,
    toggleClubBookmark,
    signInWithGoogle,
  } = useCommunity();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [selectedAccessTag, setSelectedAccessTag] = useState<'all' | AccessTag>('all');
  const [viewFilter, setViewFilter] = useState<'all' | 'joined' | 'saved' | 'community'>('all');

  const directorySectionRef = useRef<HTMLElement | null>(null);

  const joinedOrgIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(memberships.filter((m) => m.userId === user.uid).map((m) => m.orgId));
  }, [memberships, user]);

  const savedOrgIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(bookmarks.map((b) => b.orgId));
  }, [bookmarks, user]);

  const memberCountByOrg = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of memberships) {
      counts.set(m.orgId, (counts.get(m.orgId) || 0) + 1);
    }
    return counts;
  }, [memberships]);

  const regionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of REGIONS) {
      map.set(r, organizations.filter((o) => o.region === r).length);
    }
    return map;
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return organizations.filter((org) => {
      if (viewFilter === 'joined' && !joinedOrgIds.has(org.id)) return false;
      if (viewFilter === 'saved' && !savedOrgIds.has(org.id)) return false;
      if (viewFilter === 'community' && org.source !== 'community') return false;
      if (selectedDiscipline !== 'all' && org.discipline !== selectedDiscipline) return false;
      if (selectedRegion !== 'all' && org.region !== selectedRegion) return false;
      if (selectedOrgType !== 'all' && org.orgType !== selectedOrgType) return false;
      if (selectedAccessTag !== 'all' && !getOrganizationAccessTags(org).includes(selectedAccessTag)) {
        return false;
      }
      if (q) {
        const haystack = [
          org.name,
          org.location,
          org.discipline,
          org.orgType,
          org.region,
          org.chapterCount,
          org.instagram,
          org.summary,
          ...org.highlights,
          ...getOrganizationAccessTags(org),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [
    organizations,
    searchQuery,
    selectedDiscipline,
    selectedRegion,
    selectedOrgType,
    selectedAccessTag,
    viewFilter,
    joinedOrgIds,
    savedOrgIds,
  ]);

  const scrollToDirectory = () => {
    directorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToDirectory();
  };

  const handleSpotlightSelect = (discipline: Discipline) => {
    setSelectedDiscipline(discipline);
    setViewFilter('all');
    scrollToDirectory();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDiscipline('all');
    setSelectedRegion('all');
    setSelectedOrgType('all');
    setSelectedAccessTag('all');
    setViewFilter('all');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDiscipline !== 'all' ||
    selectedRegion !== 'all' ||
    selectedOrgType !== 'all' ||
    selectedAccessTag !== 'all' ||
    viewFilter !== 'all';

  return (
    <div className="space-y-16 pb-20">
      {/* Editorial Marquee Hero (2-column items-stretch split) */}
      <section className="mx-auto max-w-[1280px] px-6 pt-10 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2 space-y-7">
            <div className="space-y-5">
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
                Fieldline Index · U.S. &amp; Diaspora
              </p>
              <h1 className="font-serif text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.08] font-medium tracking-tight text-foreground">
                Where Black outdoor clubs, land stewards, and trail crews gather.
              </h1>
              <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
                A living directory and member network mapping Black-led hiking chapters, ski
                brotherhoods, dive clubs, surf collectives, cycling crews, and environmental
                stewardship organizations—built to help you find your local trailhead and go
                outside together.
              </p>
            </div>

            {/* Prominent Quick-Filter Search Bar right in Hero */}
            <div className="space-y-4 pt-1">
              <form
                onSubmit={handleHeroSearchSubmit}
                role="search"
                aria-label="Filter outdoor clubs"
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clubs by name, city, or activity (e.g., surf, Atlanta, ski)..."
                    aria-label="Search clubs by name, location, or activity type"
                    className="h-11 pl-10 pr-9 bg-card border-border text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 px-5 rounded-md text-sm font-medium whitespace-nowrap shrink-0"
                >
                  {searchQuery.trim()
                    ? `Show ${filteredOrganizations.length} Matches`
                    : `Browse ${organizations.length} Clubs`}
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {user ? (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('feed')}
                    className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open Field Feed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Sign in to join clubs &amp; RSVP
                  </button>
                )}
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('atlas')}
                  className="hover:text-foreground transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Explore Regional Atlas
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('outings')}
                  className="hover:text-foreground transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View {outings.length} upcoming outings
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="relative flex-1 min-h-[280px] lg:min-h-[420px] overflow-hidden rounded-lg border border-border bg-secondary">
              <EditorialImage
                src={EDITORIAL_IMAGES.hero}
                alt="Group of Black hikers walking together along a mountain ridge at sunrise"
                title="Fieldline Collective"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5">
                <p className="text-xs text-white/90 font-sans">
                  Ridge traverse at sunrise · Community trailhead archive
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Operational Index Ribbon */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border-y border-border divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="py-5 pr-6">
            <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
              {organizations.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified &amp; Community Organizations
            </p>
          </div>
          <div className="py-5 pl-4 lg:px-6">
            <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
              {DISCIPLINES.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Outdoor &amp; Stewardship Disciplines
            </p>
          </div>
          <div className="py-5 pr-6 lg:px-6">
            <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
              {outings.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Upcoming Group Outings</p>
          </div>
          <div className="py-5 pl-4 lg:pl-6">
            <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
              {memberships.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Active Club Memberships</p>
          </div>
        </div>
      </section>

      {/* Editorial Discipline Spotlights */}
      <section className="mx-auto max-w-[1280px] px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              01. Curated Disciplines
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
              Browse by terrain and craft
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('submit')}
            className="text-sm font-medium text-primary hover:underline underline-offset-4 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Missing a local chapter? Submit it
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPOTLIGHTS.map((item) => {
            const count = organizations.filter((o) => o.discipline === item.discipline).length;
            const isSelected = selectedDiscipline === item.discipline;
            return (
              <button
                key={item.discipline}
                type="button"
                onClick={() => handleSpotlightSelect(item.discipline)}
                className={`group text-left flex flex-col rounded-lg border transition-colors duration-200 overflow-hidden bg-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected ? 'border-primary' : 'border-border hover:border-foreground/30'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
                  <EditorialImage
                    src={item.imageUrl}
                    alt={item.title}
                    title={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-mono tabular-nums text-muted-foreground">
                      {count} {count === 1 ? 'group' : 'groups'}
                    </p>
                    <h3 className="font-serif text-lg font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Directory Explorer */}
      <section
        ref={directorySectionRef}
        id="directory-index"
        className="mx-auto max-w-[1280px] px-6 space-y-6 scroll-mt-20"
      >
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                02. Organization Index
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                Clubs, collectives &amp; adjacent organizations
              </h2>
            </div>

            {/* Interactive Segmented Filter Tabs */}
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary self-start md:self-auto overflow-x-auto max-w-full">
              {(
                [
                  { id: 'all', label: 'All Listed' },
                  { id: 'joined', label: `Joined (${joinedOrgIds.size})` },
                  { id: 'saved', label: `Saved (${savedOrgIds.size})` },
                  { id: 'community', label: 'Community Added' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewFilter === tab.id
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Regional Coverage Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedRegion === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All Regions ({organizations.length})
            </button>
            {REGIONS.map((region) => {
              const count = regionCounts.get(region) || 0;
              const isSelected = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(isSelected ? 'all' : region)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {region} <span className="font-mono tabular-nums opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Inclusivity & Access Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground pr-1 whitespace-nowrap shrink-0">
              Access:
            </span>
            <button
              type="button"
              onClick={() => setSelectedAccessTag('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedAccessTag === 'all'
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Any Access
            </button>
            {ACCESS_TAGS.map((tag) => {
              const active = selectedAccessTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedAccessTag(active ? 'all' : tag)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Search & Dropdown Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            <div className="md:col-span-5 relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by club name, location, or activity type..."
                aria-label="Filter organizations by name, location, or activity type"
                className="h-10 pl-9 pr-9 bg-card border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear directory search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <Select
                value={selectedDiscipline}
                onValueChange={(val) => {
                  if (val) setSelectedDiscipline(val);
                }}
              >
                <SelectTrigger className="w-full h-10 bg-card border-border">
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  {DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select
                value={selectedOrgType}
                onValueChange={(val) => {
                  if (val) setSelectedOrgType(val);
                }}
              >
                <SelectTrigger className="w-full h-10 bg-card border-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ORG_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadOrganizationsCsv(filteredOrganizations)}
                disabled={filteredOrganizations.length === 0}
                className="w-full h-10 bg-card border-border text-xs font-medium whitespace-nowrap"
              >
                <Download className="size-3.5" aria-hidden="true" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="font-mono tabular-nums">
              Showing {filteredOrganizations.length} of {organizations.length} organizations
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Cards Grid */}
        {filteredOrganizations.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3">
            <h3 className="font-serif text-xl font-medium text-foreground">
              No organizations match those filters.
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {viewFilter === 'joined'
                ? 'You have not joined any clubs yet. Browse the index and join chapters to build your home roster.'
                : viewFilter === 'saved'
                  ? 'You have not saved any clubs yet. Click the bookmark icon on any club card to keep a personal shortlist.'
                  : 'Try broadening your search, region, access, or activity filter, or submit a chapter that should be listed here.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
              <Button onClick={() => onNavigateTab('submit')}>Submit a Club</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => {
              const isJoined = joinedOrgIds.has(org.id);
              const isSaved = savedOrgIds.has(org.id);
              const memberCount = memberCountByOrg.get(org.id) || 0;
              const accessTags = getOrganizationAccessTags(org);

              return (
                <article
                  key={org.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors duration-200 hover:border-foreground/30"
                >
                  <div className="space-y-3.5">
                    {/* Organization Logo + Title Lockup */}
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => onSelectOrg(org.id)}
                        aria-label={`View ${org.name} details`}
                        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                      >
                        <OrgLogo
                          orgId={org.id}
                          name={org.name}
                          discipline={org.discipline}
                          size="md"
                        />
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Unboxed clean metadata kicker (Zero-Pill Discipline) */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="font-medium text-primary">{org.discipline}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">Est. {org.founded}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectOrg(org.id)}
                          className="block text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          <h3 className="font-serif text-xl font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                            {org.name}
                          </h3>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => void toggleClubBookmark(org)}
                        aria-pressed={isSaved}
                        aria-label={isSaved ? `Remove ${org.name} from saved clubs` : `Save ${org.name}`}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                          isSaved
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Bookmark
                          className={`size-4 ${isSaved ? 'fill-current' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {org.orgType} · {org.region} · {org.location}
                    </p>

                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {org.summary}
                    </p>

                    {accessTags.length > 0 && (
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {accessTags.slice(0, 3).join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground truncate">
                      <span className="font-mono tabular-nums">{memberCount}</span>{' '}
                      {memberCount === 1 ? 'member' : 'members'}
                      {org.source === 'community' && ' · Community'}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectOrg(org.id)}
                        className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                      >
                        Details
                      </Button>
                      <Button
                        variant={isJoined ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => void toggleClubMembership(org)}
                        className="h-9 px-3.5 text-xs font-medium whitespace-nowrap shrink-0"
                      >
                        {isJoined ? (
                          <>
                            <Check className="size-3.5" aria-hidden="true" />
                            Joined
                          </>
                        ) : (
                          <>
                            <Plus className="size-3.5" aria-hidden="true" />
                            Join
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
