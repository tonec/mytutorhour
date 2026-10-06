import { expect, test } from '@playwright/test';

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
