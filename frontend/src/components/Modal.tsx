import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`.trim()}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      aria-labelledby={titleId}
    >
      <div className="modal__header">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          ×
        </button>
      </div>
      {open ? children : null}
    </dialog>
  );
}
