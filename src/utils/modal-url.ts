// Page-level dialogs are opened by the query string (?modal=<name>&data=<value>), so they can be
// linked to, survive a refresh and close on Back. The history calls are shallow: Next.js syncs
// them with useSearchParams without a server round trip.

const MODAL_NAMES = ['student-add', 'student-edit', 'student-notes'] as const;

export type ModalName = (typeof MODAL_NAMES)[number];
export type ModalState = { name: ModalName; data?: string };

const isModalName = (value: string | null): value is ModalName =>
  MODAL_NAMES.includes(value as ModalName);

// Unknown names open nothing, so a mistyped or stale link just shows the page.
export function readModal(params: URLSearchParams): ModalState | null {
  const name = params.get('modal');
  if (!isModalName(name)) return null;
  return { name, data: params.get('data') ?? undefined };
}

// The current URL with the modal params set (or, with no modal, removed); other params are kept.
export function modalUrl(current: URL, modal: ModalState | null): string {
  const params = new URLSearchParams(current.search);
  params.delete('modal');
  params.delete('data');
  if (modal) {
    params.set('modal', modal.name);
    if (modal.data) params.set('data', modal.data);
  }
  const search = params.toString();
  return `${current.pathname}${search ? `?${search}` : ''}${current.hash}`;
}

// Pushed, so Back closes the dialog.
export function openModal(name: ModalName, data?: string) {
  window.history.pushState(null, '', modalUrl(new URL(window.location.href), { name, data }));
}

// Replaced, so the closed state doesn't add another history entry.
export function closeModal() {
  window.history.replaceState(null, '', modalUrl(new URL(window.location.href), null));
}
