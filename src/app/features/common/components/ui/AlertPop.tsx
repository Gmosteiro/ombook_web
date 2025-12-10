import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

export type AlertType = 'message' | 'warning' | 'error';

export interface AlertPopProps {
    open: boolean;
    type?: AlertType;
    title?: string;
    message: React.ReactNode;
    buttonLabel?: string;
    onClose: () => void;
    disableBackdropClose?: boolean;
    disableEscapeKey?: boolean;
    showIcon?: boolean;
    fullWidthButton?: boolean; // si no se pasa: message => false, warning/error => true
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
}

const THEME = {
    message: {
        accent: 'ombook-bg-light',
        text: 'text-slate-600',
        btn: 'ombook-btn ombook-btn-primary',
        iconBg: 'ombook-bg-light',
        iconColor: 'ombook-text-green',
    },
    warning: {
        accent: 'bg-amber-100',
        text: 'text-slate-600',
        btn: 'bg-amber-500 hover:bg-amber-600 text-white',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
    },
    error: {
        accent: 'bg-red-100',
        text: 'text-slate-600',
        btn: 'bg-red-600 hover:bg-red-500 text-white',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
    },
} as const;

const defaultTitle = (t: AlertType) =>
    t === 'warning' ? 'Advertencia' : t === 'error' ? 'Error' : 'Mensaje';

const defaultButton = (t: AlertType) =>
    t === 'warning' ? 'Entendido' : t === 'error' ? 'Okay' : 'OK';

const AlertPop: React.FC<AlertPopProps> = ({
    open,
    type = 'message',
    title,
    message,
    buttonLabel,
    onClose,
    disableBackdropClose = false,
    disableEscapeKey = false,
    showIcon = true,
    fullWidthButton,
    ariaLabelledBy,
    ariaDescribedBy,
}) => {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const actionBtnRef = useRef<HTMLButtonElement | null>(null);

    const t = THEME[type];
    const resolvedTitle = title ?? defaultTitle(type);
    const resolvedBtn = buttonLabel ?? defaultButton(type);
    const useFullWidth = fullWidthButton ?? (type !== 'message');

    const titleId = useMemo(
        () => ariaLabelledBy || 'alert-pop-title',
        [ariaLabelledBy]
    );
    const descriptionId = useMemo(
        () => ariaDescribedBy || 'alert-pop-description',
        [ariaDescribedBy]
    );

    // ESC para cerrar
    useEffect(() => {
        if (!open || disableEscapeKey) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
    }, [open, disableEscapeKey, onClose]);

    // focus trap + bloquear scroll
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';

        const to = setTimeout(() => actionBtnRef.current?.focus(), 0);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'));
            if (list.length === 0) return;

            const first = list[0];
            const last = list[list.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            } else if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            clearTimeout(to);
            document.documentElement.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [open]);

    if (!open) return null;

    const content = (
        <div
            ref={overlayRef}
            role="presentation"
            onMouseDown={(e) => {
                if (disableBackdropClose) return;
                if (e.target === overlayRef.current) onClose();
            }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={resolvedTitle ? titleId : undefined}
                aria-describedby={descriptionId}
                className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="px-6 pt-6 pb-4 text-center">
                    <div aria-hidden="true" className={`w-20 h-2.5 mx-auto mb-3 rounded-full ${t.accent}`} />
                    {showIcon && (
                        <div className={`mx-auto mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full ${t.iconBg}`}>
                            {type === 'error' && (
                                <svg className={`w-7 h-7 ${t.iconColor}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 8v5m0 3.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            )}
                            {type === 'warning' && (
                                <svg className={`w-7 h-7 ${t.iconColor}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 9v4m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            {type === 'message' && (
                                <svg className={`w-7 h-7 ${t.iconColor}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8h.01M11 12h2v4h-2z" fill="currentColor" />
                                </svg>
                            )}
                        </div>
                    )}

                    {resolvedTitle && (
                        <h2 id={titleId} className="mb-2 text-2xl font-bold text-slate-900">
                            {resolvedTitle}
                        </h2>
                    )}
                    <div id={descriptionId} className={`mx-3 text-base leading-6 ${t.text}`}>
                        {message}
                    </div>
                </div>

                {useFullWidth ? (
                    <div className="p-5">
                        <button
                            ref={actionBtnRef}
                            type="button"
                            onClick={onClose}
                            className={`w-full py-3.5 rounded-xl font-semibold ${t.btn} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20`}
                        >
                            {resolvedBtn}
                        </button>
                    </div>
                ) : (
                    <div className="px-6 pb-5 text-right">
                        <button
                            ref={actionBtnRef}
                            type="button"
                            onClick={onClose}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold ${t.btn} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20`}
                        >
                            {resolvedBtn}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const container = typeof document !== 'undefined' ? document.body : null;
    return container ? ReactDOM.createPortal(content, container) : content;
};

export default AlertPop;