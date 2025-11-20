import { getValidJWTToken } from '~/services/session.server';
import { apiFetch } from '~/features/auth/utils/methods';

export async function action({ request }: { request: Request }) {
  const jwtToken = await getValidJWTToken(request);
  if (!jwtToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const actionType = formData.get('_action');
  const cursoId = formData.get('cursoId');

  try {
    if (request.method === 'POST' && actionType === 'createTask') {
      const titulo = formData.get('titulo');
      const descripcion = formData.get('descripcion');
      const fechaInicio = formData.get('fechaInicio');
      const fechaFin = formData.get('fechaFin');

      if (!titulo || !cursoId) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const body: any = { titulo, descripcion };
      if (fechaInicio) body.fechaInicio = new Date(fechaInicio as string).toISOString();
      if (fechaFin) body.fechaFin = new Date(fechaFin as string).toISOString();

      const res = await apiFetch(`/cursos/${cursoId}/tareas`, {
        method: 'POST',
        secure: true,
        jwtToken,
        body
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const created = await res.json();
      return Response.json(created);
    }
    if (request.method === 'PATCH' && actionType === 'updateTask') {
      const tareaId = formData.get('tareaId');
      const titulo = formData.get('titulo');
      const descripcion = formData.get('descripcion');
      const fechaInicio = formData.get('fechaInicio');
      const fechaFin = formData.get('fechaFin');

      if (!titulo || !cursoId || !tareaId) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const body: any = { titulo, descripcion };
      if (fechaInicio) body.fechaInicio = new Date(fechaInicio as string).toISOString();
      if (fechaFin) body.fechaFin = new Date(fechaFin as string).toISOString();

      const res = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}`, {
        method: 'PATCH',
        secure: true,
        jwtToken,
        body
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = await res.json();
      return Response.json(updated);
    }

    // =====================
    //  BORRAR RECURSO
    // =====================
    if (request.method === 'DELETE' && actionType === 'deleteResource') {
      const recursoId = formData.get('recursoId');

      if (!cursoId || !recursoId) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const res = await apiFetch(`/cursos/${cursoId}/recursos/${recursoId}`, {
        method: 'DELETE',
        secure: true,
        jwtToken
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      return Response.json({ success: true });
    }

    // =====================
    //  SUBIR RECURSO
    // =====================
    if (request.method === 'POST' && actionType === 'uploadResource') {
      const tareaId = formData.get('ownerId');
      const ownerRecurso = 'TAREA';
      const nombre = formData.get('nombre');
      const archivo = formData.get('archivo') as File;

      if (!cursoId || !tareaId || !nombre || !archivo) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(archivo);
      });
      const body = {
        ownerRecurso,
        ownerId: parseInt(tareaId as string),
        nombre,
        archivo: base64.split(',')[1]
      };

      const res = await apiFetch(`/cursos/${cursoId}/recursos`, {
        method: 'POST',
        secure: true,
        jwtToken,
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const nuevoRecurso = await res.json();
      return Response.json(nuevoRecurso);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Action error:', err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
