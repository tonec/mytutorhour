'use client';

import { openModal } from '@/utils/modal-url';
import { MoreHorizontal } from 'lucide-react';
import type { StudentListItem } from '@/services/db/student/mappers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// The dialogs live in StudentTable and open from the URL; see utils/modal-url.
export function StudentActions({ student }: { student: StudentListItem }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-8 w-8 p-0" />}
        data-testid="student-actions"
        // Lets a closing dialog send focus back here (the menu has closed by then).
        data-student-id={student.id}
      >
        <span className="sr-only">Actions for {student.displayName}</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openModal('edit-student', student.id)}>
            Edit student
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openModal('edit-notes-student', student.id)}>
            View/edit notes
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
