import { createClient } from '@/lib/supabase/server';
import AccountForm from './account-form';

export default async function Account() {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();

  return <AccountForm claims={claimsData?.claims ?? null} />;
}
