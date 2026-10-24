import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Replaces window.confirm: a modal with a title, a message and two buttons. Rendered in a portal
// so it always covers the whole viewport, even from inside a card with a backdrop filter.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brown-900/40 px-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/80 bg-cream shadow-[0_24px_64px_rgba(42,29,20,0.25)]">
        <div className="px-6 pb-2 pt-5">
          <h2
            id="confirm-dialog-title"
            className="font-display text-base font-semibold text-brown-800"
          >
            {title}
          </h2>
          <p id="confirm-dialog-message" className="mt-2 text-sm text-brown-500">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5 pt-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-brown-500 hover:bg-brown-600/10 hover:text-brown-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium text-cream shadow shadow-brown-900/20 ${
              danger ? 'bg-terracotta hover:opacity-90' : 'bg-brown-600 hover:bg-brown-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
