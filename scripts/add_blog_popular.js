/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dvsmzciknlfevgxpnefr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_KEY in server/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addBlogPost() {
    const post = {
        title: 'Los 5 tipos de sushi favoritos en España: ¿Por qué nos vuelven locos?',
        slug: 'los-5-tipos-de-sushi-favoritos-en-espana',
        excerpt:
            'Descubre cuáles son los rolls и nigiris que han conquistado el paladar español. Del clásico salmón a las innovaciones más crujientes.',
        content: `
            <p>El sushi ha pasado de ser una curiosidad exótica a convertirse en uno de los platos favoritos en las mesas españolas. Pero, ¿qué es lo que realmente nos gusta pedir cuando abrimos la carta de un restaurante japonés?</p>
            
            <p>En Sushi de Maksim hemos analizado las preferencias de nuestros clientes y las tendencias nacionales para traerte el Top 5 de los sushis más populares en España.</p>

            <h2>1. Nigiri de Salmón: El Rey Indiscutible</h2>
            <p>No hay duda: el salmón es el pescado favorito en España. Su textura grasa y su sabor suave lo hacen perfecto tanto para principiantes como для expertos. Un buen Nigiri de Salmón, con el arroz a la temperatura correcta y un pescado de calidad superior, sigue siendo el pedido número uno.</p>

            <h2>2. California Roll: La Puerta de Entrada</h2>
            <p>Aunque no es una receta tradicional japonesa (nació en EE.UU.), el California Roll es un pilar en España. La combinación de surimi (o cangrejo real), aguacate y pepino es refrescante и equilibrada. Es el roll perfecto para quienes están descubriendo el sushi por primera vez.</p>

            <h2>3. Spicy Tuna Maki: El Toque de Adrenalina</h2>
            <p>A los españoles nos gusta el atún, y si tiene un toque picante, mejor. El Spicy Tuna combina la frescura del atún rojo con una salsa sriracha o mayo-picante que despierta el paladar sin llegar a ser invasiva. Es vibrante, colorido и adictivo.</p>

            <h2>4. Rolls en Tempura (Crunchy Rolls)</h2>
            <p>Si algo define el gusto español por el sushi es nuestra debilidad por las texturas crujientes. Los rolls que van ligeramente fritos en tempura o que llevan cebolla frita y panko por fuera son un éxito total. El contraste entre el interior suave y el exterior "crunchy" es simplemente irresistible.</p>

            <h2>5. Dragon Roll (Langostino en Tempura)</h2>
            <p>El langostino en tempura es otro favorito. El Dragon Roll suele combinar este ingrediente con aguacate y una reducción de salsa unagi (anguila), creando una explosión de sabores dulces y salados que encaja perfectamente con el paladar mediterráneo.</p>

            <h2>La opinión del Chef Maksim</h2>
            <p><em>"Lo que hace que el sushi sea tan popular en España no es solo el pescado, sino cómo hemos sabido integrar ingredientes locales como el aguacate o técnicas como el rebozado para crear una experiencia única. En nuestro local, siempre buscamos ese equilibrio entre la técnica milenaria y el gusto local."</em></p>

            <p>¿Y tú? ¿Eres más de nigiri clásico o te pierdes por un buen roll crujiente? Sea cual sea tu elección, te esperamos en Sushi de Maksim para que lo compruebes por ti mismo.</p>
        `,
        image_url: '/uploads/blog/popular_sushi_spain.jpg',
        category: 'Gastronomía',
        author: 'Chef Maksim',
        read_time: '4 min',
        published: true,
        created_at: new Date().toISOString(),
    };

    console.log('🚀 Adding new blog post to Supabase...');

    const { data, error } = await supabase.from('blog_posts').insert([post]).select();

    if (error) {
        console.error('❌ Error inserting post:', error);
        return;
    }

    console.log('✅ Blog post added successfully:', data[0].title);
}

addBlogPost();
