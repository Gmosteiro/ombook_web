import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (nombre: string, file: File) => Promise<void>;
}

export const UploadResourceDialog = ({ isOpen, onClose, onUpload }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload('', file);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex min-h-screen items-center justify-center">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"></div>

          <div className="relative w-full max-w-lg transform rounded-lg bg-white p-6 text-left shadow-xl transition-all sm:w-full sm:max-w-lg">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="ombook-heading ombook-heading-md">Subir Recurso</h2>



              <div>
                <label htmlFor="archivo" className="ombook-label">
                  Archivo
                </label>
                <input
                  type="file"
                  id="archivo"
                  accept=".txt,.doc,.docx,.pdf,.zip,.rar"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      const maxSize = 10 * 1024 * 1024; // 10MB
                      if (selectedFile.size > maxSize) {
                        alert('El archivo supera el tamaño máximo de 10MB');
                        e.target.value = '';
                        setFile(null);
                        return;
                      }
                      setFile(selectedFile);
                    }
                  }}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:ombook-bg-green file:text-white hover:file:ombook-bg-green-dark cursor-pointer"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Formatos permitidos: .txt, .doc, .docx, .pdf, .zip, .rar (máx. 10MB)
                </p>
              </div>

              <div className="mt-5 flex flex-row-reverse gap-3">
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="ombook-btn ombook-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Subiendo...
                    </span>
                  ) : (
                    'Subir Recurso'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="ombook-btn ombook-btn-outline disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};