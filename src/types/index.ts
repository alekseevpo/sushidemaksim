export interface SushiItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category:
        | 'entrantes'
        | 'rollos-grandes'
        | 'rollos-clasicos'
        | 'rollos-fritos'
        | 'sopas'
        | 'menus'
        | 'extras'
        | 'postre';
    weight?: string;
    pieces?: number;
    spicy?: boolean;
    vegetarian?: boolean;
    isPromo?: boolean;
    allergens?: string[];
    isPopular?: boolean;
    isChefChoice?: boolean;
    isNew?: boolean;
}

export interface CartItem extends SushiItem {
    quantity: number;
}

export interface UserAddress {
    id: string;
    label: string;
    street: string;
    house?: string;
    apartment?: string;
    city: string;
    postalCode: string;
    phone: string;
    isDefault: boolean;
}

export type OrderStatus =
    | 'waiting_payment'
    | 'pending'
    | 'received'
    | 'confirmed'
    | 'preparing'
    | 'on_the_way'
    | 'delivered'
    | 'cancelled';

export interface OrderItem {
    id: string | number;
    order_id?: string | number;
    menu_item_id?: string | number;
    name: string;
    price: number;
    price_at_time: number;
    quantity: number;
    image: string;
    description?: string;
    category?: SushiItem['category'];
}

export interface UserStats {
    registrationDate: string;
    orderCount: number;
    totalSpent: number;
    avgCheck: number;
    frequency: string;
    favoriteDish: string;
}

export interface Order {
    id: string | number;
    user_id?: string;
    items?: OrderItem[];
    total: number;
    delivery_address: string;
    phone_number: string;
    status: OrderStatus;
    notes?: string;
    created_at: string;
    updated_at?: string;
    estimated_delivery_time?: string;
    promo_code?: string;
    users?: {
        name: string;
        email: string;
    };
    user_stats?: UserStats;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    avatar?: string;
    birthDate?: string;
    birthDateVerified?: boolean;
    addresses: UserAddress[];
    orders: Order[];
    createdAt: string;
    role?: 'user' | 'admin';
    is_superadmin?: boolean;
    orderCount: number;
    isVerified?: boolean;
}
