/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App.tsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Replace with your actual Google reCAPTCHA v3 Site Key
const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdsdowsAAAAAGuwUCjrDuHALVKaiATr87p91b3L';

root.render(
    <React.StrictMode>
        <HelmetProvider>
            <GoogleReCaptchaProvider
                reCaptchaKey={RECAPTCHA_SITE_KEY}
                language="es"
                useRecaptchaNet
            >
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <App />
                    <SpeedInsights />
                    <Analytics />
                </BrowserRouter>
            </GoogleReCaptchaProvider>
        </HelmetProvider>
    </React.StrictMode>
);
