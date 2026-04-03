import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, '..', '.env') });
// Load env from server as well to get the service role key
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const article = {
    title: 'El Origen del Sushi en España: De Gran Canaria a Madrid',
    slug: 'el-origen-del-sushi-en-espana',
    excerpt: '¿Sabías que el primer restaurante japonés de España no abrió en Madrid ni en Barcelona? Descubre la fascinante historia de cómo el sushi llegó a nuestras costas a finales de los años 60.',
    content: `España es hoy uno de los países con mayor pasión por el sushi fuera de Japón, pero su desembarco en nuestras costas fue una historia de necesidad, marineros y una ubicación estratégica.

Todo comenzó en **1967** en las Islas Canarias. En aquel entonces, el puerto de **Las Palmas de Gran Canaria** era una base logística vital para la flota pesquera japonesa que operaba en el Atlántico medio. Cientos de marineros y técnicos japoneses pasaban meses en la isla, y con ellos llegó la nostalgia por los sabores de su tierra.

Fue así como el cocinero **Toshihiko Sato** decidió abrir el **Restaurante Fuji**, el primer establecimiento japonés de todo el país. Al principio, el Fuji era un refugio exclusivo para la colonia japonesa, un lugar donde comer pescado fresco preparado con las técnicas tradicionales que Sato-san había traído desde Japón. Sato-san no solo trajo recetas, sino una filosofía de respeto absoluto por el producto que caló hondo en la cultura gastronómica canaria.

No fue hasta años después que el sushi empezó a conquistar el paladar de los españoles locales. En la península, Madrid vio nacer sus primeros templos del sushi en los años 70. Locales legendarios como el restaurante **Mikado** (1974) o **Tokio**, introdujeron el concepto de *omakase* y el arte del corte del pescado crudo a una sociedad que, hasta entonces, apenas concebía el pescado si no era frito, en guiso o al horno.

Aquellos pioneros enfrentaron grandes retos: desde la dificultad para encontrar ingredientes como el arroz de grano corto o el vinagre de arroz, hasta la reticencia inicial de un público poco acostumbrado a comer pescado sin cocinar. Sin embargo, la calidad del producto y la elegancia del ritual terminaron por seducir a los comensales más curiosos.

Hoy, en Sushi de Maksim, seguimos esa tradición de respeto por el producto y técnica precisa, honrando a aquellos pioneros que cruzaron medio mundo para traernos este arte milenario. Nuestra pasión por el detalle es nuestra forma de mantener vivo el legado de Sato-san y todos los que abrieron camino en España.`,
    author: 'Chef Maksim',
    category: 'HISTORIA',
    read_time: 5,
    published: true,
    image_url: '/uploads/blog/sushi_history_spain.png' // We will move the generated image here
};

async function addPost() {
    console.log('🚀 Inserting blog post...');
    const { data, error } = await supabase
        .from('blog_posts')
        .upsert([article], { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('❌ Error inserting post:', error);
    } else {
        console.log('✅ Post inserted successfully:', data[0].title);
    }
}

addPost();
