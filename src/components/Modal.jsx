import { useEffect, useRef } from 'react';

// handles focus trapping and the Escape key.
export default function Modal({ open, onClose, labelledBy, children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="modal-body">
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
