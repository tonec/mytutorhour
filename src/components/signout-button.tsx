'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/button';

export function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    router.refresh();
    router.push('/login');
  };

  return <Button onClick={handleSignOut}>Sign out</Button>;
}
