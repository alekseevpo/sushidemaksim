-- Таблица для статей блога
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- url-friendly ссылка, например: "5-curiosidades-del-sushi"
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL, -- Полный текст статьи (поддерживает Markdown или HTML)
    image_url TEXT,
    author TEXT DEFAULT 'Chef Maksim',
    read_time VARCHAR(20) DEFAULT '5 min',
    category VARCHAR(50) DEFAULT 'General',
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Добавим стартовые данные, чтобы блог не был пустым
INSERT INTO public.blog_posts (title, slug, excerpt, content, image_url, author, read_time, category, published)
VALUES 
(
    'El arte de preparar el arroz para sushi: Secretos del Chef',
    'el-arte-de-preparar-el-arroz-para-sushi',
    'Descubre por qué el arroz es el alma de cada pieza de sushi y cómo logramos esa textura perfecta en Sushi de Maksim.',
    'El arroz es el corazón del sushi. Aunque muchos piensan que el secreto está solo en el pescado, en realidad, un buen itamae (chef de sushi) pasa años perfeccionando su técnica para preparar el arroz. Aquí te contamos algunos de nuestros secretos: usamos arroz de grano corto premium, vinagre de arroz importado, y una técnica de enfriado con abanico (uchiwa) que le da ese brillo característico.',
    '/blog_post_chef_hands.png',
    'Chef Maksim',
    '5 min',
    'Gastronomía',
    true
),
(
    '5 Curiosidades del Sushi que probablemente no conocías',
    '5-curiosidades-del-sushi',
    'Desde su origen como método de conservación hasta el significado real del wasabi. Un viaje por la historia de Japón.',
    '¿Sabías que el sushi originalmente no se comía fresco? En sus orígenes, el arroz fermentado se usaba simplemente para conservar el pescado, y el arroz ¡se tiraba! Hoy en día, es un arte culinario mundial. Otra curiosidad: el wasabi real es extremadamente caro y difícil de cultivar; la mayoría de lo que consumimos es en realidad rábano picante teñido de verde.',
    '/blog_post_sushi_art.png',
    'Equipo Editorial',
    '4 min',
    'Cultura',
    true
),
(
    'Cómo maridar tu Sushi con la bebida perfecta',
    'como-maridar-tu-sushi',
    'Guía rápida para elegir entre Sake, vino blanco o té verde y potenciar los sabores de nuestros rolls artesanales.',
    'El maridaje ideal puede elevar tu experiencia con el sushi a otro nivel. Aunque el Sake (vino de arroz japonés) es la opción tradicional por excelencia, no es la única. Un vino blanco seco y crujiente, como un Sauvignon Blanc o un Albariño español, limpia el paladar maravillosamente entre deliciosas piezas de atún toro. Para opciones sin alcohol, el té verde caliente es insuperable para la digestión.',
    '/blog_post_wasabi.png',
    'Sommelier',
    '6 min',
    'Maridaje',
    true
);
