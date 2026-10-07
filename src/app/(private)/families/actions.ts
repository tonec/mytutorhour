'use server';

import { routes } from '@/config/routes';
import { caughtErrorToState, dbErrorToState, formPayload } from '@/utils/action-errors';
import { type ActionState, toFormState } from '@/utils/form';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { familySchema } from './schema';

const FIELDS = ['id', 'name', 'contactName', 'contactEmail', 'contactPhone', 'intent'] as const;

export async function saveFamily(_state: ActionState, formData: FormData): Promise<ActionState> {
  const payload = formPayload(formData, FIELDS);
  let familyId: string;

  try {
    const family = familySchema.parse(payload);
    const supabase = await createClient();
    const row = {
      name: family.name,
      contact_name: family.contactName,
      contact_email: family.contactEmail ?? null,
      contact_phone: family.contactPhone ?? null,
    };

    const { data, error } = family.id
      ? await supabase.from('families').update(row).eq('id', family.id).select('id').maybeSingle()
      : await supabase.from('families').insert(row).select('id').single();

    // No row back from an update means it's missing or another tutor's.
    if (error || !data) return dbErrorToState(error ?? { code: 'P0002' }, 'saveFamily', payload);
    familyId = data.id;

    // Added from the student form's dialog: hand the new family back instead of navigating.
    if (family.intent === 'inline') {
      revalidatePath(routes.families.url);
      return toFormState('SUCCESS', 'Family added.', {
        id: familyId,
        name: family.name,
        contactName: family.contactName,
        contactEmail: family.contactEmail ?? '',
        contactPhone: family.contactPhone ?? '',
      });
    }
  } catch (error) {
    return caughtErrorToState(error, 'saveFamily', payload);
  }

  // Children show their family's contact details, so their pages change too.
  revalidatePath(routes.families.url, 'layout');
  revalidatePath(routes.students.url, 'layout');
  redirect(`${routes.families.url}/${familyId}`);
}
