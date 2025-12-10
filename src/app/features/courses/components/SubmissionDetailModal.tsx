import { useEffect, useState } from "react";
import type { Entrega, EntregaDetalle } from "../types/types";

import { formatDateDisplay } from "~/features/common/utils/Utils";

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Entrega | null;
  cursoId?: number;
  tareaId?: number;
  jwtToken: string;
}

export function SubmissionDetailModal({ isOpen, onClose, submission, cursoId, tareaId, jwtToken }: SubmissionDetailModalProps) {
  const [detailedSubmission, setDetailedSubmission] = useState<EntregaDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && submission && cursoId && tareaId) {
      fetchSubmissionDetails();
    }
  }, [isOpen, submission, cursoId, tareaId]);

  const fetchSubmissionDetails = async () => {
    if (!submission || !cursoId || !tareaId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cursos/${cursoId}/tareas/${tareaId}/entregas/${submission.id}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const data: EntregaDetalle = await response.json();
        setDetailedSubmission(data);
      } else {
        setError('Error al cargar los detalles de la entrega');
      }
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalles de la Entrega</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        {loading && <div className="text-center">Cargando...</div>}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {detailedSubmission && (
          <div className="space-y-2">
            <div><strong>Archivo:</strong> {detailedSubmission.nombreArchivo}</div>
            <div><strong>Fecha de envío:</strong> {formatDateDisplay(detailedSubmission.fechaEnvio)}</div>
            <div><strong>Estado:</strong> {detailedSubmission.estado}</div>
            <div><strong>Calificación:</strong> {detailedSubmission.calificacion !== undefined ? detailedSubmission.calificacion : '-'}</div>
            <div><strong>Comentario:</strong> {detailedSubmission.comentario || '-'}</div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="ombook-btn ombook-btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}