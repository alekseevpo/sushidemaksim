import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../constants/config';

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
    image = `${SITE_URL}/og-image.jpg`,
    url = SITE_URL,
    type = 'website',
    schema,
    robots = 'index, follow',
}: SEOProps) {
    const brandSuffix = ' | Sushi de Maksim';
    const fullTitle = title.includes('Sushi de Maksim') ? title : `${title}${brandSuffix}`;

    // If url is not provided, build it from the current path
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalURL = url || `${SITE_URL}${currentPath}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content={robots} />
            <meta name="theme-color" content="#fd6e2b" />
            <meta name="apple-mobile-web-app-title" content="Sushi Maksim" />
            <meta name="application-name" content="Sushi de Maksim" />

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
