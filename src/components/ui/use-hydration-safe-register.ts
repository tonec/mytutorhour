'use client';

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

// Like `register`, but keeps text typed before React hydrated the page. When react-hook-form
// registers an input it writes the field's default value ('') into it, which would wipe
// anything a tutor typed while the page was still loading (research R16).
export function useHydrationSafeRegister() {
  const { register, setValue } = useFormContext();
  const restored = useRef(new Map<string, string>());

  // Put the typed text into form state once every component has subscribed. Watchers
  // (useWatch, a parent form's watch) subscribe after the ref below runs, and setValue only
  // notifies on a real change, so it must happen here rather than in the ref. React flushes
  // passive effects in one synchronous pass, so this microtask runs after all of them.
  useEffect(() => {
    if (restored.current.size === 0) return;
    const values = [...restored.current];
    restored.current.clear();
    queueMicrotask(() => {
      for (const [name, value] of values) setValue(name, value, { shouldDirty: true });
    });
  });

  return (name: string) => {
    const registration = register(name);

    return {
      ...registration,
      ref: (element: FieldElement | null) => {
        const typed = element?.value;
        registration.ref(element);
        if (element && typed && element.value !== typed) {
          // Put the text straight back so the field never shows empty.
          element.value = typed;
          restored.current.set(name, typed);
        }
      },
    };
  };
}
