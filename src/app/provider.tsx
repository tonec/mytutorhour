'use client';

import { I18nProvider } from '@heroui/react';
import { PropsWithChildren } from 'react';

export function ClientProviders({ lang, children }: PropsWithChildren<{ lang: string }>) {
  return <I18nProvider locale={lang}>{children}</I18nProvider>;
}
