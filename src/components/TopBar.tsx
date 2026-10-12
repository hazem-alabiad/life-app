import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * The content container every screen sits in.
 *
 * Mobile is a single fluid column with 1rem margins; tablet opens up to 2rem;
 * desktop centres a 1200px column, matching the 12-column desktop layout.
 */
export const CONTAINER = 'mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12';

interface TopBarProps {
  label?: string;
  title?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
  /** Extra controls rendered beside the title, e.g. the view switcher. */
  children?: ReactNode;
}

export function TopBar({ label, title, onBack, right, className = '', children }: TopBarProps) {
  return (
    <header
      className={`sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl ${className}`}
    >
      <div
        className={`${CONTAINER} flex flex-wrap items-center gap-x-4 gap-y-1 py-3 pt-safe lg:min-h-16`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {onBack && (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="-ml-2 mr-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors active:opacity-70"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="min-w-0">
            {label && (
              <span className="block truncate text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
                {label}
              </span>
            )}
            {title && (
              <h1 className="truncate text-[1.0625rem] font-medium leading-6 text-ink">{title}</h1>
            )}
          </div>
        </div>

        {/*
         * A single instance of the view switcher. On a phone it wraps onto its
         * own full-width row under the title; from md it sits inline between
         * the title and the actions.
         */}
        {children && (
          <div className="order-last w-full pb-1 md:order-none md:w-auto md:flex-1 md:justify-center md:pb-0 flex">
            {children}
          </div>
        )}

        {right && <div className="flex flex-shrink-0 items-center gap-1.5">{right}</div>}
      </div>
    </header>
  );
}
