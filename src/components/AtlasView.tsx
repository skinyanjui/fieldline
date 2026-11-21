import { useMemo, useState } from 'react';
import { Calendar, Compass, MapPin, Plus, Check, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import { DISCIPLINES, type Region } from '@/src/data/seedOrganizations';
import {
  ACCESS_TAGS,
  getOrganizationAccessTags,
  REGION_ATLAS_HUBS,
  type AccessTag,
} from '@/src/lib/accessTags';

interface AtlasViewProps {
  onSelectOrg: (orgId: string) => void;
  onSelectOuting: (outingId: string) => void;
}

export function AtlasView({ onSelectOrg, onSelectOuting }: AtlasViewProps) {
  const {
    user,
    organizations,
    outings,
    memberships,
    bookmarks,
    toggleClubMembership,
    toggleClubBookmark,
  } = useCommunity();

  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<AccessTag | 'all'>('all');

  const joinedOrgIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(memberships.filter((m) => m.userId === user.uid).map((m) => m.orgId));
  }, [memberships, user]);

  const bookmarkedOrgIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(bookmarks.filter((b) => b.userId === user.uid).map((b) => b.orgId));
  }, [bookmarks, user]);

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      if (selectedRegion !== 'all' && org.region !== selectedRegion) return false;
      if (disciplineFilter !== 'all' && org.discipline !== disciplineFilter) return false;
      if (accessFilter !== 'all' && !getOrganizationAccessTags(org).includes(accessFilter)) {
        return false;
      }
      return true;
    });
  }, [organizations, selectedRegion, disciplineFilter, accessFilter]);

  const filteredOutings = useMemo(() => {
    return outings.filter((o) => {
      if (selectedRegion !== 'all' && o.region !== selectedRegion) return false;
      if (disciplineFilter !== 'all' && o.discipline !== disciplineFilter) return false;
      return true;
    });
  }, [outings, selectedRegion, disciplineFilter]);

  const countsByRegion = useMemo(() => {
    const map = new Map<Region, { orgs: number; outings: number }>();
    for (const hub of REGION_ATLAS_HUBS) {
      const orgCount = organizations.filter((o) => {
        if (o.region !== hub.region) return false;
        if (disciplineFilter !== 'all' && o.discipline !== disciplineFilter) return false;
        if (accessFilter !== 'all' && !getOrganizationAccessTags(o).includes(accessFilter)) {
          return false;
        }
        return true;
      }).length;
      const outingCount = outings.filter((o) => {
        if (o.region !== hub.region) return false;
        if (disciplineFilter !== 'all' && o.discipline !== disciplineFilter) return false;
        return true;
      }).length;
      map.set(hub.region, { orgs: orgCount, outings: outingCount });
    }
    return map;
  }, [organizations, outings, disciplineFilter, accessFilter]);

  const activeHub = REGION_ATLAS_HUBS.find((h) => h.region === selectedRegion) || null;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Regional Cartography
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Regional Trailhead &amp; Chapter Atlas
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Explore Black-led outdoor clubs, land trusts, and upcoming outings across U.S. regions
            and the global diaspora. Select any regional hub on the atlas to inspect local chapters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <Select
            value={disciplineFilter}
            onValueChange={(val) => {
              if (val) setDisciplineFilter(val);
            }}
          >
            <SelectTrigger className="w-48 h-10 bg-card border-border">
              <SelectValue placeholder="All Disciplines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              {DISCIPLINES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={accessFilter}
            onValueChange={(val) => {
              if (val) setAccessFilter(val as AccessTag | 'all');
            }}
          >
            <SelectTrigger className="w-48 h-10 bg-card border-border">
              <SelectValue placeholder="All Access Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Tags</SelectItem>
              {ACCESS_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interactive Editorial Atlas + Selected Region Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 rounded-lg border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Compass className="size-3.5 text-primary" aria-hidden="true" />
              <span>Interactive Region Index</span>
            </div>
            {selectedRegion !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedRegion('all')}
                className="text-xs font-medium text-primary hover:underline underline-offset-4 cursor-pointer"
              >
                Show All Regions
              </button>
            )}
          </div>

          <div className="relative w-full overflow-hidden rounded-md border border-border bg-[#F2EFE8]">
            <svg
              viewBox="0 0 800 430"
              role="img"
              aria-label="Fieldline regional atlas of Black outdoor chapters"
              className="w-full h-auto block select-none"
            >
              {/* Subtle topographic graticule & contour rings */}
              <g stroke="#D9D3C5" strokeWidth="1" fill="none">
                <line x1="0" y1="108" x2="800" y2="108" strokeDasharray="3 6" />
                <line x1="0" y1="215" x2="800" y2="215" strokeDasharray="3 6" />
                <line x1="0" y1="322" x2="800" y2="322" strokeDasharray="3 6" />
                <line x1="200" y1="0" x2="200" y2="430" strokeDasharray="3 6" />
                <line x1="400" y1="0" x2="400" y2="430" strokeDasharray="3 6" />
                <line x1="600" y1="0" x2="600" y2="430" strokeDasharray="3 6" />
              </g>

              {/* Stylized Continental Silhouette */}
              <path
                d="M95 148 L178 124 L276 130 L370 128 L470 132 L568 136 L658 120 L702 156 L666 208 L636 254 L604 304 L574 358 L544 334 L486 330 L432 346 L372 362 L322 332 L252 324 L188 294 L126 254 L94 204 Z"
                fill="#EAE4D7"
                stroke="#C9C1B0"
                strokeWidth="1.5"
              />

              {/* Subtle connecting trail lines between hubs */}
              <g stroke="#1B4332" strokeOpacity="0.22" strokeWidth="1.25" strokeDasharray="4 4">
                <line x1="148" y1="196" x2="288" y2="282" />
                <line x1="288" y1="282" x2="454" y2="174" />
                <line x1="454" y1="174" x2="526" y2="306" />
                <line x1="454" y1="174" x2="646" y2="162" />
                <line x1="526" y1="306" x2="646" y2="162" />
                <line x1="396" y1="94" x2="454" y2="174" />
                <line x1="646" y1="162" x2="696" y2="344" />
              </g>

              {/* Clickable Region Hub Nodes */}
              {REGION_ATLAS_HUBS.map((hub) => {
                const counts = countsByRegion.get(hub.region) || { orgs: 0, outings: 0 };
                const isSelected = selectedRegion === hub.region;
                const radius = Math.min(30, Math.max(18, 15 + counts.orgs * 1.1));

                return (
                  <g
                    key={hub.region}
                    onClick={() =>
                      setSelectedRegion(isSelected ? 'all' : hub.region)
                    }
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`${hub.shortLabel}: ${counts.orgs} organizations, ${counts.outings} outings`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedRegion(isSelected ? 'all' : hub.region);
                      }
                    }}
                  >
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={radius + 6}
                      fill={isSelected ? '#1B4332' : '#1B4332'}
                      fillOpacity={isSelected ? 0.16 : 0.06}
                    />
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={radius}
                      fill={isSelected ? '#1B4332' : '#F8F6F1'}
                      stroke="#1B4332"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      x={hub.x}
                      y={hub.y + 4}
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="IBM Plex Mono, monospace"
                      fontWeight="600"
                      fill={isSelected ? '#F8F6F1' : '#1B4332'}
                    >
                      {counts.orgs}
                    </text>
                    <text
                      x={hub.x}
                      y={hub.y + radius + 16}
                      textAnchor="middle"
                      fontSize="11.5"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      fontWeight="600"
                      fill="#1C1917"
                    >
                      {hub.region}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {REGION_ATLAS_HUBS.map((hub) => {
              const counts = countsByRegion.get(hub.region) || { orgs: 0, outings: 0 };
              const active = selectedRegion === hub.region;
              return (
                <button
                  key={hub.region}
                  type="button"
                  onClick={() => setSelectedRegion(active ? 'all' : hub.region)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {hub.region}{' '}
                  <span className="font-mono tabular-nums opacity-80">({counts.orgs})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Regional Brief & Scheduled Trailheads */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              {activeHub ? 'Selected Region' : 'Network Coverage'}
            </p>
            <h2 className="font-serif text-2xl font-medium text-foreground">
              {activeHub ? activeHub.shortLabel : 'All U.S. & Diaspora Chapters'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeHub
                ? activeHub.tagline
                : 'Select any regional pin on the atlas to focus on local hiking crews, climbing collectives, surf lineups, and upcoming outings.'}
            </p>
            <div className="pt-2 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                  {filteredOrgs.length}
                </p>
                <p className="text-xs text-muted-foreground">Matching Organizations</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                  {filteredOutings.length}
                </p>
                <p className="text-xs text-muted-foreground">Scheduled Outings</p>
              </div>
            </div>
            {activeHub && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Anchor Hubs: <span className="text-foreground">{activeHub.anchorCities}</span>
              </p>
            )}
          </div>

          {/* Upcoming Outings in Selected Region */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden="true" />
              Upcoming Trailheads ({filteredOutings.length})
            </h3>
            {filteredOutings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scheduled outings match this regional filter yet.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredOutings.slice(0, 4).map((outing) => (
                  <button
                    key={outing.id}
                    type="button"
                    onClick={() => onSelectOuting(outing.id)}
                    className="w-full text-left rounded-md border border-border bg-background p-3.5 space-y-1 hover:border-foreground/30 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-mono text-primary">{outing.dateLabel}</p>
                    <p className="font-serif text-base font-medium text-foreground">
                      {outing.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{outing.location}</span>
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Matching Organizations Directory List */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            {activeHub ? `${activeHub.shortLabel} Organizations` : 'All Indexed Organizations'}
          </h2>
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            {filteredOrgs.length} listed
          </span>
        </div>

        {filteredOrgs.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center space-y-3">
            <p className="font-serif text-xl font-medium text-foreground">
              No clubs match that combination of region, discipline, and access filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRegion('all');
                setDisciplineFilter('all');
                setAccessFilter('all');
              }}
            >
              Reset Atlas Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map((org) => {
              const isJoined = joinedOrgIds.has(org.id);
              const isSaved = bookmarkedOrgIds.has(org.id);
              const tags = getOrganizationAccessTags(org);
              return (
                <article
                  key={org.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 space-y-4 hover:border-foreground/30 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectOrg(org.id)}
                        className="cursor-pointer rounded-md"
                        aria-label={`Open ${org.name}`}
                      >
                        <OrgLogo
                          orgId={org.id}
                          name={org.name}
                          discipline={org.discipline}
                          size="sm"
                        />
                      </button>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs text-primary font-medium">{org.discipline}</p>
                        <button
                          type="button"
                          onClick={() => onSelectOrg(org.id)}
                          className="text-left group cursor-pointer"
                        >
                          <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                            {org.name}
                          </h3>
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {org.region} · {org.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tags.slice(0, 3).join(' · ')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleClubBookmark(org)}
                      className={`inline-flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors ${
                        isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Bookmark
                        className={`size-3.5 ${isSaved ? 'fill-current' : ''}`}
                        aria-hidden="true"
                      />
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectOrg(org.id)}
                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Details
                      </Button>
                      <Button
                        variant={isJoined ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => void toggleClubMembership(org)}
                        className="h-8 px-3 text-xs"
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
