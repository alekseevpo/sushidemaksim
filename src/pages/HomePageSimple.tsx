import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HomePageSimple() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[url('/sushi-hero.jpg')] bg-cover bg-center text-white py-24 px-4 relative">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 drop-shadow-md">
            Auténtica cocina japonesa
          </h1>
          <p className="text-2xl mb-8 opacity-90 drop-shadow-sm bg-black/30 py-3 px-5 rounded-lg backdrop-blur-sm inline-block">
            Sushi y rollos frescos con entrega a domicilio
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/menu"
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Ver menú
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/cart"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold shadow-md hover:scale-105 transition-transform duration-200 ease-in-out hover:bg-white/10"
            >
              Pedir ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏱️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                Entrega rápida
              </h3>
              <p className="text-gray-500">
                Entrega en 30 minutos en toda la ciudad
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                Solo productos frescos
              </h3>
              <p className="text-gray-500">
                Entrega diaria de pescado fresco y mariscos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                Centro de la ciudad
              </h3>
              <p className="text-gray-500">
                Ubicación conveniente para recogida
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
