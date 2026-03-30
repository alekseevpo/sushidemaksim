import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeliveryForm from './DeliveryForm';

// Mock Lucide icons to speed up tests and avoid potential SVG issues
vi.mock('lucide-react', () => ({
    MapPin: () => <div data-testid="map-pin" />,
    Truck: () => <div data-testid="truck" />,
    Store: () => <div data-testid="store" />,
    CreditCard: () => <div data-testid="credit-card" />,
    Wallet: () => <div data-testid="wallet" />,
    Smartphone: () => <div data-testid="smartphone" />,
    Users: () => <div data-testid="users" />,
    Minus: () => <div data-testid="minus">minus</div>,
    Plus: () => <div data-testid="plus">plus</div>,
    Calendar: () => <div data-testid="calendar" />,
    ChevronLeft: () => <div data-testid="chevron-left" />,
    ChevronRight: () => <div data-testid="chevron-right" />,
}));

// Mock triggerHaptic
vi.mock('../../utils/haptics', () => ({
    triggerHaptic: vi.fn(),
}));

// Mock tracker
vi.mock('../../analytics/tracker', () => ({
    tracker: {
        track: vi.fn(),
    },
}));

describe('DeliveryForm', () => {
    const defaultProps = {
        deliveryType: 'delivery' as any,
        setDeliveryType: vi.fn(),
        address: '',
        setAddress: vi.fn(),
        house: '',
        setHouse: vi.fn(),
        apartment: '',
        setApartment: vi.fn(),
        postalCode: '',
        setPostalCode: vi.fn(),
        phone: '',
        setPhone: vi.fn(),
        customerNameState: '',
        setCustomerNameState: vi.fn(),
        guestEmailState: '',
        setGuestEmailState: vi.fn(),
        paymentMethod: null as any,
        setPaymentMethod: vi.fn(),
        isScheduled: false,
        setIsScheduled: vi.fn(),
        scheduledDate: '',
        setScheduledDate: vi.fn(),
        scheduledTime: '',
        setScheduledTime: vi.fn(),
        noCall: false,
        setNoCall: vi.fn(),
        noBuzzer: false,
        setNoBuzzer: vi.fn(),
        customNote: '',
        setCustomNote: vi.fn(),
        selectedZone: null,
        setIsAddressModalOpen: vi.fn(),
        user: null,
        isAuthenticated: false,
        todayStr: '2026-03-30',
        isStoreClosed: false,
        saveAddress: false,
        setSaveAddress: vi.fn(),
        guestsCount: 2,
        setGuestsCount: vi.fn(),
    };

    it('renders initial state correctly (delivery mode)', () => {
        render(<DeliveryForm {...defaultProps} />);
        expect(screen.getByText(/Datos de entrega/i)).toBeInTheDocument();
        expect(screen.getByText(/Domicilio/i)).toBeInTheDocument();
        expect(screen.getByText(/Recogida/i)).toBeInTheDocument();
        expect(screen.getByText(/¿Dónde entregamos el pedido\?/i)).toBeInTheDocument();
    });

    it('switches between delivery types', () => {
        render(<DeliveryForm {...defaultProps} />);
        const pickupButton = screen.getByText(/Recogida/i);
        fireEvent.click(pickupButton);
        expect(defaultProps.setDeliveryType).toHaveBeenCalledWith('pickup');

        const reservationButton = screen.getByText(/Reserva/i);
        fireEvent.click(reservationButton);
        expect(defaultProps.setDeliveryType).toHaveBeenCalledWith('reservation');
    });

    it('shows pickup point information when deliveryType is pickup', () => {
        render(<DeliveryForm {...defaultProps} deliveryType="pickup" />);
        expect(screen.getByText(/Punto de Recogida/i)).toBeInTheDocument();
        expect(screen.getByText(/Calle Barrilero, 20/i)).toBeInTheDocument();
    });

    it('opens address modal when clicking address input', () => {
        render(<DeliveryForm {...defaultProps} />);
        const addressButton = screen.getByTestId('address-input');
        fireEvent.click(addressButton);
        expect(defaultProps.setIsAddressModalOpen).toHaveBeenCalledWith(true);
    });

    it('renders address details when address is provided', () => {
        render(<DeliveryForm {...defaultProps} address="Calle Mayor" house="1" />);
        expect(screen.getByText(/Calle Mayor 1/i)).toBeInTheDocument();
    });

    it('sets payment method correctly', () => {
        render(<DeliveryForm {...defaultProps} />);
        const cardButton = screen.getByTestId('payment-method-card');
        fireEvent.click(cardButton);
        expect(defaultProps.setPaymentMethod).toHaveBeenCalledWith('card');

        const cashButton = screen.getByTestId('payment-method-cash');
        fireEvent.click(cashButton);
        expect(defaultProps.setPaymentMethod).toHaveBeenCalledWith('cash');
    });

    it('handles contact information inputs for guest users', () => {
        render(<DeliveryForm {...defaultProps} isAuthenticated={false} />);
        const nameInput = screen.getByPlaceholderText(/Ej: Juan Pérez/i);
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(defaultProps.setCustomerNameState).toHaveBeenCalledWith('John Doe');

        const phoneInput = screen.getByPlaceholderText(/\+34 600 000 000/i);
        fireEvent.change(phoneInput, { target: { value: '600111222' } });
        expect(defaultProps.setPhone).toHaveBeenCalledWith('600111222');
    });

    it('toggles checkboxes (noCall, noBuzzer, isScheduled)', () => {
        render(<DeliveryForm {...defaultProps} />);
        const noCallCheckbox = screen.getByLabelText(/Sin llamada de confirmación/i);
        fireEvent.click(noCallCheckbox);
        expect(defaultProps.setNoCall).toHaveBeenCalledWith(true);

        const noBuzzerCheckbox = screen.getByLabelText(/No llamar al timbre/i);
        fireEvent.click(noBuzzerCheckbox);
        expect(defaultProps.setNoBuzzer).toHaveBeenCalledWith(true);

        const isScheduledCheckbox = screen.getByLabelText(/Entrega programada/i);
        fireEvent.click(isScheduledCheckbox);
        expect(defaultProps.setIsScheduled).toHaveBeenCalledWith(true);
    });

    it('displays scheduling options when isScheduled is true', () => {
        render(<DeliveryForm {...defaultProps} isScheduled={true} />);
        // Use getAllByText and check for presence since there might be multiple (labels + summary info)
        expect(screen.getAllByText(/Fecha/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Hora/i).length).toBeGreaterThan(0);
    });

    it('handles guests count in reservation mode', () => {
        render(
            <DeliveryForm
                {...defaultProps}
                deliveryType="reservation"
                isScheduled={true}
                guestsCount={4}
            />
        );
        expect(screen.getByText('4')).toBeInTheDocument();

        const plusButton = screen.getByTestId('plus').parentElement;
        if (plusButton) {
            fireEvent.click(plusButton);
            expect(defaultProps.setGuestsCount).toHaveBeenCalledWith(5);
        }

        const minusButton = screen.getByTestId('minus').parentElement;
        if (minusButton) {
            fireEvent.click(minusButton);
            expect(defaultProps.setGuestsCount).toHaveBeenCalledWith(3);
        }
    });

    it('updates custom note', () => {
        render(<DeliveryForm {...defaultProps} />);
        const noteArea = screen.getByPlaceholderText(/Ej. Quitar pepino/i);
        fireEvent.change(noteArea, { target: { value: 'Extra ginger please' } });
        expect(defaultProps.setCustomNote).toHaveBeenCalledWith('Extra ginger please');
    });
});
