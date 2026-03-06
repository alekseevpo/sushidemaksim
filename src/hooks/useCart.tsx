import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, SushiItem } from '../types';
import { api } from '../utils/api';
import { useAuth } from './useAuth';

interface CartContextType {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  addItem: (item: SushiItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.get('/cart');

      // Map API response to our local CartItem type
      const mappedItems = data.items.map((item: any) => ({
        id: item.menu_item_id.toString(), // Keep string IDs for frontend compatibility
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: item.quantity,
      }));

      setItems(mappedItems);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading cart', error);
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItem = async (item: SushiItem) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para añadir a la cesta');
      return;
    }

    // Optimistic UI update
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      setTotal(prev => prev + item.price);
    } else {
      setItems([...items, { ...item, quantity: 1 }]);
      setTotal(prev => prev + item.price);
    }

    try {
      await api.post('/cart', { menuItemId: parseInt(item.id), quantity: 1 });
      await loadCart(); // sync with server
    } catch (e) {
      await loadCart(); // revert on failure
      throw e;
    }
  };

  const removeItem = async (id: string) => {
    // Optimistic UI
    const item = items.find(i => i.id === id);
    if (item) {
      setItems(items.filter(i => i.id !== id));
      setTotal(prev => prev - (item.price * item.quantity));
    }

    try {
      // Find the cart_item.id (we only have menu_item_id as id in frontend cart)
      // The API expects the cart_item id, so we need to fetch the real cart first
      // Actually, since we rewrite /cart to use menu_item_id would be easier, 
      // but let's just reload for removal to be safe, or we can adapt the endpoint.
      // Wait, let's fix the API to delete by menu_item_id for simplicity or we use the cart_item.id.
      // For now, let's just get the cart item id from the loaded items.
      const data = await api.get('/cart');
      const realCartItem = data.items.find((i: any) => i.menu_item_id.toString() === id);

      if (realCartItem) {
        await api.delete(`/cart/${realCartItem.id}`);
      }
      await loadCart();
    } catch (e) {
      await loadCart();
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    // Optimistic update
    const item = items.find(i => i.id === id);
    if (item) {
      const diff = quantity - item.quantity;
      setItems(items.map(i => i.id === id ? { ...i, quantity } : i));
      setTotal(prev => prev + (item.price * diff));
    }

    try {
      const data = await api.get('/cart');
      const realCartItem = data.items.find((i: any) => i.menu_item_id.toString() === id);

      if (realCartItem) {
        await api.put(`/cart/${realCartItem.id}`, { quantity });
      }
      await loadCart();
    } catch (e) {
      await loadCart();
    }
  };

  const clearCart = async () => {
    setItems([]);
    setTotal(0);
    try {
      await api.delete('/cart');
      await loadCart();
    } catch (e) {
      await loadCart();
    }
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
