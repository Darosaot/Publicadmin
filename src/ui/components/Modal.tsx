import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Modals in this game are never dismissible — every one of them is a decision. */
  labelledBy?: string;
}

export function Modal({ title, eyebrow, children, footer, labelledBy = 'modal-title' }: ModalProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog so the keyboard lands on the decision, not behind it.
  useEffect(() => {
    surfaceRef.current?.focus();
  }, []);

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={surfaceRef}
      >
        <div className="modal__body">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="modal__title" id={labelledBy}>
            {title}
          </h2>
          {children}
        </div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
