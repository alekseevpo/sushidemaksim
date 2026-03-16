import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock the ToastContext globally to prevent tests from failing due to missing Provider
vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        showToast: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

// Mock IntersectionObserver which is missing in JSDOM but needed by Framer Motion
class IntersectionObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
});


