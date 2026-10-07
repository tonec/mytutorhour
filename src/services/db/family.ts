import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type FamilyListItem = {
  id: string;
  name: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  studentCount: number;
};

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, 'en-GB', { sensitivity: 'base' });

// Throws with the error code only, so no family data reaches logs or error pages.
function loadFailed(what: string, code: string | undefined): never {
  throw new Error(`Could not load ${what} (${code ?? 'unknown'}).`);
}

// The signed-in tutor's families, alphabetically (RLS limits rows to their own).
export async function listFamilies(): Promise<FamilyListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('families')
    .select('id, name, contact_name, contact_email, contact_phone, students(count)');

  if (error) loadFailed('families', error.code);

  return data
    .map((family) => ({
      id: family.id,
      name: family.name,
      contactName: family.contact_name,
      contactEmail: family.contact_email ?? undefined,
      contactPhone: family.contact_phone ?? undefined,
      studentCount: family.students[0]?.count ?? 0,
    }))
    .toSorted(byName);
}
