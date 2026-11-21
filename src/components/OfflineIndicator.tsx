import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-border bg-secondary text-foreground px-6 py-2"
    >
      <div className="mx-auto max-w-[1280px] flex items-center justify-center gap-2 text-xs font-medium">
        <WifiOff className="size-3.5 text-primary shrink-0" aria-hidden="true" />
        <span>
          Offline trailhead mode — browsing cached directory organizations and outing schedules.
        </span>
      </div>
    </div>
  );
}
