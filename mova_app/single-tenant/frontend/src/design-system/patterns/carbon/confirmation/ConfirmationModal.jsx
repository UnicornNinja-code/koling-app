import React from "react";
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@carbon/react";

/**
 * Enterprise Carbon ConfirmationModal Pattern (Generic Carbon Pattern)
 * Modal dialog for dangerous or irreversible enterprise actions
 */
export function ConfirmationModal({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed? This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  isLoading = false,
  children,
}) {
  return (
    <ComposedModal
      open={isOpen}
      onClose={onClose}
      size="sm"
      preventCloseOnClickOutside
      danger={danger}
    >
      <ModalHeader title={title} label={danger ? "Caution Required" : "Confirmation"} />
      <ModalBody>
        <p className="cds-body-compact-01 text-[var(--cds-text-secondary)]">
          {description}
        </p>
        {children}
      </ModalBody>
      <ModalFooter
        primaryButtonText={isLoading ? "Processing..." : confirmLabel}
        secondaryButtonText={cancelLabel}
        primaryButtonDisabled={isLoading}
        danger={danger}
        onRequestSubmit={onConfirm}
        onRequestClose={onClose}
      />
    </ComposedModal>
  );
}
