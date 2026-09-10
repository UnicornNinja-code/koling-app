import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { ConfirmModal } from "../components/ui/ConfirmModal.jsx";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Konfirmasi",
    cancelText: "Batal",
    type: "primary", // 'primary' | 'danger' | 'warning' | 'info'
    entityDetails: null,
  });

  const resolverRef = useRef(null);

  const confirm = useCallback(
    ({
      title = "Konfirmasi Tindakan",
      message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
      confirmText = "Ya, Lanjutkan",
      cancelText = "Batal",
      type = "primary",
      entityDetails = null,
    }) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setConfirmState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          type,
          entityDetails,
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCancel = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        entityDetails={confirmState.entityDetails}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
