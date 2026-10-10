'use client';
import { ModalName, ModalState, closeModal, readModal } from '@/utils/modal-url';
import { type ComponentProps, type PropsWithChildren, createContext, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

type ModalContextType = ModalState & { close: () => void };

const ModalDataContext = createContext({} as ModalContextType);

interface Props {
  name: ModalName;
  title?: string;
  finalFocus?: ComponentProps<typeof DialogContent>['finalFocus'];
  returnFocusTo?: ({ data }: ModalState) => true | HTMLElement;
}

export function Modal({
  name,
  title,
  finalFocus,
  returnFocusTo,
  children,
}: PropsWithChildren<Props>) {
  const searchParams = useSearchParams();
  const modal = readModal(searchParams);

  const open = modal?.name === name;

  if (!open) return null;

  const onOpenChange = (open: boolean) => {
    if (!open) closeModal();
  };

  const value = {
    ...modal,
    close: closeModal,
  };

  const derivedFinalFocus = () => returnFocusTo?.(modal);

  return (
    <ModalDataContext.Provider value={value}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          data-testid={`${name}-modal`}
          finalFocus={finalFocus || derivedFinalFocus}
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
        >
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}

          {children}
        </DialogContent>
      </Dialog>
    </ModalDataContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalDataContext);
  if (!context) throw new Error('Modal data must be used within a <Modal />');
  return context;
}
