'use client';

import { PropsWithChildren } from 'react';
import { I18nProvider } from '@heroui/react';

export function ClientProviders({ lang, children }: PropsWithChildren<{ lang: string }>) {
  return <I18nProvider locale={lang}>{children}</I18nProvider>;
}
