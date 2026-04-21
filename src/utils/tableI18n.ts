import { useMemo } from 'react';

export type SupportedLanguage = 'ru' | 'es' | 'en';

export const translations = {
    ru: {
        welcome_title: 'Специальное предложение',
        welcome_text: 'Зарегистрируйтесь на сайте и получите скидку 10% на ваш первый заказ!',
        register_btn: 'Зарегистрироваться',
        skip_btn: 'Позже',
        view_cart: 'В КОРЗИНУ',
        your_order: 'Ваш заказ',
        food: 'Еда',
        drinks: 'Напитки',
        total: 'Итого',
        items: 'позиции',
        item: 'позиция',
        empty_cart: 'Корзина пуста',
        place_order: 'ОФОРМИТЬ ЗАКАЗ',
        continue_adding: 'Продолжить выбор',
        table_ordering: 'Заказ за столом',
        digital_menu: 'Цифровое меню',
        fast_easy: 'Быстро и удобно в Sushi de Maksim.',
        selection: 'Наше меню',
        desktop_restriction:
            'Пожалуйста, откройте это меню на мобильном телефоне для удобного заказа за столом.',
        scan_to_order: 'Сканируйте QR-код на столе',
        join_club: 'Вступить в клуб',
        hey: 'Эй!',
        mobile_only: 'Только мобильный',
        cat_entrantes: 'Закуски',
        'cat_rollos-grandes': 'Rollos Grandes',
        'cat_rollos-clasicos': 'Классика',
        'cat_rollos-fritos': 'Темпура',
        cat_sopas: 'Супы',
        cat_menus: 'Сеты',
        cat_extras: 'Добавки',
        cat_bebidas: 'Напитки',
        cat_postre: 'Десерты',
        made_with: 'Сделано с',
        in_madrid: 'в Мадриде',
    },
    es: {
        welcome_title: 'Oferta Especial',
        welcome_text:
            '¡Regístrate en nuestra web y recibe un 10% de descuento en tu primer pedido!',
        register_btn: 'Registrarse',
        skip_btn: 'Más tarde',
        view_cart: 'VER CARRITO',
        your_order: 'Tu Pedido',
        food: 'Comida',
        drinks: 'Bebidas',
        total: 'Total',
        items: 'productos',
        item: 'producto',
        empty_cart: 'Pedido Vacío',
        place_order: 'REALIZAR PEDIDO',
        continue_adding: 'Continuar añadiendo',
        table_ordering: 'Pedido en Mesa',
        digital_menu: 'Menú Digital',
        fast_easy: 'Rápido y fácil en Sushi de Maksim.',
        selection: 'Nuestro Menú',
        desktop_restriction:
            'Por favor, abre este menú en tu móvil para realizar el pedido de forma cómoda.',
        scan_to_order: 'Escanea el código QR de tu mesa',
        join_club: 'Únete al club',
        hey: '¡Hola!',
        mobile_only: 'Sólo móvil',
        cat_entrantes: 'Entrantes',
        'cat_rollos-grandes': 'Rollos Grandes',
        'cat_rollos-clasicos': 'Rollos Clasicos',
        'cat_rollos-fritos': 'Rollos Fritos',
        cat_sopas: 'Sopas',
        cat_menus: 'Menús',
        cat_extras: 'Extras',
        cat_bebidas: 'Bebidas',
        cat_postre: 'Postre',
        made_with: 'Hecho con',
        in_madrid: 'en Madrid',
    },
    en: {
        welcome_title: 'Special Offer',
        welcome_text: 'Register on our website and get a 10% discount on your first order!',
        register_btn: 'Register Now',
        skip_btn: 'Later',
        view_cart: 'VIEW CART',
        your_order: 'Your Order',
        food: 'Food',
        drinks: 'Drinks',
        total: 'Total',
        items: 'items',
        item: 'item',
        empty_cart: 'Empty Order',
        place_order: 'PLACE ORDER',
        continue_adding: 'Continue Adding',
        table_ordering: 'Table Ordering',
        digital_menu: 'Digital Menu',
        fast_easy: 'Fast and easy at Sushi de Maksim.',
        selection: 'Our Menu',
        desktop_restriction:
            'Please open this menu on your mobile for a better ordering experience.',
        scan_to_order: 'Scan the QR code on your table',
        join_club: 'Join the club',
        hey: 'Hey!',
        mobile_only: 'Mobile Only',
        cat_entrantes: 'Appetizers',
        'cat_rollos-grandes': 'Rollos Grandes',
        'cat_rollos-clasicos': 'Classic Rolls',
        'cat_rollos-fritos': 'Tempura Rolls',
        cat_sopas: 'Soups',
        cat_menus: 'Combos',
        cat_extras: 'Extras',
        cat_bebidas: 'Drinks',
        cat_postre: 'Dessert',
        made_with: 'Made with',
        in_madrid: 'in Madrid',
    },
};

export const useTableI18n = () => {
    const lang: SupportedLanguage = useMemo(() => {
        // Support URL override for testing (e.g. ?lang=es)
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang')?.toLowerCase();
        if (urlLang === 'ru' || urlLang === 'es' || urlLang === 'en') {
            return urlLang as SupportedLanguage;
        }

        const browserLang = navigator.language.split('-')[0].toLowerCase();
        if (browserLang === 'ru') return 'ru';
        if (browserLang === 'es') return 'es';
        return 'en'; // Default to English
    }, []);

    const t = (key: keyof typeof translations.en) => {
        return translations[lang][key] || translations.en[key];
    };

    return { t, lang };
};
