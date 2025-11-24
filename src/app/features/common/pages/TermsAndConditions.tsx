import { type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Términos y Condiciones - Ombook" },
        { name: "description", content: "Términos y condiciones de uso de la plataforma Ombook" },
    ];
};

export default function TermsAndConditions() {
    return (
        <div className="ombook-container ombook-section">
            <h1 className="ombook-heading ombook-heading-xl ombook-text-green mb-6">Términos y Condiciones</h1>

            <div className="ombook-card">
                <div className="space-y-6">
                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">1. Aceptación de los Términos</h2>
                        <p className="ombook-text-gray">
                            Al acceder y utilizar Ombook, usted acepta estar sujeto a estos términos y condiciones de uso.
                            Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestra plataforma.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">2. Uso de la Plataforma</h2>
                        <p className="ombook-text-gray mb-3">
                            Ombook es una plataforma educativa diseñada para facilitar la gestión de cursos, estudiantes y contenido académico.
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2">
                            <li>Los usuarios deben proporcionar información precisa y actualizada</li>
                            <li>No está permitido compartir credenciales de acceso</li>
                            <li>El contenido cargado debe respetar los derechos de autor</li>
                            <li>Se prohíbe el uso de la plataforma para actividades ilegales</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">3. Derechos de Propiedad Intelectual</h2>
                        <p className="ombook-text-gray">
                            Todo el contenido de la plataforma, incluyendo pero no limitado a textos, gráficos, logotipos,
                            y software, es propiedad de Ombook o sus licenciantes y está protegido por las leyes de propiedad intelectual.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">4. Responsabilidades del Usuario</h2>
                        <p className="ombook-text-gray">
                            Los usuarios son responsables de:
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2 mt-3">
                            <li>Mantener la confidencialidad de sus credenciales</li>
                            <li>El contenido que suben a la plataforma</li>
                            <li>Sus interacciones con otros usuarios</li>
                            <li>Cumplir con las normas de conducta de la institución</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">5. Limitación de Responsabilidad</h2>
                        <p className="ombook-text-gray">
                            Ombook no se hace responsable por:
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2 mt-3">
                            <li>Interrupciones del servicio</li>
                            <li>Pérdida de datos no respaldados</li>
                            <li>Contenido generado por usuarios</li>
                            <li>Daños indirectos derivados del uso de la plataforma</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">6. Modificaciones</h2>
                        <p className="ombook-text-gray">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento.
                            Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">7. Contacto</h2>
                        <p className="ombook-text-gray">
                            Si tiene preguntas sobre estos términos, puede contactarnos en{" "}
                            <a href="mailto:soporte@ombook.com" className="ombook-link">
                                soporte@ombook.com
                            </a>
                        </p>
                    </section>

                    <div className="ombook-alert ombook-alert-info mt-6">
                        <p className="text-sm">
                            <strong>Última actualización:</strong> 24 de noviembre de 2025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}