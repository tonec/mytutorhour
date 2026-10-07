import { type Route, expect, test } from '@playwright/test';

test.describe('Login page', () => {
  test('shows the login form', async ({ page }) => {
    // Arrange & Act
    await page.goto('/login');

    // Assert
    await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('links to the sign-up page', async ({ page }) => {
    // Arrange
    await page.goto('/login');

    // Act
    await page.getByRole('link', { name: /sign up/i }).click();

    // Assert
    await expect(page).toHaveURL('/signup');
  });

  test('keeps text typed before the page finishes loading', async ({ page }) => {
    // Arrange: hold back the page's JavaScript so the form is guaranteed to be un-hydrated
    const heldScripts: Route[] = [];
    let released = false;
    await page.route('**/_next/static/**/*.js', async (route) => {
      if (released) await route.continue();
      else heldScripts.push(route);
    });
    await page.goto('/login', { waitUntil: 'commit' });

    // Act: type into the server-rendered form, then let React load and hydrate it (research R16)
    await page.getByLabel('Email').fill('emily.taylor@example.test');
    await page.getByLabel('Password').fill('not-a-real-password');
    released = true;
    await Promise.all(heldScripts.map((route) => route.continue()));
    await page.waitForFunction(() => {
      const email = document.getElementById('email');
      return email !== null && Object.keys(email).some((key) => key.startsWith('__reactProps'));
    });

    // Assert: the typed text survived hydration and is what gets submitted
    await expect(page.getByLabel('Email')).toHaveValue('emily.taylor@example.test');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Incorrect email or password.' })
    ).toBeVisible();
  });

  test('fits the viewport without horizontal scrolling', async ({ page }) => {
    // Arrange & Act
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible();

    // Assert
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('Protected routes', () => {
  test('redirects a signed-out visitor from the dashboard to login', async ({ page }) => {
    // Arrange & Act
    await page.goto('/dashboard');

    // Assert
    await expect(page).toHaveURL('/login');
  });
});
