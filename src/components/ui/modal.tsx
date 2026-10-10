'use client';
import { ModalName, ModalState, closeModal, readModal } from '@/utils/modal-url';
import {
  type ComponentProps,
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

type ModalContextType = ModalState & { close: () => void };

const ModalDataContext = createContext({} as ModalContextType);

interface Props {
  name: ModalName;
  title?: string;
  returnFocusTo?: ComponentProps<typeof DialogContent>['finalFocus'];
}

export function Modal({ name, title, returnFocusTo, children }: PropsWithChildren<Props>) {
  const searchParams = useSearchParams();
  const modal = readModal(searchParams);
  const [shownModal, setShownModal] = useState(modal);

  const open = modal?.name === name;

  if (!open) return null;

  const onOpenChange = (open: boolean) => {
    if (!open) closeModal();
  };

  if (modal && (modal.name !== shownModal?.name || modal.data !== shownModal?.data)) {
    setShownModal(modal);
  }

  const value = {
    ...modal,
    close: closeModal,
  };

  return (
    <ModalDataContext.Provider value={value}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          data-testid={`${name}-modal`}
          finalFocus={returnFocusTo}
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
