import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    schema?: object | object[];
    robots?: string;
}

export default function SEO({
    title,
    description,
    keywords,
    image = 'https://sushidemaksim.vercel.app/og-image.jpg',
    url = 'https://sushidemaksim.vercel.app',
    type = 'website',
    schema,
    robots = 'index, follow',
}: SEOProps) {
    const fullTitle = `${title} | Sushi de Maksim`;
    const canonicalURL = url.endsWith('/') ? url : `${url}/`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content={robots} />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalURL} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Sushi de Maksim" />
            <meta property="og:locale" content="es_ES" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalURL} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <link rel="canonical" href={canonicalURL} />

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
