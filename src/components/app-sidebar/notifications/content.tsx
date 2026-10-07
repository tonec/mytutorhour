import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Notification } from './types';

type Props = {
  notifications: Notification[];
};

export function NotificationsContent({ notifications }: Props) {
  return (
    <DropdownMenuContent className="w-80" side="top">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {notifications.map(({ id, avatar, fallback, text, time }) => (
        <DropdownMenuItem className="flex items-start gap-3" key={id}>
          <Avatar className="size-8">
            <AvatarImage alt="Avatar" src={avatar} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{text}</span>
            <span className="text-muted-foreground text-xs">{time}</span>
          </div>
        </DropdownMenuItem>
      ))}

      <DropdownMenuSeparator />

      <DropdownMenuItem className="text-muted-foreground hover:text-primary justify-center text-sm">
        View all notifications
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
