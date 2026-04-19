# 🍣 Sushi de Maksim — Auténtica Cocina Japonesa en Madrid

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![CI](https://github.com/alekseevpo/sushidemaksim/actions/workflows/ci.yml/badge.svg)](https://github.com/alekseevpo/sushidemaksim/actions)

Plataforma premium de e-commerce gastronómico con pedidos a domicilio, panel de administración en
tiempo real и программа de fidelización integrado.

[**🌐 Ver sitio web**](https://www.sushidemaksim.com) ·
[**📱 Menú**](https://www.sushidemaksim.com/menu) · [**📝 Blog**](https://www.sushidemaksim.com/blog)

---

## ✨ Características

### 🍱 E-commerce & Cliente

-   **Menú interactivo** — 58+ platos por categorías (Rolls, Nigiri, Entrantes, Sopas, Postres,
    Bebidas) con navegación "sticky" y búsqueda
-   **Carrito en tiempo real** — Cálculo instantáneo con extras (palillos, wasabi, jengibre), selector
    de cantidad y validación Zod
-   **Sistema de favoritos** — Guardar platos preferidos para pedidos rápidos
-   **Tracking de pedidos** — Seguimiento en tiempo real con estados y notificaciones por email
-   **Zona de reparto** — Mapa interactivo Leaflet con verificación de dirección y cálculo de envío
-   **Blog & Recetas** — Espacio dedicado a la cultura del sushi y promociones
-   **PWA** — Instalable como app nativa con Service Worker y cache offline
-   **SEO optimizado** — Meta tags dinámicos, JSON-LD (Restaurant + Menu), sitemap automático

### 🎁 Programa de Fidelización

-   **Descuento cada 5° pedido** — Código -5% automático enviado por email
-   **Roll Dulce de regalo cada 10° pedido** — Código promocional exclusivo
-   **Bonus de cumpleaños** — Descuento especial personalizado
-   **Descuento de bienvenida** — Cupón tras el registro y verificación de email
-   **Newsletter bonus** — Descuento por suscripción

### 🛡️ Panel de Administración

-   **Dashboard аналитический** — Ventas, pedidos diarios, ticket medio, tendencias и dispositivos
    (Recharts)
-   **Gestión de menú** — CRUD completo con subida de imágenes, optimización automática a WebP
    (Sharp), etiquetas (Picante, Veggie, Chef, Nuevo)
-   **Gestión de pedidos** — Estados en tiempo real con alertas sonoras para nuevas comandas
-   **Promociones dinámicas** — Banners и tarjetas promocionales con soporte de imágenes, drag & drop
    para reordenar
-   **Programa de lealtad** — Toggles и configuración de todos los bonos desde el panel
-   **Gestión de usuarios** — Roles (admin, waiter, user), historial и promociones por cliente

### 👨‍🍳 Panel de Camarero

-   **Comanda rápida** — Interfaz móvil optimizada para tomar pedidos en sala
-   **Separación Comida/Bebidas** — Tabs dedicados para agilizar el servicio
-   **Envío a cocina** — Registro automático del pedido con nombre del camarero

### 🚀 Rendimiento

-   **Core Web Vitals** — LCP < 2.5s, CLS < 0.1, INP < 200ms
-   **Lazy loading** — Todas las páginas cargadas con `React.lazy()` + Suspense
-   **Skeletons** — Transiciones sin CLS con estados de carga precisos
-   **Imágenes WebP** — Compresión automática a 80% calidad, max 800px (Sharp)
-   **Leaflet dinámico** — Mapa cargado sólo cuando se necesita (dynamic import)

---

## 🏗️ Arquitectura

```
sushidemaksim/
├── src/                          # Frontend (React + TypeScript)
│   ├── pages/                    # 16 páginas (lazy-loaded)
│   ├── components/               # Componentes reutilizables
│   │   ├── admin/                #   Panel de administración
│   │   ├── cart/                 #   Carrito y checkout
│   │   ├── menu/                 #   Menú y productos
│   │   ├── profile/              #   Perfil de usuario
│   │   ├── skeletons/            #   Loading states
│   │   ├── common/               #   Componentes compartidos
│   │   └── ui/                   #   Componentes base
│   ├── hooks/                    # Custom hooks + React Query
│   ├── context/                  # Auth, Toast, Cart providers
│   ├── schemas/                  # Validación Zod
│   ├── constants/                # Config del menú, rutas
│   ├── analytics/                # Tracking de eventos
│   ├── types/                    # TypeScript types + Supabase
│   └── utils/                    # API client, image helpers
├── server/                       # Backend (Node.js + Express)
│   └── src/
│       ├── routes/               # API endpoints (admin, user, orders)
│       ├── middleware/            # Auth, admin, rate-limit
│       └── utils/                # Email templates, image processing
├── api/                          # Vercel Serverless entry point
│   └── [...path].ts              # Catch-all → Express app
├── tests/                        # Playwright E2E tests
├── src/test/                     # Vitest unit tests
└── vercel.json                   # Routing & rewrites config
```

---

## 🛠️ Tech Stack

| Capa              | Tecnología                            |
| ----------------- | ------------------------------------- |
| **Frontend**      | React 18, TypeScript 5, Vite 4        |
| **Estilos**       | Tailwind CSS 3 (mobile-first)         |
| **Animaciones**   | Framer Motion 12                      |
| **State**         | React Context + TanStack Query 5      |
| **Validación**    | Zod                                   |
| **Routing**       | React Router 6                        |
| **Mapas**         | Leaflet (dynamic import)              |
| **Backend**       | Node.js, Express 4                    |
| **Base de datos** | PostgreSQL (Supabase)                 |
| **Storage**       | Supabase Storage (WebP images)        |
| **Auth**          | JWT + bcrypt                          |
| **Email**         | Nodemailer (HTML templates)           |
| **Imágenes**      | Sharp (resize + WebP)                 |
| **Seguridad**     | Helmet, CORS, reCAPTCHA v3, RLS       |
| **Deploy**        | Vercel (serverless)                   |
| **CI/CD**         | GitHub Actions (lint + test + build)  |
| **Tests**         | Vitest (unit) + Playwright (E2E)      |
| **PWA**           | vite-plugin-pwa + Service Worker      |

---

## 🚀 Instalación

### Requisitos

-   Node.js ≥ 18
-   npm ≥ 9
-   Cuenta en [Supabase](https://supabase.com) (para DB + Storage)

### Setup

```bash
# Clonar repositorio
git clone https://github.com/alekseevpo/sushidemaksim.git
cd sushidemaksim

# Instalar dependencias (cliente + servidor)
npm install
cd server && npm install && cd ..

# Configurar variables de entorno
cp .env.example .env
```

### Variables de entorno

```env
# .env (raíz del proyecto)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Variables del servidor
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_service_role_key
JWT_SECRET=tu_secreto_jwt
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
RECAPTCHA_SECRET_KEY=tu_clave_recaptcha
FRONTEND_URL=http://localhost:5173
```

### Comandos

```bash
npm run dev            # Arrancar cliente + servidor concurrentemente
npm run build          # Build de producción (tsc + vite build)
npm run lint           # Linter (ESLint)
npm run test:unit      # Tests unitarios (Vitest)
npm run test:e2e       # Tests E2E (Playwright)
npm run test           # Todos los tests
npm run preview        # Preview del build de producción
```

---

## 🧪 Testing

| Tipo        | Herramienta | Directorio  | Comando             |
| ----------- | ----------- | ----------- | ------------------- |
| Unit tests  | Vitest      | `src/test/` | `npm run test:unit` |
| E2E tests   | Playwright  | `tests/`     | `npm run test:e2e`  |
| Lint        | ESLint      | —           | `npm run lint`      |
| Format      | Prettier    | —           | `npm run format:check` |

CI/CD pipeline ejecuta automáticamente lint + unit tests + build en cada push a `main`.

---

## 📦 Deploy

El proyecto se despliega automáticamente en **Vercel** al hacer push a la rama `main`.

-   **Frontend**: Se construye como SPA estática (Vite)
-   **Backend**: Se ejecuta como Serverless Function (`api/[...path].ts` → Express)
-   **Dominio**: [www.sushidemaksim.com](https://www.sushidemaksim.com)
-   **DNS**: Vercel Nameservers (`ns1.vercel-dns.com`)

### Arquitectura del deploy

```
Cliente (browser)
    │
    ├── Páginas estáticas ──→ Vercel Edge Network (CDN)
    │
    ├── /api/* ──→ api/[...path].ts ──→ Express app (Serverless)
    │                                       │
    │                                       ├── Supabase PostgreSQL (DB)
    │                                       └── Supabase Storage (imágenes)
    │
    └── Imágenes menú ──→ Supabase CDN
```

---

## 🤝 Desarrollo

Desarrollado con ❤️ por [**SelenIT**](https://github.com/alekseevpo) & **Pavel Alekseev**.

© 2025–2026 Sushi de Maksim. Todos los derechos reservados.
