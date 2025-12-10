import React from 'react';
import { Link } from 'react-router';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen ombook-bg-light">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Bienvenido a OMBook
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/login"
                            className="ombook-btn ombook-btn-primary inline-block px-8 py-3"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/home"
                            className="ombook-btn ombook-btn-outline inline-block px-8 py-3"
                        >
                            Ver Demo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;