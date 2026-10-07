'use client';

import { type RefObject } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyForm, type SavedFamily } from '../form-family/form';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (family: SavedFamily) => void;
  // Where focus goes when the dialog closes (the family picker).
  returnFocusTo?: RefObject<HTMLElement | null>;
};

export function FamilyDialog({ open, onOpenChange, onCreated, returnFocusTo }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="family-dialog" finalFocus={returnFocusTo}>
        <DialogHeader>
          <DialogTitle>Add family</DialogTitle>
        </DialogHeader>
        {/* Remounted on each open, so the form starts empty every time. */}
        {open ? <FamilyForm intent="inline" onSaved={onCreated} /> : null}
      </DialogContent>
    </Dialog>
  );
}
