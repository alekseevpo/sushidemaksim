import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartSuggestions from './CartSuggestions';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="sparkles" />,
    Plus: () => <div data-testid="plus" />,
    Minus: () => <div data-testid="minus" />,
}));

// Mock optimized image util
vi.mock('../../utils/images', () => ({
    getOptimizedImageUrl: (url: string) => url,
}));

const mockSuggestions = [
    {
        id: 1,
        name: 'Sake Sushi',
        description: 'Salmon sushi',
        price: 5.5,
        image: 'sake.jpg',
        category: 'entrantes',
    },
    {
        id: 2,
        name: 'Maguro Nigiri',
        description: 'Tuna sushi',
        price: 6.5,
        image: 'maguro.jpg',
        category: 'sushi',
    },
];

describe('CartSuggestions', () => {
    const defaultProps = {
        suggestions: mockSuggestions,
        isLoadingSuggestions: false,
        handleAddToCart: vi.fn(),
        getCategoryEmoji: vi.fn(() => '🍣'),
    };

    it('renders loading state correctly', () => {
        render(<CartSuggestions {...defaultProps} isLoadingSuggestions={true} />);
        expect(screen.queryByText(/Completa tu pedido/i)).not.toBeInTheDocument();
    });

    it('renders suggestions correctly', () => {
        render(<CartSuggestions {...defaultProps} />);
        expect(screen.getByText(/Completa tu pedido/i)).toBeInTheDocument();
        expect(screen.getByText('Sake Sushi')).toBeInTheDocument();
        expect(screen.getByText('5,50€')).toBeInTheDocument();
    });

    it('returns null when suggestions are empty', () => {
        const { container } = render(<CartSuggestions {...defaultProps} suggestions={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('updates quantity locally', () => {
        render(<CartSuggestions {...defaultProps} />);
        const plusButton = screen.getAllByTestId('plus')[0]; // First item plus
        const minusButton = screen.getAllByTestId('minus')[0];

        // Default quantity is 1
        expect(screen.getAllByText('1')).toHaveLength(2); // Two items with quantity 1

        fireEvent.click(plusButton);
        expect(screen.getByText('2')).toBeInTheDocument();

        fireEvent.click(minusButton);
        expect(screen.queryByText('2')).not.toBeInTheDocument();
        expect(screen.getAllByText('1')).toHaveLength(2);
    });

    it('calls handleAddToCart with correct quantity', () => {
        render(<CartSuggestions {...defaultProps} />);
        const plusButton = screen.getAllByTestId('plus')[0];
        const addButton = screen.getAllByTitle('Añadir al pedido')[0];

        fireEvent.click(plusButton); // quantity set to 2
        fireEvent.click(addButton);

        expect(defaultProps.handleAddToCart).toHaveBeenCalledWith(mockSuggestions[0], 2, true);
    });

    it('renders suggested items correctly', () => {
        render(<CartSuggestions {...defaultProps} />);

        // Item 1 should have emoji 🍣 (from mock getCategoryEmoji)
        expect(screen.getByText('🍣')).toBeInTheDocument();
        // Item 2 should have image
        expect(screen.getByAltText('Maguro Nigiri')).toBeInTheDocument();
    });

    it('handles image load error', () => {
        render(<CartSuggestions {...defaultProps} />);
        const img = screen.getByAltText('Sake Sushi');
        fireEvent.error(img);
        // SafeImage handles this internally
    });
});
