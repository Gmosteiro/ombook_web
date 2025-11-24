import { Link } from "react-router";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white ombook-border-gray border-t mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="inline-block mb-4">
                            <img
                                src="/ombook_logo_horizontal.png"
                                alt="Ombook"
                                className="w-40 h-12 object-cover object-left"
                            />
                        </Link>
                        <p className="text-gray-600 text-sm mb-4">
                            Plataforma educativa integral para la gestión de cursos,
                            estudiantes y contenido académico.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold ombook-text-blue mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/courses" className="ombook-text-gray ombook-hover-blue text-sm transition-colors">
                                    Cursos
                                </Link>
                            </li>
                            <li>
                                <Link to="/chat" className="ombook-text-gray ombook-hover-blue text-sm transition-colors">
                                    Chat
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold ombook-text-blue mb-4">Soporte</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/profile" className="ombook-text-gray ombook-hover-blue text-sm transition-colors">
                                    Mi Perfil
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:soporte@ombook.com" className="ombook-text-gray ombook-hover-blue text-sm transition-colors">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="ombook-border-gray border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="ombook-text-gray text-sm">
                        © {currentYear} Ombook. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="ombook-text-gray ombook-hover-blue text-sm transition-colors">
                            Privacidad
                        </Link>
                        <Link to="/terms" className="ombook-text-gray ombook-hover-blue text-sm transition-colors">
                            Términos y Condiciones
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
