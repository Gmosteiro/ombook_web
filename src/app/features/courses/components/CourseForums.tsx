import { useState } from "react";
import { useLoaderData, useOutletContext, useSubmit, useRevalidator, type ActionFunctionArgs } from "react-router";
import { apiFetch } from "../../auth/utils/methods";
import type { Course } from "../types/types";
import { UserRole } from "~/features/auth/types";

type Mensaje = {
  id: number;
  contenido: string;
  fechaCreacion?: string;
  autorNombre?: string;
  autorApellido?: string;
  autorFoto?: string;
  autorId?: number;
};

type Publicacion = {
  id: number;
  contenido: string;
  fechaCreacion?: string;
  autorNombre?: string;
  autorApellido?: string;
  autorFoto?: string;
  autorId?: number;
  respuestas?: Mensaje[];
};

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { getValidJWTToken, getUserRole, getUserId } = await import("~/services/session.server");

  const { id } = params;
  try {
    const jwtToken = await getValidJWTToken(request);
    const userRole = await getUserRole(request);
    const currentUserId = await getUserId(request);

    const res = await apiFetch(`/cursos/${id}/foro`, {
      method: 'GET',
      secure: true,
      jwtToken
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const publicaciones: Publicacion[] = await res.json();

    return {
      publicaciones,
      isProfesor: userRole === UserRole.PROFESOR,
      currentUserId
    };
  } catch (err) {
    console.error("Error fetching forum:", err);
    return {
      publicaciones: [] as Publicacion[],
      isProfesor: false,
      currentUserId: null
    };
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  const jwtToken = await getValidJWTToken(request);

  try {
    switch (actionType) {
      case "createThread": {
        const contenido = formData.get("contenido") as string;
        const res = await apiFetch(`/cursos/${id}/foro/publicacion`, {
          method: 'POST',
          secure: true,
          jwtToken,
          body: { contenido }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, data: await res.json() };
      }

      case "createReply": {
        const publicacionId = formData.get("publicacionId") as string;
        const contenido = formData.get("contenido") as string;
        const res = await apiFetch(`/cursos/${id}/foro/mensaje/${publicacionId}`, {
          method: 'POST',
          secure: true,
          jwtToken,
          body: { contenido }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, data: await res.json(), publicacionId: Number(publicacionId) };
      }

      case "deleteThread": {
        const publicacionId = formData.get("publicacionId") as string;
        const res = await apiFetch(`/cursos/${id}/foro/publicacion/${publicacionId}`, {
          method: 'DELETE',
          secure: true,
          jwtToken
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, deletedThreadId: Number(publicacionId) };
      }

      case "deleteReply": {
        const mensajeId = formData.get("mensajeId") as string;
        const publicacionId = formData.get("publicacionId") as string;
        const res = await apiFetch(`/cursos/${id}/foro/mensaje/${mensajeId}`, {
          method: 'DELETE',
          secure: true,
          jwtToken
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, deletedReplyId: Number(mensajeId), publicacionId: Number(publicacionId) };
      }

      case "editThread": {
        const publicacionId = formData.get("publicacionId") as string;
        const contenido = formData.get("contenido") as string;
        const res = await apiFetch(`/cursos/${id}/foro/publicacion/${publicacionId}`, {
          method: 'PUT',
          secure: true,
          jwtToken,
          body: { contenido }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, data: await res.json() };
      }

      case "editReply": {
        const mensajeId = formData.get("mensajeId") as string;
        const publicacionId = formData.get("publicacionId") as string;
        const contenido = formData.get("contenido") as string;
        const res = await apiFetch(`/cursos/${id}/foro/mensaje/${mensajeId}`, {
          method: 'PUT',
          secure: true,
          jwtToken,
          body: { contenido }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true, data: await res.json(), publicacionId: Number(publicacionId) };
      }

      default:
        return { success: false, error: "Acción desconocida" };
    }
  } catch (err) {
    console.error(`Error in action ${actionType}:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export default function CourseForums() {
  const context = useOutletContext<{ course: Course }>();
  const course = context?.course;

  const loaderData = useLoaderData() as {
    publicaciones: Publicacion[];
    isProfesor: boolean;
    currentUserId: number | null
  };
  const publicaciones = loaderData?.publicaciones || [];
  const isProfesor = loaderData?.isProfesor || false;
  const currentUserId = loaderData?.currentUserId || null;
  const submit = useSubmit();
  const revalidator = useRevalidator();

  const [showNewThread, setShowNewThread] = useState(false);
  const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<number | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);

  const canEditThread = (pub: Publicacion) => isProfesor || currentUserId === pub.autorId;
  const canEditReply = (msg: Mensaje) => isProfesor || currentUserId === msg.autorId;

  const handleCreateThread = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!course?.id || !newThreadContent) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("actionType", "createThread");
    formData.append("contenido", newThreadContent);

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: "createThread",
    });

    setTimeout(() => {
      setNewThreadContent('');
      setShowNewThread(false);
      setIsSubmitting(false);
      revalidator.revalidate();
    }, 500);
  };

  const handleCreateReply = async (publicacionId: number) => {
    const contenido = replyContent[publicacionId];
    if (!course?.id || !contenido) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("actionType", "createReply");
    formData.append("publicacionId", String(publicacionId));
    formData.append("contenido", contenido);

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `createReply-${publicacionId}`,
    });

    setTimeout(() => {
      setReplyContent({ ...replyContent, [publicacionId]: '' });
      setIsSubmitting(false);
      revalidator.revalidate();
    }, 500);
  };

  const handleDeleteThread = async (publicacionId: number) => {
    if (!course?.id) return;
    if (!window.confirm('¿Eliminar hilo?')) return;

    const formData = new FormData();
    formData.append("actionType", "deleteThread");
    formData.append("publicacionId", String(publicacionId));

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `deleteThread-${publicacionId}`,
    });

    setTimeout(() => {
      revalidator.revalidate();
    }, 500);
  };

  const handleDeleteReply = async (publicacionId: number, mensajeId: number) => {
    if (!course?.id) return;
    if (!window.confirm('¿Eliminar mensaje?')) return;

    const formData = new FormData();
    formData.append("actionType", "deleteReply");
    formData.append("publicacionId", String(publicacionId));
    formData.append("mensajeId", String(mensajeId));

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `deleteReply-${mensajeId}`,
    });

    setTimeout(() => {
      revalidator.revalidate();
    }, 500);
  };

  const handleEditThread = async (publicacionId: number, newContent: string) => {
    if (!course?.id || !newContent) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("actionType", "editThread");
    formData.append("publicacionId", String(publicacionId));
    formData.append("contenido", newContent);

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `editThread-${publicacionId}`,
    });

    setTimeout(() => {
      setEditingThreadId(null);
      setIsSubmitting(false);
      revalidator.revalidate();
    }, 500);
  };

  const handleEditReply = async (publicacionId: number, mensajeId: number, newContent: string) => {
    if (!course?.id || !newContent) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("actionType", "editReply");
    formData.append("publicacionId", String(publicacionId));
    formData.append("mensajeId", String(mensajeId));
    formData.append("contenido", newContent);

    submit(formData, {
      method: "post",
      navigate: false,
      fetcherKey: `editReply-${mensajeId}`,
    });

    setTimeout(() => {
      setEditingReplyId(null);
      setIsSubmitting(false);
      revalidator.revalidate();
    }, 500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Foro del Curso</h1>
        <button
          onClick={() => setShowNewThread(s => !s)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showNewThread ? 'Cancelar' : 'Nuevo Hilo'}
        </button>
      </div>

      {showNewThread && (
        <form onSubmit={handleCreateThread} className="mb-6 bg-white p-4 rounded-md shadow">
          <div className="mb-4">
            <label htmlFor="thread-contenido" className="block text-sm font-medium mb-1">Contenido del hilo</label>
            <textarea
              id="thread-contenido"
              placeholder="Escribe tu pregunta o comentario"
              value={newThreadContent}
              onChange={e => setNewThreadContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewThread(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Hilo'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {publicaciones.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No hay hilos de conversación aún.</p>
          </div>
        )}

        {publicaciones.map(pub => (
          <div key={pub.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header del hilo (clickeable para expandir) */}
            <button
              onClick={() => setExpandedThreadId(expandedThreadId === pub.id ? null : pub.id)}
              className="w-full text-left p-4 hover:bg-gray-50 transition border-b"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    {pub.autorNombre ? pub.autorNombre.charAt(0) : 'U'}{pub.autorApellido ? pub.autorApellido.charAt(0) : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{(pub.autorNombre && pub.autorApellido) ? `${pub.autorNombre} ${pub.autorApellido}` : 'Usuario'}</div>
                      <div className="text-xs text-gray-500">{pub.fechaCreacion ? new Date(pub.fechaCreacion).toLocaleString() : ''}</div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{pub.respuestas?.length ?? 0} {(pub.respuestas?.length === 1) ? 'respuesta' : 'respuestas'}</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedThreadId === pub.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pub.contenido}</p>
                  {canEditThread(pub) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setEditingThreadId(editingThreadId === pub.id ? null : pub.id)}
                        className="text-blue-500 text-sm hover:text-blue-700 font-medium"
                      >
                        {editingThreadId === pub.id ? 'Cancelar' : 'Editar'}
                      </button>
                      <button
                        onClick={() => handleDeleteThread(pub.id)}
                        className="text-red-500 text-sm hover:text-red-700 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </button>

            {editingThreadId === pub.id && (
              <div className="p-4 bg-blue-50 border-b">
                <label htmlFor={`edit-thread-${pub.id}`} className="block text-sm font-medium mb-2">Editar contenido</label>
                <textarea
                  id={`edit-thread-${pub.id}`}
                  defaultValue={pub.contenido}
                  onBlur={(e) => {
                    if (e.currentTarget.value.trim() && e.currentTarget.value !== pub.contenido) {
                      handleEditThread(pub.id, e.currentTarget.value);
                    }
                  }}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setEditingThreadId(null)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const textarea = document.getElementById(`edit-thread-${pub.id}`) as HTMLTextAreaElement;
                      if (textarea?.value.trim()) {
                        handleEditThread(pub.id, textarea.value);
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {expandedThreadId === pub.id && (
              <div className="border-t">
                {pub.respuestas && pub.respuestas.length > 0 && (
                  <div className="p-4 space-y-4 border-b bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700">Respuestas ({pub.respuestas.length})</div>
                    {pub.respuestas.map(msg => (
                      <div key={msg.id} className="bg-white p-3 rounded-md border border-gray-200">
                        {editingReplyId === msg.id ? (
                          <div>
                            <label htmlFor={`edit-reply-${msg.id}`} className="block text-xs font-medium mb-1">Editar respuesta</label>
                            <textarea
                              id={`edit-reply-${msg.id}`}
                              defaultValue={msg.contenido}
                              rows={2}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setEditingReplyId(null)}
                                className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 text-xs"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  const textarea = document.getElementById(`edit-reply-${msg.id}`) as HTMLTextAreaElement;
                                  if (textarea?.value.trim()) {
                                    handleEditReply(pub.id, msg.id, textarea.value);
                                  }
                                }}
                                disabled={isSubmitting}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                                  {msg.autorNombre ? msg.autorNombre.charAt(0) : 'U'}{msg.autorApellido ? msg.autorApellido.charAt(0) : ''}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold">{(msg.autorNombre && msg.autorApellido) ? `${msg.autorNombre} ${msg.autorApellido}` : 'Usuario'}</div>
                                  <div className="text-xs text-gray-500">{msg.fechaCreacion ? new Date(msg.fechaCreacion).toLocaleString() : ''}</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{msg.contenido}</p>
                            </div>
                            {canEditReply(msg) && (
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => setEditingReplyId(editingReplyId === msg.id ? null : msg.id)}
                                  className="text-blue-500 text-xs hover:text-blue-700 font-medium"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteReply(pub.id, msg.id)}
                                  className="text-red-500 text-xs hover:text-red-700 font-medium"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario de respuesta */}
                <div className="p-4 bg-gray-50 border-t">
                  <label htmlFor={`reply-${pub.id}`} className="block text-sm font-medium mb-2">Responder</label>
                  <div className="flex gap-2">
                    <textarea
                      id={`reply-${pub.id}`}
                      placeholder="Escribe tu respuesta..."
                      value={replyContent[pub.id] || ''}
                      onChange={e => setReplyContent({ ...replyContent, [pub.id]: e.target.value })}
                      rows={2}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleCreateReply(pub.id)}
                      disabled={isSubmitting || !replyContent[pub.id]}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium self-start"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
