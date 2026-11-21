import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
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

interface OrganizationEditPageProps {
  orgId: string;
  onBack: () => void;
}

export function OrganizationEditPage({ orgId, onBack }: OrganizationEditPageProps) {
  const {
    user,
    isAdmin,
    organizations,
    updateOrganization,
    submitClubClaim,
    signInWithGoogle,
  } = useCommunity();

  const org = useMemo(
    () => organizations.find((o) => o.id === orgId) || null,
    [organizations, orgId]
  );

  const canEditDirectly = Boolean(
    org &&
      user &&
      org.source === 'community' &&
      (org.authorId === user.uid || isAdmin)
  );

  // Direct Edit state
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('Hiking & Camping');
  const [orgType, setOrgType] = useState<OrgType>('Outdoor Club');
  const [region, setRegion] = useState<Region>('National');
  const [location, setLocation] = useState('');
  const [founded, setFounded] = useState('');
  const [chapterCount, setChapterCount] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [summary, setSummary] = useState('');

  // Chapter Claim state
  const [roleTitle, setRoleTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setDiscipline(org.discipline);
      setOrgType(org.orgType);
      setRegion(org.region);
      setLocation(org.location);
      setFounded(org.founded);
      setChapterCount(org.chapterCount);
      setWebsite(org.website);
      setInstagram(org.instagram);
      setSummary(org.summary);
    }
  }, [org]);

  if (!org) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3 max-w-xl">
          <h1 className="font-serif text-2xl font-medium text-foreground">
            Organization not found.
          </h1>
          <Button onClick={onBack}>Return to Directory</Button>
        </div>
      </div>
    );
  }

  const handleDirectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ok = await updateOrganization(org.id, {
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
      if (ok) onBack();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ok = await submitClubClaim({
        orgId: org.id,
        orgName: org.name,
        roleTitle,
        proposedSummary: summary,
        proposedWebsite: website,
        proposedChapterCount: chapterCount,
        notes,
      });
      if (ok) onBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-10 space-y-8">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {org.name}
        </button>
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
          {canEditDirectly ? 'Edit Organization' : 'Chapter Stewardship'}
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="flex items-start gap-4">
          <OrgLogo orgId={org.id} name={org.name} discipline={org.discipline} size="lg" />
          <div className="space-y-1.5">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              {canEditDirectly ? `Edit ${org.name}` : `Claim or Update ${org.name}`}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {canEditDirectly
                ? 'Update your community-submitted listing details across the Fieldline index.'
                : 'Are you a chapter leader, board member, or organizer? Submit verified updates to keep this organization’s dossier current.'}
            </p>
          </div>
        </div>

        {!user ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center space-y-4">
            <h2 className="font-serif text-xl font-medium text-foreground">
              Sign in to submit chapter updates.
            </h2>
            <p className="text-sm text-muted-foreground">
              We verify chapter claims with signed-in member accounts to protect directory accuracy.
            </p>
            <Button onClick={() => void signInWithGoogle()} className="h-10 px-6">
              Sign in with Google
            </Button>
          </div>
        ) : canEditDirectly ? (
          <form
            onSubmit={(e) => void handleDirectSave(e)}
            className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="edit-org-name">Organization Name</Label>
              <Input
                id="edit-org-name"
                required
                minLength={SCHEMA_LIMITS.orgName.min}
                maxLength={SCHEMA_LIMITS.orgName.max}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-background"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-org-discipline">Discipline</Label>
                <Select
                  value={discipline}
                  onValueChange={(val) => {
                    if (val) setDiscipline(val as Discipline);
                  }}
                >
                  <SelectTrigger id="edit-org-discipline" className="w-full h-10 bg-background">
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
                <Label htmlFor="edit-org-type">Type</Label>
                <Select
                  value={orgType}
                  onValueChange={(val) => {
                    if (val) setOrgType(val as OrgType);
                  }}
                >
                  <SelectTrigger id="edit-org-type" className="w-full h-10 bg-background">
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
                <Label htmlFor="edit-org-region">Region</Label>
                <Select
                  value={region}
                  onValueChange={(val) => {
                    if (val) setRegion(val as Region);
                  }}
                >
                  <SelectTrigger id="edit-org-region" className="w-full h-10 bg-background">
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
              <div className="space-y-1.5">
                <Label htmlFor="edit-org-location">Location / Base</Label>
                <Input
                  id="edit-org-location"
                  required
                  minLength={SCHEMA_LIMITS.location.min}
                  maxLength={SCHEMA_LIMITS.location.max}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-org-founded">Founded</Label>
                <Input
                  id="edit-org-founded"
                  required
                  minLength={SCHEMA_LIMITS.founded.min}
                  maxLength={SCHEMA_LIMITS.founded.max}
                  value={founded}
                  onChange={(e) => setFounded(e.target.value)}
                  className="h-10 bg-background font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-org-chapters">Chapter Footprint</Label>
                <Input
                  id="edit-org-chapters"
                  maxLength={SCHEMA_LIMITS.chapterCount.max}
                  value={chapterCount}
                  onChange={(e) => setChapterCount(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-org-website">Website</Label>
                <Input
                  id="edit-org-website"
                  maxLength={SCHEMA_LIMITS.website.max}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-org-instagram">Social Handle</Label>
                <Input
                  id="edit-org-instagram"
                  maxLength={SCHEMA_LIMITS.instagram.max}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="h-10 bg-background font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-org-summary">Mission &amp; Programs Summary</Label>
              <Textarea
                id="edit-org-summary"
                required
                rows={4}
                minLength={SCHEMA_LIMITS.summary.min}
                maxLength={SCHEMA_LIMITS.summary.max}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="bg-background resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onBack} className="h-10 px-4">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5">
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => void handleClaimSubmit(e)}
            className="rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span>Verified Chapter Stewardship Request</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="claim-role">Your Role / Affiliation</Label>
              <Input
                id="claim-role"
                required
                minLength={SCHEMA_LIMITS.claimRoleTitle.min}
                maxLength={SCHEMA_LIMITS.claimRoleTitle.max}
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., Atlanta Chapter Leader, Communications Lead, Founder"
                className="h-10 bg-background"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="claim-chapters">Updated Chapter Footprint</Label>
                <Input
                  id="claim-chapters"
                  maxLength={SCHEMA_LIMITS.chapterCount.max}
                  value={chapterCount}
                  onChange={(e) => setChapterCount(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="claim-website">Updated Website</Label>
                <Input
                  id="claim-website"
                  maxLength={SCHEMA_LIMITS.website.max}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-10 bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="claim-summary">Proposed Mission Summary</Label>
              <Textarea
                id="claim-summary"
                rows={4}
                maxLength={SCHEMA_LIMITS.summary.max}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="bg-background resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="claim-notes">Verification &amp; Update Notes</Label>
              <Textarea
                id="claim-notes"
                required
                rows={3}
                minLength={SCHEMA_LIMITS.claimNotes.min}
                maxLength={SCHEMA_LIMITS.claimNotes.max}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share what changed (new chapters, seasonal schedule, website update) and how our directory stewards can verify your role..."
                className="bg-background resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onBack} className="h-10 px-4">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5">
                {submitting ? 'Submitting...' : 'Submit Stewardship Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
