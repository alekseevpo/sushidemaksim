import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItemList from './CartItemList';
import { CartItem } from '../../types';

const mockItems: CartItem[] = [
    {
        id: '1',
        name: 'Gyoza',
        price: 6.9,
        quantity: 1,
        category: 'rollos-grandes',
        image: '',
        description: 'Mock description',
    },
];

describe('CartItemList', () => {
    const defaultProps = {
        items: mockItems,
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
        getCategoryEmoji: vi.fn(() => '🍱'),
        failedImages: new Set<string | number>(),
        setFailedImages: vi.fn(),
        chopsticksCount: 2,
        updateChopsticks: vi.fn(),
    };

    it('renders products and quantities correctly', () => {
        render(<CartItemList {...defaultProps} />);
        expect(screen.getByText('Gyoza')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('6,90 €')).toBeInTheDocument();
    });

    it('renders the soy sauce notice', () => {
        render(<CartItemList {...defaultProps} />);
        expect(
            screen.getByText(/Salsa de soja, wasabi y jengibre están incluidos en su pedido/i)
        ).toBeInTheDocument();
    });

    it('renders the chopsticks question and count', () => {
        render(<CartItemList {...defaultProps} />);
        expect(screen.getByText(/¿Cuántos palillos le pongo\?/i)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('calls updateChopsticks when clicking buttons', () => {
        render(<CartItemList {...defaultProps} />);

        // Let's use getByTestId or labels if they exist.
        // Actually, I can find by svg minus/plus icons if I label them or just search for the buttons near the text.

        const buttons = screen.getAllByRole('button');
        // Let's check the button content or order.
        // 0: Vaciar
        // 1: Minus (item 1)
        // 2: Plus (item 1)
        // 3: Remove (item 1)
        // 4: Minus (chopsticks)
        // 5: Plus (chopsticks)

        const minusChopsticks = buttons[4];
        const plusChopsticks = buttons[5];

        fireEvent.click(plusChopsticks);
        expect(defaultProps.updateChopsticks).toHaveBeenCalledWith(3);

        fireEvent.click(minusChopsticks);
        expect(defaultProps.updateChopsticks).toHaveBeenCalledWith(1);
    });

    it('disables minus button when count is 0', () => {
        render(<CartItemList {...defaultProps} chopsticksCount={0} />);
        const buttons = screen.getAllByRole('button');
        const minusChopsticks = buttons[4];
        expect(minusChopsticks).toBeDisabled();
    });

    it('disables plus button when count is 10', () => {
        render(<CartItemList {...defaultProps} chopsticksCount={10} />);
        const buttons = screen.getAllByRole('button');
        const plusChopsticks = buttons[5];
        expect(plusChopsticks).toBeDisabled();
    });

    it('calls clearCart when clicking the empty button', () => {
        render(<CartItemList {...defaultProps} />);
        const emptyButton = screen.getByText(/Vaciar/i);
        fireEvent.click(emptyButton);
        expect(defaultProps.clearCart).toHaveBeenCalled();
    });

    it('calls updateQuantity or removeItem when clicking item quantity buttons', () => {
        render(<CartItemList {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        const minusItem = buttons[1];
        const plusItem = buttons[2];

        fireEvent.click(plusItem);
        expect(defaultProps.updateQuantity).toHaveBeenCalledWith('1', 2);

        fireEvent.click(minusItem);
        expect(defaultProps.removeItem).toHaveBeenCalledWith('1');
    });

    it('calls updateQuantity when item quantity > 1', () => {
        const manyItems = [{ ...mockItems[0], quantity: 5 }];
        render(<CartItemList {...defaultProps} items={manyItems} />);
        const buttons = screen.getAllByRole('button');
        const minusItem = buttons[1];

        fireEvent.click(minusItem);
        expect(defaultProps.updateQuantity).toHaveBeenCalledWith('1', 4);
    });

    it('calls removeItem when clicking the X button', () => {
        render(<CartItemList {...defaultProps} />);
        const removeButton = screen.getByLabelText(/Eliminar/i);
        fireEvent.click(removeButton);
        expect(defaultProps.removeItem).toHaveBeenCalledWith('1');
    });

    it('calls setFailedImages on image error', () => {
        render(<CartItemList {...defaultProps} />);
        const img = screen.getByRole('img');
        fireEvent.error(img);
        expect(defaultProps.setFailedImages).toHaveBeenCalled();
    });
});
