import { useState } from 'react';
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
  ORG_TYPES,
  REGIONS,
  type Discipline,
  type OrgType,
  type Region,
} from '@/src/data/seedOrganizations';
import { SCHEMA_LIMITS } from '@/src/lib/validation';

interface SubmitClubViewProps {
  onSuccessNavigate: () => void;
}

export function SubmitClubView({ onSuccessNavigate }: SubmitClubViewProps) {
  const { user, organizations, submitOrganization, signInWithGoogle } = useCommunity();

  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('Hiking & Camping');
  const [orgType, setOrgType] = useState<OrgType>('Outdoor Club');
  const [region, setRegion] = useState<Region>('National');
  const [location, setLocation] = useState('');
  const [founded, setFounded] = useState('2022');
  const [chapterCount, setChapterCount] = useState('Local Chapter');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const communitySubmissions = organizations.filter((o) => o.source === 'community');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await submitOrganization({
        name,
        discipline,
        orgType,
        region,
        location,
        founded,
        chapterCount,
        website,
        instagram,
        summary,
      });
      if (created) {
        setName('');
        setLocation('');
        setWebsite('');
        setInstagram('');
        setSummary('');
        onSuccessNavigate();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12">
      <div className="pb-8 border-b border-border space-y-2 max-w-2xl">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
          Directory Contributions
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
          Add an Organization to Fieldline
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Know a local Black hiking chapter, climbing crew, run club, farm collective, sailing
          group, or environmental justice organization? Add it to the community index.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="lg:col-span-7 rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
        >
          {!user && (
            <div className="rounded-md bg-secondary p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-foreground leading-relaxed">
                Sign in with Google to publish a verified community listing to the live directory.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => void signInWithGoogle()}
                className="shrink-0"
              >
                Sign in
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4 pb-1">
            <OrgLogo
              orgId={name.trim().toLowerCase().replace(/\s+/g, '-') || 'new-club'}
              name={name.trim() || 'New Club'}
              discipline={discipline}
              size="lg"
            />
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="club-name">Organization Name</Label>
              <Input
                id="club-name"
                required
                minLength={SCHEMA_LIMITS.orgName.min}
                maxLength={SCHEMA_LIMITS.orgName.max}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Piedmont Trail Collective"
                className="bg-background h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="club-discipline">Primary Discipline</Label>
              <Select
                value={discipline}
                onValueChange={(val) => {
                  if (val) setDiscipline(val as Discipline);
                }}
              >
                <SelectTrigger id="club-discipline" className="w-full h-10 bg-background">
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

            <div className="space-y-1.5">
              <Label htmlFor="club-type">Organization Type</Label>
              <Select
                value={orgType}
                onValueChange={(val) => {
                  if (val) setOrgType(val as OrgType);
                }}
              >
                <SelectTrigger id="club-type" className="w-full h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="club-region">Region</Label>
              <Select
                value={region}
                onValueChange={(val) => {
                  if (val) setRegion(val as Region);
                }}
              >
                <SelectTrigger id="club-region" className="w-full h-10 bg-background">
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
              <Label htmlFor="club-location">City, State or Base</Label>
              <Input
                id="club-location"
                required
                minLength={SCHEMA_LIMITS.location.min}
                maxLength={SCHEMA_LIMITS.location.max}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Durham, NC"
                className="bg-background h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="club-founded">Founded Year</Label>
              <Input
                id="club-founded"
                required
                minLength={SCHEMA_LIMITS.founded.min}
                maxLength={SCHEMA_LIMITS.founded.max}
                value={founded}
                onChange={(e) => setFounded(e.target.value)}
                placeholder="e.g., 2021"
                className="bg-background h-10 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="club-footprint">Chapter Footprint</Label>
              <Input
                id="club-footprint"
                maxLength={SCHEMA_LIMITS.chapterCount.max}
                value={chapterCount}
                onChange={(e) => setChapterCount(e.target.value)}
                placeholder="e.g., 3 Regional Chapters"
                className="bg-background h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="club-website">Website (optional)</Label>
              <Input
                id="club-website"
                maxLength={SCHEMA_LIMITS.website.max}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="bg-background h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="club-instagram">Instagram (optional)</Label>
              <Input
                id="club-instagram"
                maxLength={SCHEMA_LIMITS.instagram.max}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@handle"
                className="bg-background h-10 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="club-summary">Mission &amp; Community Activities</Label>
            <Textarea
              id="club-summary"
              required
              rows={4}
              minLength={SCHEMA_LIMITS.summary.min}
              maxLength={SCHEMA_LIMITS.summary.max}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe who the group serves, regular meetups, gear accessibility, or conservation focus..."
              className="bg-background resize-none"
            />
            <p className="text-xs font-mono tabular-nums text-muted-foreground text-right">
              {summary.length} / {SCHEMA_LIMITS.summary.max}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <Button type="submit" disabled={submitting} className="h-10 px-6">
              {submitting ? 'Adding to Directory...' : 'Submit Organization'}
            </Button>
          </div>
        </form>

        {/* Editorial Submission Guidelines & Recent Community Additions */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <h2 className="font-serif text-xl font-medium text-foreground">
              What belongs in Fieldline
            </h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
              <li>
                — Black-led outdoor recreation clubs across hiking, camping, climbing, snowsports,
                cycling, running, paddling, surfing, sailing, diving, and fishing.
              </li>
              <li>
                — Adjacent land stewardship, urban agriculture, birding, equestrian heritage, and
                environmental justice organizations.
              </li>
              <li>
                — Coalitions, Black-owned campgrounds, youth outdoor nonprofits, and outdoor media
                platforms expanding access to public lands and water.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Recent Community Additions ({communitySubmissions.length})
            </h3>
            {communitySubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Community-contributed clubs appear here alongside our 30 researched baseline
                organizations.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {communitySubmissions.slice(0, 6).map((org) => (
                  <li key={org.id} className="py-3 flex items-center gap-3">
                    <OrgLogo
                      orgId={org.id}
                      name={org.name}
                      discipline={org.discipline}
                      size="sm"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-serif text-base font-medium text-foreground truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {org.discipline} · {org.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
