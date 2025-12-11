import { useState } from "react";
import { useLoaderData, useOutletContext, useSubmit, useRevalidator, type ActionFunctionArgs } from "react-router";
import { apiFetch } from "../../auth/utils/methods";
import type { Course } from "../types/types";
import { UserRole } from "~/features/auth/types";
import { formatDateDisplay } from "~/features/common/utils/Utils";

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
  const jwtToken = await getValidJWTToken(request);
  const userRole = await getUserRole(request);
  const currentUserId = await getUserId(request);
  try {

    const res = await apiFetch(`/cursos/${id}/foro`, {
      method: 'GET',
      secure: true,
      jwtToken
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const publicaciones: Publicacion[] = await res.json();

    return new Response(
      JSON.stringify({
        publicaciones,
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
    console.error("Error fetching forum:", err);
    return new Response(
      JSON.stringify({
        publicaciones: [] as Publicacion[],
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
  const currentUserId = loaderData?.currentUserId ? Number(loaderData.currentUserId) : null;
  const submit = useSubmit();
  const revalidator = useRevalidator();

  const [showNewThread, setShowNewThread] = useState(false);
  const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<number | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);

  const canEditThread = (pub: Publicacion) => currentUserId === pub.autorId;
  const canDeleteThread = (pub: Publicacion) => isProfesor || currentUserId === pub.autorId;
  const canEditReply = (msg: Mensaje) => currentUserId === msg.autorId;
  const canDeleteReply = (msg: Mensaje) => isProfesor || currentUserId === msg.autorId;

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
        <h1 className="ombook-heading ombook-heading-lg ombook-text-green">Foro del Curso</h1>
        <button
          onClick={() => setShowNewThread(true)}
          className="ombook-btn ombook-btn-primary"
        >
          Nuevo Hilo
        </button>
      </div>

      {showNewThread && (
        <form onSubmit={handleCreateThread} className="ombook-card mb-6">
          <div className="space-y-4">
            <div>
              <label className="ombook-label">Contenido del hilo</label>
              <textarea
                className="ombook-input"
                rows={4}
                value={newThreadContent}
                onChange={e => setNewThreadContent(e.target.value)}
                required
                placeholder="Escribe el contenido del nuevo hilo..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="ombook-btn ombook-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear Hilo'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewThread(false)}
                className="ombook-btn ombook-btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {publicaciones.length === 0 && (
          <div className="ombook-card text-center ombook-text-gray py-8">
            <p>No hay hilos de conversación aún.</p>
          </div>
        )}

        {publicaciones.map(pub => (
          <div key={pub.id} className="ombook-card p-0 overflow-hidden">
            {/* Header del hilo (clickeable para expandir) */}
            <button
              onClick={() => setExpandedThreadId(expandedThreadId === pub.id ? null : pub.id)}
              className="w-full text-left p-4 hover:bg-gray-50 transition ombook-border-gray border-b"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full ombook-bg-green flex items-center justify-center text-sm font-medium text-white">
                    {pub.autorNombre ? pub.autorNombre.charAt(0) : 'U'}{pub.autorApellido ? pub.autorApellido.charAt(0) : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{(pub.autorNombre && pub.autorApellido) ? `${pub.autorNombre} ${pub.autorApellido}` : 'Usuario'}</div>
                      <div className="text-xs text-gray-500">{formatDateDisplay(pub.fechaCreacion)}</div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{pub.respuestas?.length ?? 0} {(pub.respuestas?.length === 1) ? 'respuesta' : 'respuestas'}</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedThreadId === pub.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pub.contenido}</p>
                  {(canEditThread(pub) || canDeleteThread(pub)) && (
                    <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      {canEditThread(pub) && (
                        <button
                          onClick={() => setEditingThreadId(editingThreadId === pub.id ? null : pub.id)}
                          className="ombook-link text-sm font-medium"
                        >
                          {editingThreadId === pub.id ? 'Cancelar' : 'Editar'}
                        </button>
                      )}
                      {canDeleteThread(pub) && (
                        <button
                          onClick={() => handleDeleteThread(pub.id)}
                          className="text-sm font-medium ombook-text-brown hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>

            {editingThreadId === pub.id && (
              <div className="p-4 ombook-bg-light ombook-border-gray border-b">
                <label htmlFor={`edit-thread-${pub.id}`} className="ombook-label">Editar contenido</label>
                <textarea
                  id={`edit-thread-${pub.id}`}
                  defaultValue={pub.contenido}
                  onBlur={(e) => {
                    if (e.currentTarget.value.trim() && e.currentTarget.value !== pub.contenido) {
                      handleEditThread(pub.id, e.currentTarget.value);
                    }
                  }}
                  rows={3}
                  className="ombook-input"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setEditingThreadId(null)}
                    className="ombook-btn ombook-btn-outline text-sm"
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
                    className="ombook-btn ombook-btn-primary text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {expandedThreadId === pub.id && (
              <div className="ombook-border-gray border-t">
                {pub.respuestas && pub.respuestas.length > 0 && (
                  <div className="p-4 space-y-4 ombook-border-gray border-b ombook-bg-light">
                    <div className="text-sm font-semibold ombook-text-brown">Respuestas ({pub.respuestas.length})</div>
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
                                  <div className="text-xs text-gray-500">{formatDateDisplay(msg.fechaCreacion)}</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{msg.contenido}</p>
                            </div>
                            {(canEditReply(msg) || canDeleteReply(msg)) && (
                              <div className="flex gap-1 ml-2">
                                {canEditReply(msg) && (
                                  <button
                                    onClick={() => setEditingReplyId(editingReplyId === msg.id ? null : msg.id)}
                                    className="ombook-link text-xs font-medium"
                                  >
                                    Editar
                                  </button>
                                )}
                                {canDeleteReply(msg) && (
                                  <button
                                    onClick={() => handleDeleteReply(pub.id, msg.id)}
                                    className="text-xs font-medium ombook-text-brown hover:underline"
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario de respuesta */}
                <div className="p-4 ombook-bg-light ombook-border-gray border-t">
                  <label htmlFor={`reply-${pub.id}`} className="ombook-label">Responder</label>
                  <div className="flex gap-2">
                    <textarea
                      id={`reply-${pub.id}`}
                      placeholder="Escribe tu respuesta..."
                      value={replyContent[pub.id] || ''}
                      onChange={e => setReplyContent({ ...replyContent, [pub.id]: e.target.value })}
                      rows={2}
                      className="ombook-input flex-1"
                    />
                    <button
                      onClick={() => handleCreateReply(pub.id)}
                      disabled={isSubmitting || !replyContent[pub.id]}
                      className="ombook-btn ombook-btn-primary text-sm self-start"
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
