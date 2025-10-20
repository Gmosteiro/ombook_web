import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

export interface ConfirmationDialogProps {
    open: boolean;
    title?: string;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    disableBackdropClose?: boolean;
    disableEscapeKey?: boolean;
    loading?: boolean;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    title = 'Confirmar',
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    disableBackdropClose = false,
    disableEscapeKey = false,
    loading = false,
    ariaLabelledBy,
    ariaDescribedBy,
}) => {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);

    const titleId = useMemo(
        () => ariaLabelledBy || 'confirmation-dialog-title',
        [ariaLabelledBy]
    );
    const descriptionId = useMemo(
        () => ariaDescribedBy || 'confirmation-dialog-description',
        [ariaDescribedBy]
    );

    // Close with ESC
    useEffect(() => {
        if (!open || disableEscapeKey) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onCancel();
            }
        };
        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
    }, [open, disableEscapeKey, onCancel]);

    // Focus trap + bloquear scroll
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';

        const to = setTimeout(() => confirmBtnRef.current?.focus(), 0);

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
                if (e.target === overlayRef.current) onCancel();
            }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={descriptionId}
                className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="px-6 pt-6 pb-2 text-center">
                    <div aria-hidden="true" className="w-20 h-2.5 mx-auto mb-3 rounded-full bg-blue-100" />
                    {title && (
                        <h2 id={titleId} className="mb-3 text-2xl font-bold text-slate-900">
                            {title}
                        </h2>
                    )}
                    <div id={descriptionId} className="mx-3 mb-4 text-base leading-6 text-slate-500">
                        {message}
                    </div>
                </div>

                <div className="flex w-full">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3.5 bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3.5 bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    const container = typeof document !== 'undefined' ? document.body : null;
    return container ? ReactDOM.createPortal(content, container) : content;
};

export default ConfirmationDialog;