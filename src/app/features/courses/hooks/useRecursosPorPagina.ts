import { useEffect, useState } from "react";
import { Recurso } from "../types/types";
import { apiFetch } from "../../auth/utils/methods";

export function useRecursosPorPagina(cursoId: number, paginaId: number, jwtToken: string) {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cursoId || !paginaId) return;
    setLoading(true);
    apiFetch(`/cursos/${cursoId}/recursos?ownerRecurso=PAGINA&ownerId=${paginaId}`, {
      method: "GET",
      secure: true,
      jwtToken
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRecursos(data);
      })
      .catch(() => {
        setError("Error al obtener recursos");
        setRecursos([]);
      })
      .finally(() => setLoading(false));
  }, [cursoId, paginaId]);

  return { recursos, loading, error };
}
