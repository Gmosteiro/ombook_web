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
        link: "text-gray-600 hover:text-blue-600 font-medium transition-colors",
    }

    const links = getNavbarLinks(userRole);

    let isLoggedIn = Boolean(userRole);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 px-6 py-4 shadow">
            <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-semibold text-blue-700 ">Ombook</span>
                </Link>

                <Link to="/" className="ml-10">
                    Home
                </Link>

                {isLoggedIn && (
                    <div className="flex items-center ml-auto mr-5 space-x-8">
                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
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

                        <div className="relative flex items-center space-x-2" ref={menuRef}>
                            <NotificationsDropdown />
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center focus:outline-none cursor-pointer ml-4"
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
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                                style={{ display: isUserMenuOpen ? "block" : "none" }}
                            >
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>

                                    <hr className="my-1" />
                                    <div className="px-4 py-2">
                                        <Logout
                                            className="w-full"
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