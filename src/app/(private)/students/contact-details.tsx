import { type ReactNode } from 'react';

type Props = {
  heading: string;
  contact: { name?: string; email?: string; phone?: string };
  // Shown when there's no email or phone to contact.
  emptyMessage: ReactNode;
};

// Read-only contact block on the student form: the family's details for a child (FR-008).
export function ContactDetails({ heading, contact, emptyMessage }: Props) {
  const isEmpty = !contact.email && !contact.phone;

  return (
    <section
      data-testid="contact-details"
      aria-labelledby="contact-details-heading"
      className="bg-muted/50 grid gap-2 rounded-md p-3 text-sm"
    >
      <h2 id="contact-details-heading" className="font-medium">
        {heading}
      </h2>
      {contact.name ? <p>{contact.name}</p> : null}
      {isEmpty ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          {contact.email ? (
            <>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="min-w-0 break-words">{contact.email}</dd>
            </>
          ) : null}
          {contact.phone ? (
            <>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{contact.phone}</dd>
            </>
          ) : null}
        </dl>
      )}
    </section>
  );
}
