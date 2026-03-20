import { Waves, Fish, Flame, Soup, Gift, Droplets, Cake } from 'lucide-react';

export const CATEGORIES = [
    { id: 'entrantes', name: 'Entrantes', icon: Waves },
    { id: 'rollos-grandes', name: 'Rollos Grandes', icon: Fish },
    { id: 'rollos-clasicos', name: 'Rollos Clasicos', icon: Fish },
    { id: 'rollos-fritos', name: 'Rollos Fritos', icon: Flame },
    { id: 'sopas', name: 'Sopas', icon: Soup },
    { id: 'menus', name: 'Menús', icon: Gift },
    { id: 'extras', name: 'Extras', icon: Droplets },
    { id: 'postre', name: 'Postre', icon: Cake },
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
