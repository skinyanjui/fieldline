import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import { useCommunity } from '@/src/context/CommunityContext';
import { DISCIPLINES, REGIONS } from '@/src/data/seedOrganizations';
import { SCHEMA_LIMITS } from '@/src/lib/validation';

interface ProfileEditPageProps {
  onBack: () => void;
}

export function ProfileEditPage({ onBack }: ProfileEditPageProps) {
  const { user, currentProfile, updateProfile, signInWithGoogle } = useCommunity();

  const [displayName, setDisplayName] = useState('');
  const [homeRegion, setHomeRegion] = useState('National');
  const [bio, setBio] = useState('');
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setDisplayName(currentProfile.displayName);
      setHomeRegion(currentProfile.homeRegion || 'National');
      setBio(currentProfile.bio || '');
      setDisciplines(currentProfile.disciplines || []);
    }
  }, [currentProfile]);

  const toggleDiscipline = (discipline: string) => {
    setDisciplines((prev) => {
      if (prev.includes(discipline)) {
        return prev.filter((item) => item !== discipline);
      }
      if (prev.length >= SCHEMA_LIMITS.maxDisciplines) return prev;
      return [...prev, discipline];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        homeRegion,
        bio,
        disciplines,
      });
      onBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-12 space-y-8 pb-20">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>

      <div className="pb-6 border-b border-border space-y-2 max-w-2xl">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
          Member Settings
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
          Edit Your Public Profile
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Your public profile appears on the Members roster, club pages, and Field Feed dispatches.
          Your Google email remains private and isolated.
        </p>
      </div>

      {!user ? (
        <div className="rounded-lg border border-border bg-card p-10 max-w-xl space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in with Google to customize your public Fieldline profile.
          </p>
          <Button onClick={() => void signInWithGoogle()}>Sign in with Google</Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => void handleSave(e)}
          className="max-w-2xl rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                required
                minLength={SCHEMA_LIMITS.displayName.min}
                maxLength={SCHEMA_LIMITS.displayName.max}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-background h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-region">Home Region</Label>
              <Select
                value={homeRegion}
                onValueChange={(val) => {
                  if (val) setHomeRegion(val);
                }}
              >
                <SelectTrigger id="profile-region" className="w-full h-10 bg-background">
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

          <div className="space-y-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              rows={4}
              maxLength={SCHEMA_LIMITS.bio.max}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Favorite local trails, home chapters, or outdoor goals..."
              className="bg-background resize-none"
            />
            <p className="text-xs font-mono tabular-nums text-muted-foreground text-right">
              {bio.length} / {SCHEMA_LIMITS.bio.max}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Outdoor Disciplines</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DISCIPLINES.map((d) => {
                const selected = disciplines.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDiscipline(d)}
                    className={`px-3 py-2 text-xs font-medium rounded-md border text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
