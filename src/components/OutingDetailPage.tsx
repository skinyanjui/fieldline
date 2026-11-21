import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Backpack,
  Calendar,
  Car,
  Check,
  CloudSun,
  MapPin,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrgLogo } from '@/src/components/OrgLogo';
import { EditorialImage } from '@/src/components/EditorialImage';
import { useCommunity } from '@/src/context/CommunityContext';
import { getDisciplineImage } from '@/src/data/seedOrganizations';
import { getDisciplineChecklist, getOutingAccessTags } from '@/src/lib/accessTags';
import { downloadOutingIcs } from '@/src/lib/exportUtils';
import { copyShareLink } from '@/src/lib/seoUtils';
import { SCHEMA_LIMITS } from '@/src/lib/validation';

interface OutingDetailPageProps {
  outingId: string;
  onBack: () => void;
  onSelectOrg: (orgId: string) => void;
  onSelectMember: (uid: string) => void;
}

export function OutingDetailPage({
  outingId,
  onBack,
  onSelectOrg,
  onSelectMember,
}: OutingDetailPageProps) {
  const {
    user,
    organizations,
    outings,
    rsvps,
    carpoolOffers,
    carpoolClaims,
    toggleOutingRsvp,
    deleteOuting,
    createCarpoolOffer,
    deleteCarpoolOffer,
    toggleCarpoolClaim,
  } = useCommunity();

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerType, setOfferType] = useState<'carpool' | 'gear'>('carpool');
  const [departurePoint, setDeparturePoint] = useState('');
  const [itemSummary, setItemSummary] = useState('');
  const [totalSlots, setTotalSlots] = useState('3');
  const [offerNotes, setOfferNotes] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const storageKey = `fieldline_checklist_${outingId}`;
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setCheckedItems(parsed && typeof parsed === 'object' ? parsed : {});
      } else {
        setCheckedItems({});
      }
    } catch {
      setCheckedItems({});
    }
  }, [storageKey]);

  const toggleChecklistItem = (itemId: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors in restricted browsers.
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedItems({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors.
    }
  };

  const outing = useMemo(
    () => outings.find((o) => o.id === outingId) || null,
    [outings, outingId]
  );

  const outingRsvps = useMemo(
    () => rsvps.filter((r) => r.outingId === outingId),
    [rsvps, outingId]
  );

  const outingOffers = useMemo(
    () => carpoolOffers.filter((offer) => offer.outingId === outingId),
    [carpoolOffers, outingId]
  );

  const hostOrg = useMemo(() => {
    if (!outing?.orgId) return null;
    return organizations.find((o) => o.id === outing.orgId) || null;
  }, [organizations, outing]);

  const accessTags = useMemo(() => (outing ? getOutingAccessTags(outing) : []), [outing]);
  const checklist = useMemo(
    () => (outing ? getDisciplineChecklist(outing.discipline) : []),
    [outing]
  );

  const checkedCount = useMemo(
    () => checklist.filter((item) => checkedItems[item.id]).length,
    [checklist, checkedItems]
  );

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outing) return;
    setSubmittingOffer(true);
    try {
      const ok = await createCarpoolOffer({
        outingId: outing.id,
        offerType,
        departurePoint,
        itemSummary,
        totalSlots: Number(totalSlots) || 2,
        notes: offerNotes,
      });
      if (ok) {
        setDeparturePoint('');
        setItemSummary('');
        setTotalSlots('3');
        setOfferNotes('');
        setShowOfferForm(false);
      }
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (!outing) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Outings
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3 max-w-xl">
          <h1 className="font-serif text-2xl font-medium text-foreground">Outing not found.</h1>
          <p className="text-sm text-muted-foreground">
            This outing may have been canceled or removed.
          </p>
          <Button onClick={onBack}>Return to Outings</Button>
        </div>
      </div>
    );
  }

  const isGoing = Boolean(user && outingRsvps.some((r) => r.userId === user.uid));
  const spotsLeft = Math.max(0, outing.maxSpots - outingRsvps.length);
  const canDelete = Boolean(user && outing.source === 'community' && outing.hostId === user.uid);
  const directionsUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(outing.location)}`;
  const weatherUrl = `https://duckduckgo.com/?q=${encodeURIComponent(`${outing.location} weather forecast`)}`;

  return (
    <article className="mx-auto max-w-[1280px] px-6 py-8 md:py-12 space-y-10 pb-20">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Outings
        </button>
        <span className="text-xs font-mono text-muted-foreground">
          {outing.discipline} / {outing.region}
        </span>
      </div>

      {/* Hero Split */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pb-10 border-b border-border">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-mono font-medium text-primary uppercase tracking-[0.12em]">
              {outing.dateLabel} · {outing.difficulty}
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
              {outing.title}
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <OrgLogo
                orgId={outing.orgId || 'fieldline-commons'}
                name={outing.orgName}
                discipline={outing.discipline}
                size="sm"
              />
              <div className="text-sm text-muted-foreground">
                Hosted by{' '}
                {hostOrg ? (
                  <button
                    type="button"
                    onClick={() => onSelectOrg(hostOrg.id)}
                    className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground cursor-pointer"
                  >
                    {outing.orgName}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{outing.orgName}</span>
                )}{' '}
                · Leader: {outing.hostName}
              </div>
            </div>
            {accessTags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Access &amp; Welcome:{' '}
                <span className="text-foreground">{accessTags.join(' · ')}</span>
              </p>
            )}
            <p className="text-base leading-relaxed text-foreground/85 max-w-prose pt-1">
              {outing.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant={isGoing ? 'secondary' : 'default'}
              size="lg"
              disabled={!isGoing && spotsLeft === 0}
              onClick={() => void toggleOutingRsvp(outing)}
              className="h-10 px-6 whitespace-nowrap shrink-0"
            >
              {isGoing ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  RSVP Confirmed (Cancel)
                </>
              ) : spotsLeft === 0 ? (
                'Outing Full'
              ) : (
                'RSVP Going'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => downloadOutingIcs(outing)}
              className="h-10 px-4 whitespace-nowrap shrink-0"
            >
              <Calendar className="size-4" aria-hidden="true" />
              Add to Calendar (.ics)
            </Button>

            <Button
              variant="ghost"
              onClick={() => void copyShareLink('Outing link')}
              className="h-10 px-3.5 text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
            >
              <Share2 className="size-4" aria-hidden="true" />
              Share
            </Button>

            {canDelete && (
              <Button
                variant="destructive"
                onClick={async () => {
                  await deleteOuting(outing.id);
                  onBack();
                }}
                className="h-10 px-4 whitespace-nowrap shrink-0"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete Outing
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 min-h-[240px] lg:min-h-[300px] overflow-hidden rounded-lg border border-border bg-secondary">
            <EditorialImage
              src={hostOrg?.imageUrl || getDisciplineImage(outing.discipline)}
              alt={outing.title}
              title={outing.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main 7/5 Grid: Logistics + Carpool/Gear Board | Attendees + Readiness Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-10">
          {/* 01. Trailhead Logistics */}
          <section className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                01. Trailhead Logistics
              </h2>
              <div className="flex items-center gap-4 text-xs">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4"
                >
                  Trailhead Directions
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
                <a
                  href={weatherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                >
                  <CloudSun className="size-3.5" aria-hidden="true" />
                  Local Weather
                </a>
              </div>
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="py-3 first:pt-0 grid grid-cols-3 gap-4">
                <dt className="text-muted-foreground">Date &amp; Start</dt>
                <dd className="col-span-2 font-mono text-foreground">{outing.dateLabel}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-muted-foreground">Meeting Point</dt>
                <dd className="col-span-2 text-foreground flex items-start gap-1.5">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{outing.location}</span>
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-muted-foreground">Region</dt>
                <dd className="col-span-2 text-foreground">{outing.region}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-muted-foreground">Discipline</dt>
                <dd className="col-span-2 text-foreground">{outing.discipline}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-muted-foreground">Experience Level</dt>
                <dd className="col-span-2 text-foreground">{outing.difficulty}</dd>
              </div>
              {accessTags.length > 0 && (
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-muted-foreground">Access</dt>
                  <dd className="col-span-2 text-foreground">{accessTags.join(' · ')}</dd>
                </div>
              )}
              <div className="py-3 last:pb-0 grid grid-cols-3 gap-4">
                <dt className="text-muted-foreground">Capacity</dt>
                <dd className="col-span-2 font-mono tabular-nums text-foreground">
                  {outingRsvps.length} going / {outing.maxSpots} max ({spotsLeft} spots left)
                </dd>
              </div>
            </dl>
          </section>

          {/* 02. Carpool & Loaner Gear Board */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  02. Trailhead Coordination
                </p>
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Carpool &amp; Loaner Gear Board ({outingOffers.length})
                </h2>
              </div>
              <Button
                variant={showOfferForm ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowOfferForm((prev) => !prev)}
                className="h-9 px-3.5 whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                {showOfferForm ? 'Close Form' : 'Offer Ride or Loaner Gear'}
              </Button>
            </div>

            {showOfferForm && (
              <form
                onSubmit={(e) => void handleOfferSubmit(e)}
                className="rounded-lg border border-border bg-card p-6 space-y-4"
              >
                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary">
                  {(
                    [
                      { id: 'carpool', label: 'Carpool Ride' },
                      { id: 'gear', label: 'Loaner Gear' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setOfferType(mode.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        offerType === mode.id
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="offer-departure">
                      {offerType === 'carpool' ? 'Departure / Pickup Point' : 'Gear Handoff Point'}
                    </Label>
                    <Input
                      id="offer-departure"
                      required
                      minLength={SCHEMA_LIMITS.departurePoint.min}
                      maxLength={SCHEMA_LIMITS.departurePoint.max}
                      value={departurePoint}
                      onChange={(e) => setDeparturePoint(e.target.value)}
                      placeholder={
                        offerType === 'carpool'
                          ? 'e.g., West Oakland BART North Lot · 7:15 AM'
                          : 'e.g., At the trailhead parking kiosk 15 min early'
                      }
                      className="h-10 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="offer-slots">
                      {offerType === 'carpool' ? 'Open Seats' : 'Items Available'}
                    </Label>
                    <Input
                      id="offer-slots"
                      type="number"
                      min={SCHEMA_LIMITS.offerSlots.min}
                      max={SCHEMA_LIMITS.offerSlots.max}
                      value={totalSlots}
                      onChange={(e) => setTotalSlots(e.target.value)}
                      className="h-10 bg-background font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="offer-summary">
                    {offerType === 'carpool' ? 'Ride Details' : 'Loaner Gear Summary'}
                  </Label>
                  <Input
                    id="offer-summary"
                    required
                    minLength={SCHEMA_LIMITS.itemSummary.min}
                    maxLength={SCHEMA_LIMITS.itemSummary.max}
                    value={itemSummary}
                    onChange={(e) => setItemSummary(e.target.value)}
                    placeholder={
                      offerType === 'carpool'
                        ? 'e.g., 3 seats in Subaru Outback with roof rack for packs'
                        : 'e.g., 2 pairs of 8x42 binoculars + extra trekking poles'
                    }
                    className="h-10 bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="offer-notes">Coordination Notes (optional)</Label>
                  <Textarea
                    id="offer-notes"
                    rows={2}
                    maxLength={SCHEMA_LIMITS.offerNotes.max}
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="Timing flexibility, gas split, sizing info, or transit drop-off..."
                    className="bg-background resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOfferForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submittingOffer}>
                    {submittingOffer ? 'Posting...' : 'Post to Board'}
                  </Button>
                </div>
              </form>
            )}

            {outingOffers.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground leading-relaxed">
                No carpool seats or loaner gear listed for this outing yet. Have open seats from a
                transit hub or spare binoculars, trekking poles, or a wetsuit? Share them above.
              </div>
            ) : (
              <div className="space-y-4">
                {outingOffers.map((offer) => {
                  const claims = carpoolClaims.filter((c) => c.offerId === offer.id);
                  const claimedByMe = Boolean(user && claims.some((c) => c.userId === user.uid));
                  const slotsLeft = Math.max(0, offer.totalSlots - claims.length);
                  const isHost = Boolean(user && offer.hostId === user.uid);

                  return (
                    <div
                      key={offer.id}
                      className="rounded-lg border border-border bg-card p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="inline-flex items-center gap-1 font-medium text-primary">
                              {offer.offerType === 'carpool' ? (
                                <Car className="size-3.5" aria-hidden="true" />
                              ) : (
                                <Backpack className="size-3.5" aria-hidden="true" />
                              )}
                              {offer.offerType === 'carpool' ? 'Carpool Ride' : 'Loaner Gear'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <button
                              type="button"
                              onClick={() => onSelectMember(offer.hostId)}
                              className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                              {offer.hostName}
                            </button>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {slotsLeft} of {offer.totalSlots} available
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-medium text-foreground">
                            {offer.itemSummary}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Meetup: <span className="text-foreground">{offer.departurePoint}</span>
                          </p>
                          {offer.notes && (
                            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                              {offer.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isHost ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remove offer"
                              onClick={() => void deleteCarpoolOffer(offer.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              variant={claimedByMe ? 'secondary' : 'outline'}
                              size="sm"
                              disabled={!claimedByMe && slotsLeft === 0}
                              onClick={() => void toggleCarpoolClaim(offer)}
                              className="h-9 px-3.5 text-xs whitespace-nowrap"
                            >
                              {claimedByMe
                                ? 'Release Spot'
                                : slotsLeft === 0
                                  ? 'Full'
                                  : offer.offerType === 'carpool'
                                    ? 'Claim Seat'
                                    : 'Reserve Gear'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {claims.length > 0 && (
                        <p className="pt-2 border-t border-border text-xs text-muted-foreground">
                          Claimed by:{' '}
                          <span className="text-foreground">
                            {claims.map((c) => c.userName).join(', ')}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Rail: Confirmed Attendees + Interactive Readiness Checklist */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              Confirmed Attendees ({outingRsvps.length})
            </h2>
            {outingRsvps.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                No RSVPs recorded yet. Reserve your spot to show up on the trailhead roster.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {outingRsvps.map((rsvp) => (
                  <li key={rsvp.id} className="py-2.5 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => onSelectMember(rsvp.userId)}
                      className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {rsvp.userName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Per-Outing Trailhead Readiness Checklist (Persisted Offline in localStorage) */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  Trailhead Readiness Checklist
                </h2>
                <p className="text-xs text-muted-foreground font-mono tabular-nums">
                  {checkedCount} of {checklist.length} packed · saved on this device
                </p>
              </div>
              {checkedCount > 0 && (
                <button
                  type="button"
                  onClick={resetChecklist}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="size-3" aria-hidden="true" />
                  Reset
                </button>
              )}
            </div>

            <ul className="divide-y divide-border">
              {checklist.map((item) => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="mt-1 size-4 rounded border-border accent-primary cursor-pointer shrink-0"
                      />
                      <span className="space-y-0.5 text-sm leading-snug">
                        <span
                          className={
                            isChecked ? 'line-through text-muted-foreground' : 'text-foreground'
                          }
                        >
                          {item.label}
                        </span>
                        <span className="block text-[11px] font-mono text-muted-foreground">
                          {item.category}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
