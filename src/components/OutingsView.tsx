import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, CalendarPlus, Car, Check, MapPin, Trash2, Users } from 'lucide-react';
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
import { OrgLogo } from '@/src/components/OrgLogo';
import { useCommunity } from '@/src/context/CommunityContext';
import {
  DISCIPLINES,
  REGIONS,
  type DirectoryOrganization,
  type Discipline,
  type Region,
  type SeedOuting,
} from '@/src/data/seedOrganizations';
import { ACCESS_TAGS, getOutingAccessTags, type AccessTag } from '@/src/lib/accessTags';
import { downloadOutingIcs } from '@/src/lib/exportUtils';
import { SCHEMA_LIMITS } from '@/src/lib/validation';

const DIFFICULTIES: SeedOuting['difficulty'][] = [
  'Beginner Friendly',
  'Moderate',
  'Challenging',
  'All Levels',
];

interface OutingsViewProps {
  preselectedClub?: DirectoryOrganization | null;
  onClearPreselectedClub?: () => void;
  onSelectOuting: (outingId: string) => void;
  onSelectOrg: (orgId: string) => void;
}

export function OutingsView({
  preselectedClub = null,
  onClearPreselectedClub,
  onSelectOuting,
  onSelectOrg,
}: OutingsViewProps) {
  const {
    user,
    organizations,
    outings,
    rsvps,
    carpoolOffers,
    createOuting,
    deleteOuting,
    toggleOutingRsvp,
  } = useCommunity();

  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | AccessTag>('all');
  const [hostPageOpen, setHostPageOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Host outing form state
  const [title, setTitle] = useState('');
  const [orgId, setOrgId] = useState('commons');
  const [discipline, setDiscipline] = useState<Discipline>('Hiking & Camping');
  const [dateLabel, setDateLabel] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState<Region>('Northeast');
  const [difficulty, setDifficulty] = useState<SeedOuting['difficulty']>('Beginner Friendly');
  const [maxSpots, setMaxSpots] = useState('20');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (preselectedClub) {
      setOrgId(preselectedClub.id);
      setDiscipline(preselectedClub.discipline);
      setRegion(preselectedClub.region);
      setHostPageOpen(true);
      onClearPreselectedClub?.();
    }
  }, [preselectedClub, onClearPreselectedClub]);

  const filteredOutings = useMemo(() => {
    return outings.filter((o) => {
      if (regionFilter !== 'all' && o.region !== regionFilter) return false;
      if (disciplineFilter !== 'all' && o.discipline !== disciplineFilter) return false;
      if (accessFilter !== 'all' && !getOutingAccessTags(o).includes(accessFilter)) return false;
      return true;
    });
  }, [outings, regionFilter, disciplineFilter, accessFilter]);

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedOrg = organizations.find((o) => o.id === orgId);
      const ok = await createOuting({
        orgId: selectedOrg ? selectedOrg.id : '',
        orgName: selectedOrg ? selectedOrg.name : 'Fieldline Commons',
        title,
        discipline,
        dateLabel,
        location,
        region,
        difficulty,
        maxSpots: Number(maxSpots) || 20,
        description,
      });
      if (ok) {
        setTitle('');
        setDateLabel('');
        setLocation('');
        setDescription('');
        setHostPageOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (hostPageOpen) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-10 space-y-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setHostPageOpen(false)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Outings
          </button>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Host Outing
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              Host a Community Outing
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Post a hike, paddle, climb, ride, or stewardship day for members to RSVP.
            </p>
          </div>

          <form
            onSubmit={(e) => void handleHostSubmit(e)}
            className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="outing-title">Outing Title</Label>
              <Input
                id="outing-title"
                required
                minLength={SCHEMA_LIMITS.outingTitle.min}
                maxLength={SCHEMA_LIMITS.outingTitle.max}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sunset Trail Loop & Tea Social"
                className="h-10 bg-background"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="outing-org">Affiliated Club</Label>
                <Select
                  value={orgId}
                  onValueChange={(val) => {
                    if (val) setOrgId(val);
                  }}
                >
                  <SelectTrigger id="outing-org" className="w-full h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commons">Fieldline Commons</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="outing-discipline">Discipline</Label>
                <Select
                  value={discipline}
                  onValueChange={(val) => {
                    if (val) setDiscipline(val as Discipline);
                  }}
                >
                  <SelectTrigger id="outing-discipline" className="w-full h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="outing-date">Date &amp; Time</Label>
                <Input
                  id="outing-date"
                  required
                  minLength={SCHEMA_LIMITS.outingDateLabel.min}
                  maxLength={SCHEMA_LIMITS.outingDateLabel.max}
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  placeholder="e.g., Sat, Jan 10 · 8:00 AM"
                  className="h-10 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="outing-region">Region</Label>
                <Select
                  value={region}
                  onValueChange={(val) => {
                    if (val) setRegion(val as Region);
                  }}
                >
                  <SelectTrigger id="outing-region" className="w-full h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="outing-location">Trailhead or Meeting Point</Label>
                <Input
                  id="outing-location"
                  required
                  minLength={SCHEMA_LIMITS.outingLocation.min}
                  maxLength={SCHEMA_LIMITS.outingLocation.max}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Griffith Observatory West Lot, LA"
                  className="h-10 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="outing-spots">Max Spots</Label>
                <Input
                  id="outing-spots"
                  type="number"
                  min={SCHEMA_LIMITS.outingSpots.min}
                  max={SCHEMA_LIMITS.outingSpots.max}
                  value={maxSpots}
                  onChange={(e) => setMaxSpots(e.target.value)}
                  className="h-10 bg-background font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="outing-difficulty">Experience Level</Label>
              <Select
                value={difficulty}
                onValueChange={(val) => {
                  if (val) setDifficulty(val as SeedOuting['difficulty']);
                }}
              >
                <SelectTrigger id="outing-difficulty" className="w-full h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="outing-desc">Route, Pace &amp; Gear Notes</Label>
              <Textarea
                id="outing-desc"
                required
                rows={4}
                minLength={SCHEMA_LIMITS.outingDescription.min}
                maxLength={SCHEMA_LIMITS.outingDescription.max}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe mileage, pace, transit or carpool details, and what to bring..."
                className="bg-background resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHostPageOpen(false)}
                className="h-10 px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5">
                {submitting ? 'Publishing...' : 'Publish Outing'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Trailhead Calendar
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Upcoming Group Outings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            RSVP to chapter hikes, dawn patrols, gravel rides, birding walks, and crag sessions—or
            host a local meetup for your crew.
          </p>
        </div>

        <Button
          onClick={() => setHostPageOpen(true)}
          className="h-10 px-5 whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          Host an Outing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={disciplineFilter}
          onValueChange={(val) => {
            if (val) setDisciplineFilter(val);
          }}
        >
          <SelectTrigger className="w-52 h-10 bg-card border-border">
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
          value={regionFilter}
          onValueChange={(val) => {
            if (val) setRegionFilter(val);
          }}
        >
          <SelectTrigger className="w-44 h-10 bg-card border-border">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accessFilter}
          onValueChange={(val) => {
            if (val) setAccessFilter(val as 'all' | AccessTag);
          }}
        >
          <SelectTrigger className="w-48 h-10 bg-card border-border">
            <SelectValue placeholder="All Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            {ACCESS_TAGS.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
          {filteredOutings.length} scheduled {filteredOutings.length === 1 ? 'outing' : 'outings'}
        </span>
      </div>

      {/* Outings List */}
      {filteredOutings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3">
          <h3 className="font-serif text-xl font-medium text-foreground">
            No outings scheduled for these filters.
          </h3>
          <p className="text-sm text-muted-foreground">
            Reset your filters or post a local hike, ride, or walk for members nearby.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDisciplineFilter('all');
                setRegionFilter('all');
                setAccessFilter('all');
              }}
            >
              Show All Outings
            </Button>
            <Button onClick={() => setHostPageOpen(true)}>Host an Outing</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOutings.map((outing) => {
            const outingRsvps = rsvps.filter((r) => r.outingId === outing.id);
            const offerCount = carpoolOffers.filter((offer) => offer.outingId === outing.id).length;
            const accessTags = getOutingAccessTags(outing);
            const isGoing = Boolean(user && outingRsvps.some((r) => r.userId === user.uid));
            const spotsLeft = Math.max(0, outing.maxSpots - outingRsvps.length);
            const canDelete = Boolean(
              user && outing.source === 'community' && outing.hostId === user.uid
            );

            return (
              <article
                key={outing.id}
                className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-mono text-primary font-medium">{outing.dateLabel}</p>
                    <span className="text-xs text-muted-foreground">
                      {outing.difficulty} · {outing.region}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    {outing.orgId ? (
                      <button
                        type="button"
                        onClick={() => onSelectOrg(outing.orgId)}
                        aria-label={`View ${outing.orgName}`}
                        className="mt-0.5 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <OrgLogo
                          orgId={outing.orgId}
                          name={outing.orgName}
                          discipline={outing.discipline}
                          size="sm"
                        />
                      </button>
                    ) : (
                      <OrgLogo
                        orgId="fieldline-commons"
                        name={outing.orgName}
                        discipline={outing.discipline}
                        size="sm"
                        className="mt-0.5"
                      />
                    )}
                    <div className="space-y-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectOuting(outing.id)}
                        className="block text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        <h2 className="font-serif text-2xl font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                          {outing.title}
                        </h2>
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Hosted by{' '}
                        {outing.orgId ? (
                          <button
                            type="button"
                            onClick={() => onSelectOrg(outing.orgId)}
                            className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline cursor-pointer"
                          >
                            {outing.orgName}
                          </button>
                        ) : (
                          <span className="font-medium text-foreground">{outing.orgName}</span>
                        )}{' '}
                        · Leader: {outing.hostName}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {outing.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                      {outing.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Users className="size-3.5 text-primary" aria-hidden="true" />
                      {outingRsvps.length} going · {spotsLeft} spots left
                    </span>
                    {offerCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-primary">
                        <Car className="size-3.5" aria-hidden="true" />
                        {offerCount} {offerCount === 1 ? 'ride/gear offer' : 'ride/gear offers'}
                      </span>
                    )}
                  </div>

                  {accessTags.length > 0 && (
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {accessTags.join(' · ')}
                    </p>
                  )}

                  {outingRsvps.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Attending:{' '}
                      <span className="text-foreground">
                        {outingRsvps
                          .slice(0, 5)
                          .map((r) => r.userName)
                          .join(', ')}
                        {outingRsvps.length > 5 ? ` +${outingRsvps.length - 5} more` : ''}
                      </span>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{outing.discipline}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectOuting(outing.id)}
                      className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                    >
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadOutingIcs(outing)}
                      title="Download calendar invite (.ics)"
                      className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                    >
                      <Calendar className="size-3.5" aria-hidden="true" />
                      .ics
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete outing"
                        onClick={() => void deleteOuting(outing.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant={isGoing ? 'secondary' : 'default'}
                      size="sm"
                      disabled={!isGoing && spotsLeft === 0}
                      onClick={() => void toggleOutingRsvp(outing)}
                      className="h-9 px-4 whitespace-nowrap shrink-0"
                    >
                      {isGoing ? (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          RSVP Confirmed
                        </>
                      ) : spotsLeft === 0 ? (
                        'Outing Full'
                      ) : (
                        'RSVP Going'
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
