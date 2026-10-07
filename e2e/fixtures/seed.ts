import type { AdminClient } from './tutor';

// Seed helpers insert rows directly with the secret-key client and an explicit tutor_id, so
// list, search, filter and tag tests don't depend on other stories' screens.

type SeedFamily = {
  name: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
};

type SeedStudent = {
  type: 'adult' | 'child';
  firstName: string;
  lastName?: string;
  familyId?: string;
  subject: string;
  level: string;
  email?: string;
  phone?: string;
};

function fail(what: string, error: { code?: string } | null): never {
  // Only the code: seeded values are test data, but keep to the no-values-in-logs habit.
  throw new Error(`Could not seed ${what} (${error?.code ?? 'no row returned'}).`);
}

export async function seedFamily(admin: AdminClient, tutorId: string, family: SeedFamily) {
  const { data, error } = await admin
    .from('families')
    .insert({
      tutor_id: tutorId,
      name: family.name,
      contact_name: family.contactName,
      contact_email: family.contactEmail ?? null,
      contact_phone: family.contactPhone ?? null,
    })
    .select('id')
    .single();
  if (error || !data) fail('a family', error);
  return data.id;
}

export async function seedStudent(admin: AdminClient, tutorId: string, student: SeedStudent) {
  const { data, error } = await admin
    .from('students')
    .insert({
      tutor_id: tutorId,
      type: student.type,
      first_name: student.firstName,
      last_name: student.lastName ?? null,
      family_id: student.familyId ?? null,
      subject: student.subject,
      level: student.level,
      email: student.email ?? null,
      phone: student.phone ?? null,
    })
    .select('id')
    .single();
  if (error || !data) fail('a student', error);
  return data.id;
}

export async function seedTag(
  admin: AdminClient,
  tutorId: string,
  name: string,
  studentIds: string[] = []
) {
  const { data, error } = await admin
    .from('tags')
    .insert({ tutor_id: tutorId, name })
    .select('id')
    .single();
  if (error || !data) fail('a tag', error);

  if (studentIds.length > 0) {
    const { error: linkError } = await admin.from('student_tags').insert(
      studentIds.map((studentId) => ({
        student_id: studentId,
        tag_id: data.id,
        tutor_id: tutorId,
      }))
    );
    if (linkError) fail('tag links', linkError);
  }

  return data.id;
}
