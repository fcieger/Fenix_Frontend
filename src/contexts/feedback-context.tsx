'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type SuccessOptions = {
  title?: string;
  message?: string;
  onClose?: () => void;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type FeedbackContextType = {
  openSuccess: (options?: SuccessOptions) => void;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  close: () => void;
};

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [opts, setOpts] = useState<SuccessOptions | ConfirmOptions>({});
  const [modalType, setModalType] = useState<'success' | 'confirm'>('success');
  const [confirmResolve, setConfirmResolve] = useState<((value: boolean) => void) | null>(null);

  const openSuccess = useCallback((options?: SuccessOptions) => {
    setOpts(options || {});
    setModalType('success');
    setIsOpen(true);
  }, []);

  const openConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOpts(options);
    setModalType('confirm');
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setConfirmResolve(() => resolve);
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (opts?.onClose) opts.onClose();
  }, [opts]);

  const handleConfirm = useCallback(() => {
    if (confirmResolve) {
      confirmResolve(true);
      setConfirmResolve(null);
    }
    if ((opts as ConfirmOptions)?.onConfirm) (opts as ConfirmOptions).onConfirm();
    setIsOpen(false);
  }, [confirmResolve, opts]);

  const handleCancel = useCallback(() => {
    if (confirmResolve) {
      confirmResolve(false);
      setConfirmResolve(null);
    }
    if ((opts as ConfirmOptions)?.onCancel) (opts as ConfirmOptions).onCancel();
    setIsOpen(false);
  }, [confirmResolve, opts]);

  const value = useMemo(() => ({ openSuccess, openConfirm, close }), [openSuccess, openConfirm, close]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 240 }}
              className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200"
            >
              {modalType === 'success' ? (
                <div className="p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-green-600">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28-2.03a.75.75 0 0 0-1.06-1.06l-5.47 5.47-2.19-2.19a.75.75 0 1 0-1.06 1.06l2.72 2.72c.293.293.768.293 1.06 0l6-6Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center">{(opts as SuccessOptions)?.title || 'Salvo com sucesso'}</h3>
                  <p className="mt-2 text-center text-slate-600 text-sm">{(opts as SuccessOptions)?.message || 'Operação concluída com êxito.'}</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 transition-colors"
                      onClick={close}
                    >
                      Ok
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center">{(opts as ConfirmOptions)?.title || 'Confirmar ação'}</h3>
                  <p className="mt-2 text-center text-slate-600 text-sm">{(opts as ConfirmOptions)?.message}</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-5 py-2 transition-colors font-medium"
                      onClick={handleCancel}
                    >
                      {(opts as ConfirmOptions)?.cancelText || 'Cancelar'}
                    </button>
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-5 py-2 transition-colors font-medium"
                      onClick={handleConfirm}
                    >
                      {(opts as ConfirmOptions)?.confirmText || 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
};

export function useFeedback(): FeedbackContextType {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
  return ctx;
}


