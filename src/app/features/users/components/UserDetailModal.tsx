import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { UsuarioListaResponse } from '../../../routes/api.users';

interface UserDetailModalProps {
    open: boolean;
    user: UsuarioListaResponse | null;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, user, onClose }) => {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);

    // Close with ESC
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    // Focus trap
    useEffect(() => {
        if (!open) return;
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const trapFocus = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        dialog.addEventListener('keydown', trapFocus);
        firstElement?.focus();

        return () => dialog.removeEventListener('keydown', trapFocus);
    }, [open]);

    if (!open || !user) return null;

    const modalContent = (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === overlayRef.current) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-detail-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 id="user-detail-title" className="text-2xl font-semibold text-gray-900">
                        Detalles del Usuario
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                        aria-label="Cerrar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Información del usuario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                            <p className="text-lg text-gray-900">{user.nombre}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Apellido</label>
                            <p className="text-lg text-gray-900">{user.apellido}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Correo Electrónico</label>
                            <p className="text-lg text-gray-900">{user.correo}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Cédula</label>
                            <p className="text-lg text-gray-900">{user.cedula || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.rol === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-800' :
                                user.rol === 'PROFESOR' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {user.rol}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                                user.estado === 'INACTIVO' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {user.estado}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default UserDetailModal;
