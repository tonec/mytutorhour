import type { Tables } from '@/lib/supabase/database.types';

// The columns selected from a family when loading students (see STUDENT_SELECT in data.ts).
type FamilyContactRow = Pick<
  Tables<'families'>,
  'id' | 'name' | 'contact_name' | 'contact_email' | 'contact_phone'
>;

export type StudentRow = Tables<'students'> & {
  families: FamilyContactRow | null;
  student_tags: { tags: Pick<Tables<'tags'>, 'id' | 'name'> | null }[];
};

export type StudentTag = { id: string; name: string };

export type StudentListItem = {
  id: string;
  type: 'adult' | 'child';
  displayName: string;
  familyId?: string;
  familyName?: string;
  notes?: string;
  subject: string;
  email?: string;
  phone?: string;
  level: string;
  tags: StudentTag[];
};

export type StudentContact = {
  // Children use their family's contact; adults use their own (FR-008, FR-010).
  source: 'family' | 'student';
  name?: string;
  email?: string;
  phone?: string;
  isEmpty: boolean;
};

export type StudentDetail = {
  id: string;
  type: 'adult' | 'child';
  firstName: string;
  lastName?: string;
  familyId?: string;
  familyName?: string;
  subject: string;
  level: string;
  examBoard?: string;
  notes?: string;
  email?: string;
  phone?: string;
  tagIds: string[];
  contact: StudentContact;
};

const orUndefined = (value: string | null) => value ?? undefined;

function tagsOf(row: StudentRow): StudentTag[] {
  return row.student_tags.flatMap(({ tags }) => (tags ? [{ id: tags.id, name: tags.name }] : []));
}

function displayName(row: StudentRow) {
  return row.first_name;
}

function contactOf(row: StudentRow): StudentContact {
  const family = row.families;
  const email = orUndefined(family?.contact_email ?? null);
  const phone = orUndefined(family?.contact_phone ?? null);
  return {
    source: 'family',
    name: family?.contact_name,
    email,
    phone,
    isEmpty: !email && !phone,
  };
}

// Children are contacted through their family (FR-008); adults use their own details (FR-010).
function listContactOf(row: StudentRow): Pick<StudentListItem, 'email' | 'phone'> {
  if (row.type === 'child') {
    const { email, phone } = contactOf(row);
    return { email, phone };
  }
  return { email: orUndefined(row.email), phone: orUndefined(row.phone) };
}

export function toStudentListItem(row: StudentRow): StudentListItem {
  return {
    id: row.id,
    type: row.type,
    displayName: displayName(row),
    familyId: orUndefined(row.family_id),
    familyName: row.families?.name,
    notes: orUndefined(row.notes),
    ...listContactOf(row),
    subject: row.subject,
    level: row.level,
    tags: tagsOf(row),
  };
}

export function toStudentDetail(row: StudentRow): StudentDetail {
  return {
    id: row.id,
    type: row.type,
    firstName: row.first_name,
    lastName: orUndefined(row.last_name),
    familyId: orUndefined(row.family_id),
    familyName: row.families?.name,
    subject: row.subject,
    level: row.level,
    examBoard: orUndefined(row.exam_board),
    notes: orUndefined(row.notes),
    email: orUndefined(row.email),
    phone: orUndefined(row.phone),
    tagIds: tagsOf(row).map((tag) => tag.id),
    contact: contactOf(row),
  };
}
