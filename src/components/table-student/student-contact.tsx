'use client';

import { AtSign, Phone } from 'lucide-react';
import { useRef } from 'react';
import type { StudentListItem } from '@/services/db/student/mappers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuCopyItem } from '../ui/dropdown-menu-copyitem';

export function StudentContact({ student }: { student: StudentListItem }) {
  // The menu has closed by the time the dialog does, so send focus back to its trigger.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { email, phone } = student;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          render={<Button variant="secondary" className="h-8 w-16 p-0" />}
          data-testid="student-contact"
        >
          <span className="sr-only">Actions for {student.displayName}</span>
          <Phone className="h-4 w-4" />
          <AtSign />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Contact</DropdownMenuLabel>
            {email ? <DropdownMenuCopyItem title="Email" text={email} /> : null}
            {email && phone && <span className="block h-1"></span>}
            {phone ? <DropdownMenuCopyItem title="Phone" text={phone} /> : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
