import { type Page, test as base, expect } from '@playwright/test';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../src/lib/supabase/database.types';

export type AdminClient = SupabaseClient<Database>;

export type Tutor = { id: string; email: string; page: Page };

type Fixtures = {
  // Secret-key client for creating users and seeding rows. Test-only: never used by app code.
  adminClient: AdminClient;
  // Creates a confirmed tutor and signs them in, on `page` or on a new browser context.
  newTutor: (options?: { page?: Page }) => Promise<Tutor>;
  // A fresh, signed-in tutor on the default page, so every test starts with an empty account.
  tutor: Tutor;
};

const PASSWORD = 'e2e-Password-1';

function localSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local.');
  }
  // These fixtures create and delete users with the secret key (`sb_secret_…`). Refuse to run against
  // anything but the local Supabase stack so the hosted project is never touched.
  const { hostname } = new URL(url);
  if (hostname !== '127.0.0.1' && hostname !== 'localhost') {
    throw new Error(
      `E2E fixtures only run against local Supabase, but NEXT_PUBLIC_SUPABASE_URL is ${hostname}.`
    );
  }
  return url;
}

export const test = base.extend<Fixtures>({
  adminClient: async ({}, provide) => {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'SUPABASE_SECRET_KEY is not set. Add the local "Secret key" (sb_secret_…) from `npx supabase status` to .env.local.'
      );
    }

    await provide(
      createClient<Database>(localSupabaseUrl(), secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    );
  },

  newTutor: async ({ adminClient, browser, page: defaultPage }, provide) => {
    const userIds: string[] = [];
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];

    await provide(async ({ page } = {}) => {
      const email = `tutor-${randomUUID()}@example.test`;
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
      });
      if (error || !data.user) throw error ?? new Error('Could not create the test tutor.');
      userIds.push(data.user.id);

      let tutorPage = page;
      if (!tutorPage) {
        // A second tutor needs their own cookies, so give them their own context. Use the same
        // viewport as the default page so mobile runs stay mobile.
        const context = await browser.newContext({ viewport: defaultPage.viewportSize() });
        contexts.push(context);
        tutorPage = await context.newPage();
      }

      await tutorPage.goto('/login');
      // Text typed before React hydrates the form can be reset to the default value (seen on
      // mobile WebKit), so retry until the login lands on the dashboard.
      const loginPage = tutorPage;
      await expect(async () => {
        await loginPage.getByLabel('Email').fill(email);
        await loginPage.getByLabel('Password').fill(PASSWORD);
        await expect(loginPage.getByLabel('Email')).toHaveValue(email);
        await loginPage.getByRole('button', { name: 'Log in' }).click();
        await expect(loginPage).toHaveURL('/dashboard', { timeout: 5_000 });
      }).toPass({ timeout: 30_000 });

      return { id: data.user.id, email, page: tutorPage };
    });

    await Promise.all(contexts.map((context) => context.close()));
    // Deleting the user cascades to all of their families, students and tags.
    await Promise.all(userIds.map((id) => adminClient.auth.admin.deleteUser(id)));
  },

  tutor: async ({ newTutor, page }, provide) => {
    await provide(await newTutor({ page }));
  },
});

export { expect };
