'use client';

import { MoreHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import Link from 'next/link';
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
import { StudentNotesDialog } from './student-notes-dialog';
import { studentUrl } from './student-url';

export function StudentActions({ student }: { student: StudentListItem }) {
  const [notesOpen, setNotesOpen] = useState(false);
  // The menu has closed by the time the dialog does, so send focus back to its trigger.
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          data-testid="student-actions"
        >
          <span className="sr-only">Actions for {student.displayName}</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem render={<Link href={studentUrl(student.id)} />}>
              Edit student
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNotesOpen(true)}>View/edit notes</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <StudentNotesDialog
        student={student}
        open={notesOpen}
        onOpenChange={setNotesOpen}
        returnFocusTo={triggerRef}
      />
    </>
  );
}
