import { getDb } from './database.js';

const menuItems = [
    // ENTRANTES
    { id: 7, name: 'Gyozas con carne', description: 'Masa, carne, verduras', price: 6.90, image: 'https://sushidemaksim.com/img/products/7/m_7.webp', category: 'entrantes' },
    { id: 9, name: 'Gunkan de Atún', description: 'Atún fresco sobre arroz envuelto en nori', price: 2.50, image: 'https://sushidemaksim.com/img/products/9/m_9.webp', category: 'entrantes' },
    { id: 10, name: 'Langostinos fritos con salsa', description: 'Langostinos crujientes con salsa especial', price: 9.90, image: 'https://sushidemaksim.com/img/products/10/m_10.webp', category: 'entrantes' },
    { id: 11, name: 'Nigiri de Anguila', description: 'Anguila sobre arroz', price: 7.90, image: 'https://sushidemaksim.com/img/products/11/m_11.webp', category: 'entrantes', pieces: 2 },
    { id: 12, name: 'Tequeños con salsa', description: 'Tequeños crujientes con salsa', price: 8.50, image: 'https://sushidemaksim.com/img/products/12/m_12.webp', category: 'entrantes', pieces: 6 },
    { id: 13, name: 'Gunkan Pez Volador', description: 'Huevas de pez volador sobre arroz', price: 2.50, image: 'https://sushidemaksim.com/img/products/13/m_13.webp', category: 'entrantes' },
    { id: 15, name: 'Gunkan Salmón Picante', description: 'Salmón picante sobre arroz', price: 2.50, image: 'https://sushidemaksim.com/img/products/15/m_15.webp', category: 'entrantes', spicy: true },
    { id: 16, name: 'Gunkan Gamba Picante', description: 'Gambas picantes sobre arroz', price: 2.50, image: 'https://sushidemaksim.com/img/products/16/m_16.webp', category: 'entrantes', spicy: true },
    { id: 17, name: 'Nigiri Salmón', description: 'Salmón, wasabi', price: 4.00, image: 'https://sushidemaksim.com/img/products/17/m_17.webp', category: 'entrantes', pieces: 2 },
    { id: 63, name: 'Rollitos de Primavera', description: 'Pollo, verduras, frito', price: 6.00, image: 'https://sushidemaksim.com/img/products/63/m_63.webp', category: 'entrantes', pieces: 8 },
    { id: 105, name: 'Fingers de mozzarella', description: 'Mozzarella crujiente', price: 6.00, image: 'https://sushidemaksim.com/img/products/105/m_105.webp', category: 'entrantes', pieces: 6 },

    // ROLLOS GRANDES
    { id: 19, name: 'Moncloa', description: 'Salmón, queso crema, aguacate, virutas de atún', price: 13.50, image: 'https://sushidemaksim.com/img/products/19/m_19.webp', category: 'rollos-grandes' },
    { id: 20, name: 'Moraleja', description: 'Tortilla de huevo, salmón, pepino, caviar de salmón o pez volador, sésamo', price: 16.90, image: 'https://sushidemaksim.com/img/products/20/m_20.webp', category: 'rollos-grandes' },
    { id: 21, name: 'Rivas', description: 'Atún, salmón, surimi, tobiko, salsa picante', price: 14.50, image: 'https://sushidemaksim.com/img/products/21/m_21.webp', category: 'rollos-grandes', spicy: true },
    { id: 22, name: 'Dragón', description: 'Anguila, salmón, aguacate, pepino, queso crema, salsa unagi, sésamo', price: 16.90, image: 'https://sushidemaksim.com/img/products/22/m_22.webp', category: 'rollos-grandes' },
    { id: 23, name: 'Canada', description: 'Salmón, queso crema, pepino, anguila, salsa unagi', price: 15.95, image: 'https://sushidemaksim.com/img/products/23/m_23.webp', category: 'rollos-grandes' },
    { id: 24, name: 'California', description: 'Aguacate, masago, surimi, pepino', price: 13.50, image: 'https://sushidemaksim.com/img/products/24/m_24.webp', category: 'rollos-grandes' },
    { id: 25, name: 'Chamartín', description: 'Salmón, pepino, queso crema, gambas', price: 14.50, image: 'https://sushidemaksim.com/img/products/25/m_25.webp', category: 'rollos-grandes' },
    { id: 26, name: 'Philadelphia', description: 'Salmón, pepino, queso crema', price: 13.50, image: 'https://sushidemaksim.com/img/products/26/m_26.webp', category: 'rollos-grandes' },
    { id: 27, name: 'Chamberí', description: 'Gambas, queso crema, salmón, daikon', price: 13.50, image: 'https://sushidemaksim.com/img/products/27/m_27.webp', category: 'rollos-grandes' },
    { id: 28, name: 'Manzanares', description: 'Salmón, queso crema, aguacate', price: 15.00, image: 'https://sushidemaksim.com/img/products/28/m_28.webp', category: 'rollos-grandes' },
    { id: 29, name: 'Getafe', description: 'Atún, aguacate, anguila, sésamo, salsa anguila', price: 15.95, image: 'https://sushidemaksim.com/img/products/29/m_29.webp', category: 'rollos-grandes' },
    { id: 32, name: 'Sakura', description: 'Atún, queso crema, masago, langostino', price: 15.00, image: 'https://sushidemaksim.com/img/products/32/m_32.webp', category: 'rollos-grandes' },
    { id: 30, name: 'Estrella', description: 'Gambas, aguacate, masago, salsa picante', price: 13.50, image: 'https://sushidemaksim.com/img/products/30/m_30.webp', category: 'rollos-grandes', spicy: true },
    { id: 95, name: 'Alaska', description: 'Salmón, pepino, queso crema, langostino, aguacate, caviar', price: 15.90, image: 'https://sushidemaksim.com/img/products/95/m_95.webp', category: 'rollos-grandes' },
    { id: 100, name: 'Furia Roja', description: 'Aguacate, queso crema, cangrejo, langostinos, caviar de pez volador, salsa picante', price: 14.95, image: 'https://sushidemaksim.com/img/products/100/m_100.webp', category: 'rollos-grandes', spicy: true },
    { id: 101, name: 'Delicias', description: 'Salmón, langostinos, queso crema, masago', price: 15.95, image: 'https://sushidemaksim.com/img/products/101/m_101.webp', category: 'rollos-grandes' },

    // ROLLOS CLASICOS
    { id: 33, name: 'Clásico con anguila', description: 'Anguila', price: 7.00, image: 'https://sushidemaksim.com/img/products/33/m_33.webp', category: 'rollos-clasicos' },
    { id: 34, name: 'Clásico con atún', description: 'Atún', price: 6.00, image: 'https://sushidemaksim.com/img/products/34/m_34.webp', category: 'rollos-clasicos' },
    { id: 35, name: 'Clásico con aguacate', description: 'Aguacate', price: 6.00, image: 'https://sushidemaksim.com/img/products/35/m_35.webp', category: 'rollos-clasicos', vegetarian: true },
    { id: 36, name: 'Clásico con gambas', description: 'Gambas', price: 6.00, image: 'https://sushidemaksim.com/img/products/36/m_36.webp', category: 'rollos-clasicos' },
    { id: 37, name: 'Clásico con salmón', description: 'Salmón', price: 6.00, image: 'https://sushidemaksim.com/img/products/37/m_37.webp', category: 'rollos-clasicos' },
    { id: 38, name: 'Clásico con pepino', description: 'Pepino', price: 6.00, image: 'https://sushidemaksim.com/img/products/38/m_38.webp', category: 'rollos-clasicos', vegetarian: true },

    // ROLLOS FRITOS / HORNEADOS
    { id: 39, name: 'Volcán', description: 'Langostinos, aguacate, pepino, salmón, salsa picante, caviar', price: 15.95, image: 'https://sushidemaksim.com/img/products/39/m_39.webp', category: 'rollos-fritos', spicy: true },
    { id: 41, name: 'Pacífico', description: 'Langostinos, anguila, aguacate, salsa picante, salsa unagi', price: 16.90, image: 'https://sushidemaksim.com/img/products/41/m_41.webp', category: 'rollos-fritos', spicy: true },
    { id: 42, name: 'Adelfas', description: 'Salmón, queso crema, gamba, aguacate, sésamo, salsa unagi', price: 15.95, image: 'https://sushidemaksim.com/img/products/42/m_42.webp', category: 'rollos-fritos' },
    { id: 43, name: 'Ventas', description: 'Surimi, pepino, mayonesa, pan rallado', price: 13.25, image: 'https://sushidemaksim.com/img/products/43/m_43.webp', category: 'rollos-fritos' },
    { id: 44, name: 'Roll nuevo', description: 'Gambas, pepinos, pan rallado panko, caviar de salmón', price: 15.95, image: 'https://sushidemaksim.com/img/products/44/m_44.webp', category: 'rollos-fritos' },
    { id: 45, name: 'Villaverde', description: 'Salmón, pepino, queso crema, pan rallado panko', price: 14.50, image: 'https://sushidemaksim.com/img/products/45/m_45.webp', category: 'rollos-fritos' },
    { id: 46, name: 'Vicalvaro', description: 'Aguacate, cangrejo, queso crema, pan rallado panko', price: 14.50, image: 'https://sushidemaksim.com/img/products/46/m_46.webp', category: 'rollos-fritos' },
    { id: 47, name: 'Verano', description: '2 tipos de queso, aguacate, salmón, masago, salsa picante', price: 15.95, image: 'https://sushidemaksim.com/img/products/47/m_47.webp', category: 'rollos-fritos', spicy: true },

    // SOPAS
    { id: 104, name: 'Tom Yum', description: 'Langostinos, leche de coco, tomate cherry, pasta tom yum', price: 8.50, image: 'https://sushidemaksim.com/img/products/104/m_104.webp', category: 'sopas', spicy: true },
    { id: 107, name: 'Sopa cremosa de salmón', description: 'Salmón, leche de coco, champiñones, arroz, queso crema, wakame', price: 8.50, image: 'https://sushidemaksim.com/img/products/107/m_107.webp', category: 'sopas' },

    // MENUS PREESTABLECIDOS
    { id: 48, name: 'Cubierto de amor', description: 'Philadelphia, Manzanares, Sakura', price: 40.00, image: 'https://sushidemaksim.com/img/products/48/m_48.webp', category: 'menus', is_promo: true },
    { id: 49, name: 'Chef Gourmet', description: 'Moraleja roll, Adelfas roll, Dragón roll', price: 47.00, image: 'https://sushidemaksim.com/img/products/49/m_49.webp', category: 'menus', is_promo: true },
    { id: 50, name: 'Chef Gourmet XL', description: 'Moraleja roll, Adelfas roll, Dragón roll, Getafe roll, Pacífico roll', price: 74.90, image: 'https://sushidemaksim.com/img/products/50/m_50.webp', category: 'menus', is_promo: true },
    { id: 51, name: '4 XL', description: 'California roll, Chamartín roll, Moncloa roll, Vicalvaro roll', price: 44.00, image: 'https://sushidemaksim.com/img/products/51/m_51.webp', category: 'menus', is_promo: true },
    { id: 52, name: '6XL', description: 'California, Chamartín, Moncloa, Vicalvaro, Delicias, Chamberí', price: 66.00, image: 'https://sushidemaksim.com/img/products/52/m_52.webp', category: 'menus', is_promo: true },
    { id: 53, name: '5 XL', description: 'California, Chamartín, Moncloa, Vicalvaro, Delicias', price: 55.00, image: 'https://sushidemaksim.com/img/products/53/m_53.webp', category: 'menus', is_promo: true },

    // EXTRAS
    { id: 54, name: 'Jengibre', description: 'Jengibre encurtido', price: 0.50, image: 'https://sushidemaksim.com/img/products/54/m_54.webp', category: 'extras', vegetarian: true },
    { id: 55, name: 'Salsa de Soja', description: 'Salsa de soja tradicional', price: 0.50, image: 'https://sushidemaksim.com/img/products/55/m_55.webp', category: 'extras', vegetarian: true },
    { id: 56, name: 'Wasabi', description: 'Wasabi japonés', price: 0.50, image: 'https://sushidemaksim.com/img/products/56/m_56.webp', category: 'extras', vegetarian: true },
    { id: 57, name: 'Palillos', description: 'Palillos de bambú', price: 0.50, image: 'https://sushidemaksim.com/img/products/57/m_57.webp', category: 'extras' },

    // POSTRE
    { id: 106, name: 'Mochi artesano', description: 'Mochi artesanal japonés', price: 5.00, image: 'https://sushidemaksim.com/img/products/106/m_106.webp', category: 'postre', vegetarian: true },
    { id: 108, name: 'Tarta de manzana', description: 'Tarta de manzana casera', price: 3.50, image: 'https://sushidemaksim.com/img/products/108/m_108.webp', category: 'postre', vegetarian: true },
];

export function seedDatabase() {
    const db = getDb();

    const count = db.prepare('SELECT COUNT(*) as count FROM menu_items').get() as { count: number };

    if (count.count > 0) {
        console.log(`📋 Menu already seeded (${count.count} items)`);
        return;
    }

    const insert = db.prepare(`
    INSERT INTO menu_items (id, name, description, price, image, category, pieces, spicy, vegetarian, is_promo)
    VALUES (@id, @name, @description, @price, @image, @category, @pieces, @spicy, @vegetarian, @is_promo)
  `);

    const insertMany = db.transaction((items: typeof menuItems) => {
        for (const item of items) {
            insert.run({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category,
                pieces: (item as any).pieces || null,
                spicy: (item as any).spicy ? 1 : 0,
                vegetarian: (item as any).vegetarian ? 1 : 0,
                is_promo: (item as any).is_promo ? 1 : 0,
            });
        }
    });

    insertMany(menuItems);
    console.log(`🍣 Seeded ${menuItems.length} menu items`);
}

// Run directly if called as script
if (process.argv[1]?.includes('seed')) {
    seedDatabase();
    console.log('✅ Seed complete');
    process.exit(0);
}
