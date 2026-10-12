import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Hides the header when the sheet supplies its own. */
  bare?: boolean;
  footer?: ReactNode;
}

/**
 * Sheets are the only overlay pattern in the app: no drawers, no modals that
 * hide the thing you were looking at. Drag the handle down to dismiss.
 */
export function Sheet({ open, onClose, title, subtitle, children, bare = false, footer }: SheetProps) {
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  if (!open) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current == null) return;
    const dy = e.clientY - dragStart.current;
    if (dy > 0) setDragY(dy);
  };
  const onPointerUp = () => {
    if (dragY > 90) onClose();
    setDragY(0);
    dragStart.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 animate-fade bg-scrim backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        className="relative z-10 flex max-h-[92vh] w-full animate-rise flex-col overflow-hidden rounded-t-[1.75rem] border border-line bg-surface-2 shadow-[0_-12px_60px_-12px_var(--shadow-color)] sm:max-w-lg sm:rounded-[1.75rem]"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragStart.current == null ? 'transform 220ms cubic-bezier(0.22,1,0.36,1)' : undefined,
        }}
      >
        <div
          className="flex-shrink-0 cursor-grab touch-none pt-3"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-surface-4" aria-hidden />
        </div>

        {!bare && (
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-[1.1875rem] font-medium leading-6 text-ink">{title}</h2>
              )}
              {subtitle && <p className="mt-1 text-[0.75rem] text-ink-3">{subtitle}</p>}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="-mr-1 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors active:opacity-70"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2">
          {children}
        </div>

        {footer && (
          <div className="flex-shrink-0 border-t border-line bg-surface-2 px-5 pb-6 pt-4 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
