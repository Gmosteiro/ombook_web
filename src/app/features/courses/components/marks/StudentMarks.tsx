import { CalificacionFinalEstudianteResponse } from "../../../../routes/api.marks";


export default function StudentMarks({ mark }: { mark?: CalificacionFinalEstudianteResponse }) {
    if (!mark) {
        return <div>No hay calificación final publicada para este curso.</div>;
    }

    return (
        <div className="ombook-card p-6">
            <h2 className="ombook-heading ombook-heading-md mb-4">Calificación final</h2>
            <div className="mb-2">
                <strong>Calificación final:</strong> {mark.calificacionFinal ?? "-"}
            </div>
            <div className="mb-2">
                <strong>Estado:</strong> {mark.estado ?? "-"}
            </div>
            {mark.notasAsociadas && mark.notasAsociadas.length > 0 && (
                <div className="mb-2">
                    <strong>Notas asociadas:</strong>
                    <ul className="list-disc ml-6">
                        {mark.notasAsociadas.map((nota, idx) => (
                            <li key={idx}>
                                {nota.tituloTarea}: {nota.calificacion ?? "-"}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
