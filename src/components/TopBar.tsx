import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';
import { useCommunity } from '@/src/context/CommunityContext';

export type ActiveTab =
  | 'directory'
  | 'atlas'
  | 'feed'
  | 'outings'
  | 'members'
  | 'activity'
  | 'submit';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
  onViewMyProfile?: (uid: string) => void;
}

const PRIMARY_NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'directory', label: 'Directory' },
  { id: 'atlas', label: 'Atlas' },
  { id: 'feed', label: 'Field Feed' },
  { id: 'outings', label: 'Outings' },
  { id: 'members', label: 'Members' },
];

const MOBILE_NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  ...PRIMARY_NAV_ITEMS,
  { id: 'activity', label: 'Activity & Inbox' },
  { id: 'submit', label: 'Submit Club' },
];

export function TopBar({
  activeTab,
  onSelectTab,
  onOpenProfile,
  onViewMyProfile,
}: TopBarProps) {
  const { user, isAdmin, currentProfile, clubClaims, signingIn, signInWithGoogle, signOutUser } =
    useCommunity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingClaimsCount = isAdmin
    ? clubClaims.filter((c) => c.status === 'pending').length
    : 0;

  const initials = (currentProfile?.displayName || user?.displayName || 'FL')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('directory');
            setMobileOpen(false);
          }}
          className="font-serif text-xl font-semibold tracking-tight text-foreground whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Fieldline
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${
                  isActive
                    ? 'text-foreground after:absolute after:inset-x-0 after:-bottom-[17px] after:h-[2px] after:bg-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Install CTA (when supported) + Sign in / Member Menu + Mobile Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center">
            <PWAInstallButton compact />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-9 px-3 gap-2 rounded-md border-border bg-card text-foreground hover:bg-secondary whitespace-nowrap shrink-0"
                  />
                }
              >
                <Avatar className="size-5">
                  <AvatarImage
                    src={currentProfile?.photoURL || user.photoURL || ''}
                    alt={currentProfile?.displayName || 'Member'}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {currentProfile?.displayName || user.displayName || 'Member'}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentProfile?.displayName || user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentProfile?.homeRegion || 'National'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSelectTab('activity')}>
                  <span className="flex-1">Activity &amp; Inbox</span>
                  {pendingClaimsCount > 0 && (
                    <span className="text-xs font-mono tabular-nums text-primary">
                      {pendingClaimsCount}
                    </span>
                  )}
                </DropdownMenuItem>
                {onViewMyProfile && (
                  <DropdownMenuItem onClick={() => onViewMyProfile(user.uid)}>
                    View Profile &amp; Saved Clubs
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onOpenProfile}>Edit Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectTab('submit')}>
                  Submit an Organization
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => void signOutUser()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => void signInWithGoogle()}
              disabled={signingIn}
              className="h-9 px-4 text-sm font-medium rounded-md whitespace-nowrap shrink-0"
            >
              {signingIn ? 'Signing in...' : 'Sign in'}
            </Button>
          )}

          {/* Inline Mobile Navigation Toggle (No Modal/Sheet) */}
          <div className="md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="size-10"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile Primary"
          className="md:hidden border-t border-border bg-background px-6 py-3 flex flex-col gap-1"
        >
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 sm:hidden">
            <PWAInstallButton compact />
          </div>
        </nav>
      )}
    </header>
  );
}
