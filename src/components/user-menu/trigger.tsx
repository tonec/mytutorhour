import { User } from 'lucide-react';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';

export function UserMenuTrigger() {
  return (
    <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
      <User />
    </DropdownMenuTrigger>
  );
}
