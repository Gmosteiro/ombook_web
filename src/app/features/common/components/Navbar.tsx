import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import Logout from "../../auth/components/Logout";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { getNavbarLinks } from "../utils/Navbar";
import { UserRole } from "~/features/auth/types";

interface NavbarProps {
    userRole?: UserRole;
    avatarUrl?: string;
}

export default function Navbar({ userRole, avatarUrl }: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cierra el menú si se hace click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const styles = {
        link: "ombook-text-gray ombook-hover-blue font-medium transition-colors text-[20px]",
    }

    const links = getNavbarLinks(userRole);

    let isLoggedIn = Boolean(userRole);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white ombook-border-gray border-b px-6 py-4 shadow">
            <div className="flex items-center">
                <Link to="/" className="flex items-center">
                    <img
                        src="/ombook_logo_horizontal.png"
                        alt="Ombook"
                        className="w-32 h-10 object-cover object-left"
                    />
                </Link>

                <div className="ml-12 flex items-center space-x-8">
                    <Link to="/" className={styles.link}>
                        Home
                    </Link>
                </div>

                {isLoggedIn && (
                    <div className="flex items-center ml-auto space-x-6">
                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={styles.link}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="relative flex items-center space-x-2 cursor-pointer" ref={menuRef}>
                            <NotificationsDropdown />
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center focus:outline-none cursor-pointer ml-4 hover:opacity-80 transition-opacity"
                                aria-label="Abrir menú de usuario"
                                type="button"
                            >
                                {avatarUrl && (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                )}
                                <svg
                                    className="w-4 h-4 text-gray-400 ml-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            <div
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg ombook-border-gray border z-50"
                                style={{ display: isUserMenuOpen ? "block" : "none" }}
                            >
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-[18px] ombook-text-gray hover:ombook-bg-light transition-colors "
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>

                                    <hr className="my-1" />
                                    <div className="px-4 py-2">
                                        <Logout
                                            className="w-full text-[18px]"
                                            buttonText="Cerrar Sesión"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}