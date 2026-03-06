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
}

export interface CartItem extends SushiItem {
    quantity: number;
}

export interface UserAddress {
    id: string;
    label: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
    isDefault: boolean;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    deliveryAddress: string;
    phoneNumber: string;
    notes?: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    createdAt: string;
    estimatedDeliveryTime: string;
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
    is_superadmin?: number;
}
