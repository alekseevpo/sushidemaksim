import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, desc, colorClass, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="premium-card p-8 text-center group"
  >
    <div className={`${colorClass} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform duration-300`}>
      <Icon size={32} className="text-gray-900" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default function HomePageSimple() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 pt-20 pb-32 bg-[url('/sushi-hero.jpg')] bg-cover bg-center">
        {/* Background Overlay (Filter) */}
        <div className="absolute inset-0 z-0 bg-black/40"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest rounded-full mb-6"
            >
              Artesanía Japonesa en tu Mesa
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1]">
              Sabor que <br />
              <span className="text-red-600 italic">Despierta</span> Sentidos
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed font-medium">
              Descubre la perfección en cada bocado. Sushi artesanal preparado con los ingredientes más frescos del mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                to="/menu"
                className="btn-premium bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] active:scale-95 transition-all"
              >
                EXPLORAR MENÚ
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/blog"
                className="btn-premium glass-dark text-white border border-white/20 px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all"
              >
                NUESTRO BLOG
              </Link>
            </div>
          </motion.div>

          {/* Visual element for desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 w-full aspect-square max-w-md mx-auto rounded-[3rem] overflow-hidden border-8 border-white/10 premium-shadow">
              <img src="/blog_post_chef_hands.png" alt="Chef Hands" className="w-full h-full object-cover" />
            </div>
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/30 blur-[80px] rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/20 blur-[80px] rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Badge Banner */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-gray-900 italic">9.8</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">Valoración<br />Media Clientes</div>
          </div>
          <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-gray-900 italic">+2k</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">Pedidos<br />Entregados Hoy</div>
          </div>
          <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-gray-900 italic">100%</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">Pescado<br />Fresco Diario</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">La Experiencia <span className="text-red-600">Maksim</span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
              No solo vendemos comida, entregamos una tradición familiar perfeccionada durante años.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <FeatureCard
              index={0}
              icon={Clock}
              title="Entrega Express"
              desc="Nuestros repartidores conocen Madrid como nadie. Tu pedido llega siempre a la temperatura ideal en menos de 45 min."
              colorClass="bg-amber-100/50"
            />
            <FeatureCard
              index={1}
              icon={Star}
              title="Calidad Premium"
              desc="Seleccionamos el Atún Rojo y el Salmón Noruego cada mañana en MercaMadrid para garantizar frescura absoluta."
              colorClass="bg-red-100/50"
            />
            <FeatureCard
              index={2}
              icon={MapPin}
              title="Localización Ideal"
              desc="Situados en el corazón de Tetuán, listos para que pases a recoger tu pedido con un 10% de descuento adicional."
              colorClass="bg-blue-100/50"
            />
          </div>
        </div>
      </section>

      {/* Blog Teaser / SEO Section */}
      <section className="py-24 bg-white px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl skew-y-1">
              <img src="/blog_post_chef_hands.png" alt="Chef Hands" className="w-full h-full object-cover" />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-[200px] animate-bounce duration-[3000ms]">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-[11px] font-bold text-gray-800 italic">"El mejor sushi que he probado en todo Madrid. Recomendadísimo."</p>
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-black">Pablo G. - Cliente Verificado</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-4 block">Nuestra Historia</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">Más que una Cocina, <br />Una <span className="italic underline decoration-red-600 decoration-4 underline-offset-8">Pasión</span></h2>
            <p className="text-gray-500 mb-8 leading-relaxed font-medium">
              En Sushi de Maksim, cada corte de pescado es un homenaje a la técnica milenaria. Nos esforzamos por llevarte no solo una cena, sino un momento de placer gastronómico inolvidable.
            </p>
            <div className="space-y-4 mb-10">
              {['Pescado Fresco del Día', 'Arroz Premium de Grano Corto', 'Recetas Originales del Chef'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                    <ChevronRight size={12} className="text-white" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/blog" className="text-gray-900 font-black text-sm group flex items-center gap-2 hover:text-red-600 transition-colors">
              LEER MÁS EN NUESTRO BLOG
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-red-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">¿Hambre de Verdad?</h2>
          <p className="text-red-100 mb-10 text-lg md:text-xl font-medium relative z-10 max-w-xl mx-auto">
            Haz tu primer pedido hoy y descubre por qué somos los favoritos del barrio.
          </p>
          <Link to="/menu" className="inline-block bg-white text-red-600 px-12 py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-transform relative z-10">
            ORDENAR AHORA
          </Link>
        </motion.div>
      </section>
    </div >
  );
}
