import { Waves, Fish, Flame, Soup, Gift, Droplets, Cake } from 'lucide-react';

export const CATEGORIES = [
    {
        id: 'entrantes',
        name: 'Entrantes',
        icon: Waves,
        description:
            'Nuestros entrantes japoneses más populares: gyozas crujientes, edamame al punto de sal y ensaladas frescas ideales para comenzar.',
    },
    {
        id: 'rollos-grandes',
        name: 'Rollos Grandes',
        icon: Fish,
        description:
            'Famosos Rolls XL elaborados con arroz premium y pescado de la más alta calidad: Atún Balfegó y Salmón Noruego.',
    },
    {
        id: 'rollos-clasicos',
        name: 'Rollos Clasicos',
        icon: Fish,
        description:
            'La esencia del sushi tradicional: Makis, Uramakis y Rolls clásicos para los paladares más puristas.',
    },
    {
        id: 'rollos-fritos',
        name: 'Rollos Fritos',
        icon: Flame,
        description:
            'Crujientes por fuera y jugosos por dentro. Prueba nuestra selección de Hot Rolls fritos al momento.',
    },
    {
        id: 'sopas',
        name: 'Sopas',
        icon: Soup,
        description:
            'Sopas tradicionales japonesas para reconfortar el cuerpo: Miso y otras especialidades calientes.',
    },
    {
        id: 'menus',
        name: 'Menús',
        icon: Gift,
        description:
            'Nuestras mejores combinaciones y botes de sushi ideales para compartir con amigos o en pareja.',
    },
    {
        id: 'extras',
        name: 'Extras',
        icon: Droplets,
        description:
            'Salsas caseras (soja, teriyaki, picante) y complementos para personalizar tu pedido al máximo.',
    },
    {
        id: 'postre',
        name: 'Postre',
        icon: Cake,
        description:
            'El toque dulce final: Mochis artesanales y postres típicos para cerrar con broche de oro.',
    },
];

export const EMOJI: Record<string, string> = {
    entrantes: '🥟',
    'rollos-grandes': '🍣',
    'rollos-clasicos': '🥢',
    'rollos-fritos': '🔥',
    sopas: '🍜',
    menus: '🎁',
    extras: '🧴',
    postre: '🍰',
};
