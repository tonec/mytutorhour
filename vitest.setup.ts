import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// `server-only` is resolved by Next's bundler, not Vite; stub it so server modules can load in tests
vi.mock('server-only', () => ({}));

// Testing Library only auto-cleans when `afterEach` is a global; we don't enable globals
afterEach(() => {
  cleanup();
});
