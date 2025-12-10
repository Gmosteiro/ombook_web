import { useState } from 'react';
import { useRecursosPorPagina } from '../hooks/useRecursosPorPagina';
import { PaginaTematica } from '../types/types';
import { UploadResourceDialog } from './UploadResourceDialog';

interface Props {
  pagina: PaginaTematica;
  cursoId: number;
  jwtToken: string;
  onUploadRecurso: (nombre: string, file: File) => Promise<void>;
  onDeleteRecurso: (recursoId: number) => Promise<void>;
  onDownloadRecurso: (recursoId: number) => Promise<void>;
  isProfesor: boolean;
}

export const SeccionTematica = ({
  pagina,
  cursoId,
  jwtToken,
  onUploadRecurso,
  onDeleteRecurso,
  onDownloadRecurso,
  isProfesor
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleUpload = async (nombre: string, file: File) => {
    try {
      await onUploadRecurso(nombre, file);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error al subir el recurso:', error);
    }
  };

  const isHidden = pagina.fechaProgramada ? new Date(pagina.fechaProgramada) > new Date() : false;
  const { recursos, loading: loadingRecursos, error: errorRecursos } = useRecursosPorPagina(cursoId, pagina.id, jwtToken);



  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No programada";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`border rounded-lg mb-4 overflow-hidden ${isHidden ? 'bg-gray-100' : 'bg-white'}`}>
      {/* Cabecera de la sección */}
      <div
        className={`p-4 flex justify-between items-center cursor-pointer ${isHidden ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={isHidden ? 'opacity-70' : ''}>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{pagina.titulo}</h3>
            {isHidden && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                Oculto
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Creado el {formatDate(pagina.fechaCreacion)}</p>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Fecha programada: {formatDate(pagina.fechaProgramada)}</p>
            </div>
          </div>
        </div>
        <button
          className="p-2"
          title={isExpanded ? "Contraer sección" : "Expandir sección"}
          aria-label={isExpanded ? "Contraer sección" : "Expandir sección"}
        >
          <svg
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className={`p-4 border-t ${isHidden ? 'bg-gray-100' : ''}`}>
          {/* Descripción */}
          <div className="mb-6">
            <p className={`whitespace-pre-wrap ${isHidden ? 'text-gray-500' : 'text-gray-700'}`}>
              {pagina.contenido}
            </p>
          </div>
          {isHidden && isProfesor && (
            <div className="mb-4 ombook-alert ombook-alert-info">
              <div className="flex gap-2 items-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Esta sección está oculta para los estudiantes hasta {formatDate(pagina.fechaProgramada)}</p>
              </div>
            </div>
          )}

          {/* Lista de recursos */}
          <div>
            <h4 className="font-medium mb-2">Recursos</h4>
            {loadingRecursos ? (
              <div className="text-gray-400">Cargando recursos...</div>
            ) : errorRecursos ? (
              <div className="text-red-500">{errorRecursos}</div>
            ) : (
              <div className="space-y-2">
                {recursos.length === 0 ? (
                  <div className="text-gray-400">No hay recursos para esta sección.</div>
                ) : (
                  recursos.map((recurso) => (
                    <div
                      key={recurso.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm">{recurso.nombreOriginal}</span>
                        <span className="text-xs text-gray-500">({formatBytes(recurso.sizeBytes)})</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onDownloadRecurso(recurso.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Descargar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        {isProfesor && (
                          <button
                            onClick={() => onDeleteRecurso(recurso.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Subir nuevo recurso (solo para profesores) */}
            {isProfesor && (
              <>
                <div className="mt-4">
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar recurso
                  </button>
                </div>

                <UploadResourceDialog
                  isOpen={showUploadDialog}
                  onClose={() => setShowUploadDialog(false)}
                  onUpload={handleUpload}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};