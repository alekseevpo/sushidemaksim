import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    schema?: object | object[];
}

export default function SEO({
    title,
    description,
    keywords,
    image = 'https://sushidemaksim.com/sushi-hero.jpg',
    url = 'https://sushidemaksim.com',
    type = 'website',
    schema,
}: SEOProps) {
    const fullTitle = `${title} | Sushi de Maksim`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Sushi de Maksim" />
            <meta property="og:locale" content="es_ES" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (Schema.org) */}
            {schema &&
                (Array.isArray(schema) ? schema : [schema]).map((s, i) => (
                    <script key={i} type="application/ld+json">
                        {JSON.stringify(s)}
                    </script>
                ))}
        </Helmet>
    );
}
