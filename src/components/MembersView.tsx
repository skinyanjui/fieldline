import { useMemo, useState } from 'react';
import { Check, Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCommunity } from '@/src/context/CommunityContext';
import { DISCIPLINES, REGIONS } from '@/src/data/seedOrganizations';

interface MembersViewProps {
  onOpenProfile: () => void;
  onSelectMember: (uid: string) => void;
}

export function MembersView({ onOpenProfile, onSelectMember }: MembersViewProps) {
  const {
    user,
    profiles,
    memberships,
    follows,
    toggleFollowMember,
    signInWithGoogle,
  } = useCommunity();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  const followingSet = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(follows.filter((f) => f.followerId === user.uid).map((f) => f.targetUserId));
  }, [follows, user]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profiles.filter((member) => {
      if (regionFilter !== 'all' && member.homeRegion !== regionFilter) return false;
      if (disciplineFilter !== 'all' && !member.disciplines.includes(disciplineFilter)) return false;
      if (q) {
        const haystack = `${member.displayName} ${member.homeRegion} ${member.bio} ${member.disciplines.join(' ')}`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [profiles, searchQuery, regionFilter, disciplineFilter]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Community Roster
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Members &amp; Trail Partners
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Discover outdoor enthusiasts, chapter leaders, and land stewards across regions. Follow
            members to surface their trail reports in your Field Feed.
          </p>
        </div>

        {user ? (
          <Button
            variant="outline"
            onClick={onOpenProfile}
            className="h-10 px-5 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            Edit Your Profile
          </Button>
        ) : (
          <Button
            onClick={() => void signInWithGoogle()}
            className="h-10 px-5 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            Sign in to View Roster
          </Button>
        )}
      </div>

      {!user ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-4 max-w-xl mx-auto">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Member profiles are available to signed-in members.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign in with Google to browse fellow hikers, climbers, cyclists, surfers, and club
            organizers, follow trail partners, and share your own outdoor profile.
          </p>
          <div className="pt-2">
            <Button onClick={() => void signInWithGoogle()} className="h-10 px-6">
              Sign in with Google
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name, region, bio, or activity..."
                aria-label="Search community members"
                className="h-10 pl-9 pr-9 bg-card border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear member search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <Select
                value={disciplineFilter}
                onValueChange={(val) => {
                  if (val) setDisciplineFilter(val);
                }}
              >
                <SelectTrigger className="w-full h-10 bg-card border-border">
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
            </div>

            <div className="md:col-span-3">
              <Select
                value={regionFilter}
                onValueChange={(val) => {
                  if (val) setRegionFilter(val);
                }}
              >
                <SelectTrigger className="w-full h-10 bg-card border-border">
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
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'member' : 'members'} ·
              Following {followingSet.size}
            </span>
            {(searchQuery || regionFilter !== 'all' || disciplineFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRegionFilter('all');
                  setDisciplineFilter('all');
                }}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center space-y-2">
              <h3 className="font-serif text-xl font-medium text-foreground">
                No members match your search.
              </h3>
              <p className="text-sm text-muted-foreground">
                Try clearing filters to view the full community roster.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((member) => {
                const isSelf = member.uid === user.uid;
                const isFollowing = followingSet.has(member.uid);
                const clubCount = memberships.filter((m) => m.userId === member.uid).length;
                const followerCount = follows.filter((f) => f.targetUserId === member.uid).length;
                const initials = member.displayName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <article
                    key={member.uid}
                    className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onSelectMember(member.uid)}
                          className="flex items-center gap-3 text-left group cursor-pointer min-w-0"
                        >
                          <Avatar className="size-11 shrink-0">
                            <AvatarImage
                              src={member.photoURL}
                              alt={member.displayName}
                              referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h2 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {member.displayName}
                            </h2>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.homeRegion}
                              {isSelf ? ' · You' : ''}
                            </p>
                          </div>
                        </button>
                      </div>

                      {member.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {member.bio}
                        </p>
                      )}

                      {member.disciplines.length > 0 && (
                        <p className="text-xs text-primary leading-relaxed">
                          {member.disciplines.join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                      <p className="text-xs font-mono tabular-nums text-muted-foreground">
                        {clubCount} {clubCount === 1 ? 'club' : 'clubs'} · {followerCount}{' '}
                        {followerCount === 1 ? 'follower' : 'followers'}
                      </p>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectMember(member.uid)}
                          className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Profile
                        </Button>
                        {isSelf ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenProfile}
                            className="h-9 px-3.5 text-xs"
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant={isFollowing ? 'secondary' : 'default'}
                            size="sm"
                            onClick={() => void toggleFollowMember(member)}
                            className="h-9 px-3.5 text-xs"
                          >
                            {isFollowing ? (
                              <>
                                <Check className="size-3.5" aria-hidden="true" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="size-3.5" aria-hidden="true" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
