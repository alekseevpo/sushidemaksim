import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 py-10 mt-auto border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="font-bold text-white text-lg tracking-wide uppercase">Sushi<span className="text-red-500 font-light">Maksim</span></span>
                    </div>
                    <p className="text-sm">El mejor sushi de la ciudad, directo a tu puerta.</p>
                    <p className="text-xs mt-2 text-gray-500">
                        Desarrollado por el equipo de Selenit en 2026. Todos los derechos reservados.
                        <br />
                        <a href="mailto:alekseevpo@gmail.com" className="hover:text-red-500 transition-colors">Contactar con el desarrollador</a>
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4">
                    <div className="flex gap-6 text-sm font-medium">
                        <Link to="/" className="hover:text-white transition">Menú</Link>
                        <Link to="/promo" className="hover:text-white transition">Promociones</Link>
                        <Link to="/contacts" className="hover:text-white transition">Contacto</Link>
                    </div>
                    <a href="tel:+34641518390" className="text-sm font-bold text-gray-300 hover:text-red-500 transition-colors">
                        +34 641 518 390
                    </a>

                    {/* Botón discreto para administradores */}
                    <div className="mt-2">
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
                            title="Acceso de personal"
                        >
                            <Shield size={14} />
                            <span>Staff</span>
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
