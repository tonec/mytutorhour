'use client';

import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { FamilyListItem } from '@/services/db/family';
import type { SavedFamily } from '@/components/form-family/form';
import { ComboboxField } from '@/components/ui/combobox-field';
import { FamilyDialog } from './family-dialog';

type Props = {
  families: FamilyListItem[];
  label: string;
  onFamilyCreated: (family: FamilyListItem) => void;
};

export function FamilyPicker({ families, label, onFamilyCreated }: Props) {
  const { setValue } = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const pickerRef = useRef<HTMLElement | null>(null);

  const handleCreated = (family: SavedFamily) => {
    onFamilyCreated({ ...family, studentCount: 0 });
    setValue('familyId', family.id, { shouldValidate: true, shouldDirty: true });
    setDialogOpen(false);
  };

  return (
    <div
      ref={(element) => {
        pickerRef.current = element?.querySelector('input') ?? null;
      }}
    >
      <ComboboxField
        name="familyId"
        label={label}
        data-testid="family-picker"
        options={families.map((family) => ({
          value: family.id,
          label: `${family.name} (${family.contactName})`,
        }))}
        placeholder="Choose a family"
        emptyText="No families yet"
        extraOption={{
          label: 'Add new family…',
          onSelect: () => setDialogOpen(true),
          testId: 'family-picker-add-new',
        }}
      />
      <FamilyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
        returnFocusTo={pickerRef}
      />
    </div>
  );
}
