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

        fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
            target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByPlaceholderText('+34 600 000 000'), {
            target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), {
            target: { value: 'password123' },
        });

        fireEvent.submit(screen.getByTestId('register-form'));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
            expect(mockRegister).toHaveBeenCalledWith(
                'John Doe',
                'john@example.com',
                '123456789',
                'password123'
            );
            expect(mockOnClose).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/menu');
            expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('¡Cuenta creada!'));
        });
    }, 10000); // increase wait time

    it('shows error message on registration failure', async () => {
        mockRegister.mockResolvedValue({ success: false, error: 'Email already exists' });

        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="register" />);

        fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
            target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByPlaceholderText('+34 600 000 000'), {
            target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), {
            target: { value: 'password123' },
        });

        fireEvent.submit(screen.getByTestId('register-form'));

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith('Email already exists');
        });
    });

    it('shows unexpected error message on catch block', async () => {
        mockRegister.mockRejectedValue(new Error('Network Error'));

        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="register" />);

        // Fill only required fields to trigger handleRegister
        fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
            target: { value: 'John' },
        });
        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
            target: { value: 'j@e.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), {
            target: { value: 'pass123' },
        });

        fireEvent.submit(screen.getByTestId('register-form'));

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith('Network Error');
        });
    });
});

const mockPost = vi.fn();
vi.mock('../utils/api', () => ({
    api: {
        post: (...args: any[]) => mockPost(...args),
    },
}));

describe('LoginModal - Password Recovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('switches from login to forgot password mode', () => {
        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="login" />);
        fireEvent.click(screen.getByText('¿Olvidaste?'));
        expect(screen.getByText('Recuperar acceso')).toBeInTheDocument();
        expect(screen.getByText('Te ayudamos a volver.')).toBeInTheDocument();
    });

    it('handles forgot password submission successfully', async () => {
        mockPost.mockResolvedValue({ data: { success: true } });
        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="forgot" />);

        fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.submit(screen.getByText('Enviar instrucciones').closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
                email: 'test@example.com',
            });
            expect(screen.getByText('Verifica tu email')).toBeInTheDocument();
            expect(mockSuccess).toHaveBeenCalledWith('Email de recuperación enviado');
        });
    });

    it('navigates from verify-sent to reset-password when clicking "Introducir el código"', async () => {
        render(<LoginModal isOpen={true} onClose={() => {}} initialMode="verify-sent" />);
        fireEvent.click(screen.getByText('Introducir el código'));
        expect(screen.getByText('Nueva contraseña')).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText('•')).toHaveLength(6);
    });

    it('handles password reset successfully', async () => {
        mockPost.mockResolvedValue({ data: { success: true } });
        const { container } = render(
            <LoginModal isOpen={true} onClose={() => {}} initialMode="reset-password" />
        );

        // Set values in the form
        const codeInput = container.querySelector('input[name="code"]') as HTMLInputElement;
        fireEvent.change(codeInput, { target: { value: '123456' } });

        fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), {
            target: { value: 'newpassword123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repite la contraseña'), {
            target: { value: 'newpassword123' },
        });

        fireEvent.submit(screen.getByText('Cambiar contraseña').closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
                email: '',
                code: '123456',
                newPassword: 'newpassword123',
            });
            expect(screen.getByText('¡Hola de nuevo!')).toBeInTheDocument();
            expect(mockSuccess).toHaveBeenCalledWith(
                expect.stringContaining('Contraseña actualizada')
            );
        });
    });

    it('shows error when passwords do not match in reset mode', async () => {
        const { container } = render(
            <LoginModal isOpen={true} onClose={() => {}} initialMode="reset-password" />
        );

        const codeInput = container.querySelector('input[name="code"]') as HTMLInputElement;
        fireEvent.change(codeInput, { target: { value: '123456' } });

        fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repite la contraseña'), {
            target: { value: 'different' },
        });

        fireEvent.submit(screen.getByText('Cambiar contraseña').closest('form')!);

        expect(mockError).toHaveBeenCalledWith('Las contraseñas no coinciden');
    });
});
