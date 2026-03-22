import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render, screen, fireEvent, waitFor } from '../test/test-utils';
import LoginModal from './LoginModal';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock hooks
const mockRegister = vi.fn();
const mockLogin = vi.fn();
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        register: mockRegister,
        login: mockLogin,
        user: null,
        isAuthenticated: false,
        isLoading: false,
    }),
}));

const mockSuccess = vi.fn();
const mockError = vi.fn();
vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        success: mockSuccess,
        error: mockError,
    }),
}));

describe('LoginModal - Registration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the registration form when mode is register', async () => {
        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="register" />);

        expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tu nombre completo')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+34 600 000 000')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
        expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    });

    it('submits the form successfully and redirects to menu', async () => {
        mockRegister.mockResolvedValue({ success: true });
        const mockOnClose = vi.fn();

        render(<LoginModal isOpen={true} onClose={mockOnClose} initialMode="register" />);

        fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('+34 600 000 000'), { target: { value: '123456789' } });
        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), { target: { value: 'password123' } });

        fireEvent.submit(screen.getByTestId('register-form'));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
            expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', '123456789', 'password123');
            expect(mockOnClose).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/menu');
            expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('¡Cuenta creada!'));
        });
    }, 10000); // increase wait time

    it('shows error message on registration failure', async () => {
        mockRegister.mockResolvedValue({ success: false, error: 'Email already exists' });

        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="register" />);

        fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('+34 600 000 000'), { target: { value: '123456789' } });
        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), { target: { value: 'password123' } });

        fireEvent.submit(screen.getByTestId('register-form'));

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith('Email already exists');
        });
    });

    it('shows unexpected error message on catch block', async () => {
        mockRegister.mockRejectedValue(new Error('Network Error'));

        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="register" />);

        // Fill only required fields to trigger handleRegister
        fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'j@e.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), { target: { value: 'pass123' } });

        fireEvent.submit(screen.getByTestId('register-form'));

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith('Network Error');
        });
    });
});
