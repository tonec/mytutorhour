import { BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function NotificationsTrigger() {
  return (
    <DropdownMenuTrigger
      render={
        <Button
          aria-label="Open notifications"
          className="rounded-full"
          size="icon"
          variant="ghost"
        />
      }
    >
      <BellIcon className="size-5" />
    </DropdownMenuTrigger>
  );
}
