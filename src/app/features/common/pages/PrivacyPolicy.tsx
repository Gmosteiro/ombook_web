import { type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Política de Privacidad - Ombook" },
        { name: "description", content: "Política de privacidad de la plataforma Ombook" },
    ];
};

export default function PrivacyPolicy() {
    return (
        <div className="ombook-container ombook-section">
            <h1 className="ombook-heading ombook-heading-xl ombook-text-green mb-6">Política de Privacidad</h1>

            <div className="ombook-card">
                <div className="space-y-6">
                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">1. Información que Recopilamos</h2>
                        <p className="ombook-text-gray mb-3">
                            En Ombook recopilamos la siguiente información para proporcionar y mejorar nuestros servicios:
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2">
                            <li><strong>Información de cuenta:</strong> Nombre, correo electrónico, rol (estudiante, profesor, administrador)</li>
                            <li><strong>Información académica:</strong> Cursos, calificaciones, asistencia, y material educativo</li>
                            <li><strong>Información de uso:</strong> Registros de actividad, interacciones con la plataforma</li>
                            <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo utilizado</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">2. Cómo Utilizamos su Información</h2>
                        <p className="ombook-text-gray mb-3">
                            Utilizamos la información recopilada para:
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2">
                            <li>Proporcionar acceso a la plataforma educativa</li>
                            <li>Gestionar cursos, calificaciones y comunicaciones</li>
                            <li>Mejorar la experiencia del usuario y la funcionalidad de la plataforma</li>
                            <li>Enviar notificaciones importantes sobre cursos y actividades</li>
                            <li>Garantizar la seguridad de la plataforma</li>
                            <li>Cumplir con obligaciones legales y normativas</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">3. Compartir Información</h2>
                        <p className="ombook-text-gray mb-3">
                            No vendemos ni alquilamos su información personal. Compartimos información solo en los siguientes casos:
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2">
                            <li><strong>Con su institución educativa:</strong> Para fines académicos y administrativos</li>
                            <li><strong>Con profesores y administradores:</strong> Según sea necesario para el proceso educativo</li>
                            <li><strong>Con proveedores de servicios:</strong> Que nos ayudan a operar la plataforma</li>
                            <li><strong>Por requerimiento legal:</strong> Cuando sea necesario cumplir con la ley</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">4. Seguridad de los Datos</h2>
                        <p className="ombook-text-gray">
                            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal,
                            incluyendo encriptación, controles de acceso, y auditorías de seguridad regulares.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">5. Sus Derechos</h2>
                        <p className="ombook-text-gray mb-3">
                            Usted tiene los siguientes derechos con respecto a su información personal:
                        </p>
                        <ul className="list-disc list-inside ombook-text-gray space-y-2">
                            <li><strong>Acceso:</strong> Puede solicitar una copia de su información personal</li>
                            <li><strong>Rectificación:</strong> Puede solicitar la corrección de datos inexactos</li>
                            <li><strong>Eliminación:</strong> Puede solicitar la eliminación de sus datos (con excepciones legales)</li>
                            <li><strong>Portabilidad:</strong> Puede solicitar sus datos en formato portable</li>
                            <li><strong>Oposición:</strong> Puede oponerse al procesamiento de sus datos en ciertos casos</li>
                        </ul>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">6. Cookies y Tecnologías Similares</h2>
                        <p className="ombook-text-gray">
                            Utilizamos cookies y tecnologías similares para mejorar su experiencia, recordar sus preferencias,
                            y analizar el uso de la plataforma. Puede controlar las cookies a través de la configuración de su navegador.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">7. Retención de Datos</h2>
                        <p className="ombook-text-gray">
                            Conservamos su información personal durante el tiempo necesario para cumplir con los fines descritos en esta política,
                            a menos que la ley requiera o permita un período de retención más largo.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">8. Cambios a esta Política</h2>
                        <p className="ombook-text-gray">
                            Podemos actualizar esta política de privacidad periódicamente. Le notificaremos sobre cambios significativos
                            mediante un aviso en la plataforma o por correo electrónico.
                        </p>
                    </section>

                    <hr className="ombook-divider" />

                    <section>
                        <h2 className="ombook-heading ombook-heading-md ombook-text-brown mb-3">9. Contacto</h2>
                        <p className="ombook-text-gray">
                            Para preguntas, inquietudes o solicitudes relacionadas con esta política de privacidad, contáctenos en:{" "}
                            <a href="mailto:privacidad@ombook.com" className="ombook-link">
                                privacidad@ombook.com
                            </a>
                        </p>
                    </section>

                    <div className="ombook-alert ombook-alert-success mt-6">
                        <p className="text-sm">
                            <strong>Última actualización:</strong> 24 de noviembre de 2025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}