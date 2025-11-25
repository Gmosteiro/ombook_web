

type Mark = {
    calificacion: number;
    comentarios?: string;
    publicada: boolean;
};

export default function StudentMarks({ mark }: { course: any; mark?: Mark | null }) {
    if (!mark)
        return <div>No hay calificación final publicada para este curso.</div>;

    return (
        <div className="ombook-card p-6">
            <h2 className="ombook-heading ombook-heading-md mb-4">Calificación final</h2>
            <div className="mb-2">
                <strong>Calificación:</strong> {mark.calificacion}
            </div>
            {mark.comentarios && (
                <div className="mb-2">
                    <strong>Comentarios:</strong> {mark.comentarios}
                </div>
            )}
            <div>
                <strong>Estado:</strong> {mark.publicada ? "Publicada" : "No publicada"}
            </div>
        </div>
    );
}
