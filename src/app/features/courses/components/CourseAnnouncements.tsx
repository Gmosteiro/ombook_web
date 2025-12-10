import { useState } from "react";
import { useLoaderData, useOutletContext, useSubmit, useRevalidator, type ActionFunctionArgs } from "react-router";
import { apiFetch } from "../../auth/utils/methods";
import type { Course } from "../types/types";
import { UserRole } from "~/features/auth/types";

type Anuncio = {
  id: number;
  titulo: string;
  contenido: string;
  fechaCreacion?: string;
  fechaProgramada?: string;
  nombreCreador?: string;
  apellidoCreador?: string;
  fotoPerfilUrl?: string;
  autorId?: number;
};

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { getValidJWTToken, getUserRole, getUserId } = await import("~/services/session.server");
  const { id } = params;
  const jwtToken = await getValidJWTToken(request);
  const userRole = await getUserRole(request);
  const currentUserId = await getUserId(request);

  try {

    const res = await apiFetch(`/cursos/${id}/anuncios`, {
      method: 'GET',
      secure: true,
      jwtToken
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const anuncios: Anuncio[] = await res.json();

    return new Response(
      JSON.stringify({
        anuncios,
        isProfesor: userRole === UserRole.PROFESOR,
        currentUserId
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("Error fetching announcements:", err);
    return new Response(
      JSON.stringify({
        anuncios: [] as Anuncio[],
        isProfesor: false,
        currentUserId: null
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { getValidJWTToken } = await import("~/services/session.server");

  const { id } = params;
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  const jwtToken = await getValidJWTToken(request);

  try {
    switch (actionType) {
      case "create": {
        const titulo = formData.get("titulo") as string;
        const contenido = formData.get("contenido") as string;
        const fechaProgramada = formData.get("fechaProgramada") as string;

        console.log("Creating announcement with data:", { titulo, contenido, fechaProgramada });
        const res = await apiFetch(`/cursos/${id}/anuncios`, {
          method: 'POST',
          secure: true,
          jwtToken,
          body: {
            titulo,
            contenido,
            ...(fechaProgramada && { fechaProgramada })
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, data: await res.json() };
      }

      case "edit": {
        const anuncioId = formData.get("anuncioId") as string;
        const titulo = formData.get("titulo") as string;
        const contenido = formData.get("contenido") as string;
        const fechaProgramada = formData.get("fechaProgramada") as string;

        const res = await apiFetch(`/cursos/${id}/anuncios/${anuncioId}`, {
          method: 'PUT',
          secure: true,
          jwtToken,
          body: {
            titulo,
            contenido,
            ...(fechaProgramada && { fechaProgramada })
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, data: await res.json() };
      }

      case "delete": {
        const anuncioId = formData.get("anuncioId") as string;
        const res = await apiFetch(`/cursos/${id}/anuncios/${anuncioId}`, {
          method: 'DELETE',
          secure: true,
          jwtToken
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, deletedId: Number(anuncioId) };
      }

      default:
        return { success: false, error: "Acción desconocida" };
    }
  } catch (err) {
    console.error(`Error in action ${actionType}:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export default function CourseAnnouncements() {
  const context = useOutletContext<{ course: Course }>();
  const course = context?.course;

  const loaderData = useLoaderData() as {
    anuncios: Anuncio[];
    isProfesor: boolean;
    currentUserId: number | null;
  };
  const anuncios = loaderData?.anuncios || [];
  const isProfesor = loaderData?.isProfesor || false;
  const currentUserId = loaderData?.currentUserId || null;
  const submit = useSubmit();
  const revalidator = useRevalidator();

  const [showNew, setShowNew] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAnuncioId, setEditingAnuncioId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canEditAnuncio = (anuncio: Anuncio) => isProfesor || currentUserId === anuncio.autorId;

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!course?.id || !titulo || !contenido) return;

    // Validar que la fecha programada no sea pasada
    if (fechaProgramada) {
      const selectedDate = new Date(fechaProgramada);
      const now = new Date();
      if (selectedDate < now) {
        setErrorMessage('La fecha programada no puede ser anterior a la fecha actual');
        return;
      }
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("actionType", "create");
    formData.append("titulo", titulo);
    formData.append("contenido", contenido);
    if (fechaProgramada) {
      formData.append("fechaProgramada", fechaProgramada);
    }

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: "createAnuncio",
    });

    setTimeout(() => {
      setTitulo('');
      setContenido('');
      setFechaProgramada('');
      setShowNew(false);
      setIsSubmitting(false);
      revalidator.revalidate();
    }, 500);
  };

  const handleEdit = async (anuncioId: number, updatedData: { titulo: string; contenido: string; fechaProgramada?: string }) => {
    if (!course?.id) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("actionType", "edit");
    formData.append("anuncioId", String(anuncioId));
    formData.append("titulo", updatedData.titulo);
    formData.append("contenido", updatedData.contenido);
    if (updatedData.fechaProgramada) {
      formData.append("fechaProgramada", updatedData.fechaProgramada);
    }

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `editAnuncio-${anuncioId}`,
    });

    setTimeout(() => {
      setEditingAnuncioId(null);
      setIsSubmitting(false);
      revalidator.revalidate();
    }, 500);
  };

  const handleDelete = async (anuncioId: number) => {
    if (!course?.id) return;
    if (!window.confirm('¿Eliminar anuncio?')) return;

    const formData = new FormData();
    formData.append("actionType", "delete");
    formData.append("anuncioId", String(anuncioId));

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `deleteAnuncio-${anuncioId}`,
    });

    setTimeout(() => {
      revalidator.revalidate();
    }, 500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="ombook-heading ombook-heading-lg ombook-text-green">Anuncios del Curso</h1>
        {isProfesor && (
          <button
            onClick={() => setShowNew(true)}
            className="ombook-btn ombook-btn-primary"
          >
            Nuevo Anuncio
          </button>
        )}
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="ombook-card mb-6">
          <div className="space-y-4">
            {errorMessage && (
              <div className="ombook-alert  bg-red-50 border-red-500">
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}
            <div>
              <label className="ombook-label">Título</label>
              <input
                type="text"
                className="ombook-input"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="ombook-label">Contenido</label>
              <textarea
                className="ombook-input"
                rows={4}
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="ombook-label">Fecha Programada (opcional)</label>
              <input
                type="datetime-local"
                className="ombook-input"
                value={fechaProgramada}
                onChange={e => setFechaProgramada(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="ombook-btn ombook-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear Anuncio'}
              </button>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="ombook-btn ombook-btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {anuncios.length === 0 && (
          <div className="ombook-card text-center ombook-text-gray py-8">
            <p>No hay anuncios.</p>
          </div>
        )}
        {anuncios.map(a => (
          <div key={a.id} className="ombook-card">
            {editingAnuncioId === a.id ? (
              <div className="space-y-2">
                <div>
                  <label htmlFor={`edit-titulo-${a.id}`} className="ombook-label">Título</label>
                  <input
                    id={`edit-titulo-${a.id}`}
                    defaultValue={a.titulo}
                    className="ombook-input"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-contenido-${a.id}`} className="ombook-label">Contenido</label>
                  <textarea
                    id={`edit-contenido-${a.id}`}
                    defaultValue={a.contenido}
                    rows={3}
                    className="ombook-input"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-fecha-${a.id}`} className="block text-sm font-medium mb-1">Fecha programada</label>
                  <input
                    id={`edit-fecha-${a.id}`}
                    type="datetime-local"
                    defaultValue={a.fechaProgramada ? new Date(a.fechaProgramada).toISOString().slice(0, 16) : ''}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setEditingAnuncioId(null)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const newTitulo = (document.getElementById(`edit-titulo-${a.id}`) as HTMLInputElement)?.value;
                      const newContenido = (document.getElementById(`edit-contenido-${a.id}`) as HTMLTextAreaElement)?.value;
                      const newFecha = (document.getElementById(`edit-fecha-${a.id}`) as HTMLInputElement)?.value;
                      if (newTitulo && newContenido) {
                        handleEdit(a.id, {
                          titulo: newTitulo,
                          contenido: newContenido,
                          ...(newFecha && { fechaProgramada: new Date(newFecha).toISOString() })
                        });
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    {a.nombreCreador ? a.nombreCreador.charAt(0) : 'A'}{a.apellidoCreador ? a.apellidoCreador.charAt(0) : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{(a.nombreCreador && a.apellidoCreador) ? `${a.nombreCreador} ${a.apellidoCreador}` : 'Usuario'}</div>
                      <div className="text-xs text-gray-500">
                        {a.fechaCreacion ? new Date(a.fechaCreacion).toLocaleString() : ''}
                        {a.fechaProgramada && ` • Programado: ${new Date(a.fechaProgramada).toLocaleString()}`}
                      </div>
                    </div>
                    {canEditAnuncio(a) && (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAnuncioId(a.id)} className="text-blue-500 text-sm hover:text-blue-700 font-medium">Editar</button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-500 text-sm hover:text-red-700 font-medium">Eliminar</button>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 font-medium">{a.titulo}</h3>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{a.contenido}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
