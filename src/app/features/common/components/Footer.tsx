import { Link } from "react-router";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
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
                        <h3 className="font-semibold ombook-text-primary mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/courses" className="text-gray-600 ombook-hover-primary text-sm transition-colors">
                                    Cursos
                                </Link>
                            </li>
                            <li>
                                <Link to="/users" className="text-gray-600 ombook-hover-primary text-sm transition-colors">
                                    Usuarios
                                </Link>
                            </li>
                            <li>
                                <Link to="/chat" className="text-gray-600 ombook-hover-primary text-sm transition-colors">
                                    Chat
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold ombook-text-primary mb-4">Soporte</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/profile" className="text-gray-600 ombook-hover-primary text-sm transition-colors">
                                    Mi Perfil
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:soporte@ombook.com" className="text-gray-600 ombook-hover-primary text-sm transition-colors">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Ombook. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-500 ombook-hover-primary text-sm transition-colors">
                            Privacidad
                        </a>
                        <a href="#" className="text-gray-500 ombook-hover-primary text-sm transition-colors">
                            Términos
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
