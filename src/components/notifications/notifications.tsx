'use client';

import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { NotificationsContent } from './content';
import { NotificationsTrigger } from './trigger';
import type { Notification } from './types';

export function Notifications({ notifications }: { notifications: Notification[] }) {
  return (
    <DropdownMenu>
      <NotificationsTrigger />
      <NotificationsContent notifications={notifications} />
    </DropdownMenu>
  );
}
