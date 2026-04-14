# 🍣 Sushi de Maksim | Auténtica Cocina Japonesa

![Static Badge](https://img.shields.io/badge/React-18-blue?logo=react)
![Static Badge](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Static Badge](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![Static Badge](https://img.shields.io/badge/Express-4-black?logo=express)
![Static Badge](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

Una plataforma premium de e-commerce gastronómico diseñada para ofrecer la mejor experiencia de usuario en el pedido de sushi a domicilio.

[**🌐 Ver Demo En Vivo**](https://sushidemaksim.vercel.app)

---

## ✨ Características Principales

### 🍱 Experiencia del Cliente

- **Menú Interactivo Premium**: Navegación fluida por categorías (Nigiri, Rolls, Combos) con diseño "Sticky" para facilitar la selección.
- **Sistema de Favoritos**: Los usuarios registrados pueden guardar sus platos preferidos para pedirlos rápidamente después.
- **Gestión de Carrito en Tiempo Real**: Carrito flotante interactivo con cálculos instantáneos de envío y subtotales.
- **Extras & Quantity Control**: Selección inteligente de complementos (palillos, wasabi, jengibre) con selector de cantidad integrado en el carrito y menú.
- **Optimización de Carga (Skeletons)**: Transiciones perfectas sin CLS (Cumulative Layout Shift) mediante el uso de Skeletons precisos y Early-return architecture, asegurando una experiencia visual increíblemente fluida en dispositivos móviles.
- **Blog & Recetas**: Un espacio dedicado a la cultura del sushi, noticias y promociones especiales.
- **Totalmente Responsivo**: Optimización extrema para móviles y tablets, con botones de acción rápida, menús inferior minimalista centrado y navegación táctil intuitiva.

### 🛡️ Panel de Administración (Dashboard)

- **Analítica Avanzada**: Visualización de ventas, pedidos diarios, tickets medios y dispositivos de los clientes a través de gráficos interactivos (Recharts).
- **Gestión de Menú & Stock**: Control total sobre el inventario, precios, etiquetas (Picante, Veggie, Nuevo) y categorías.
- **Control de Pedidos**: Sistema de gestión de estados de pedido con alertas sonoras en tiempo real para nuevas comandas.
- **Gestión de Promociones**: Herramientas integradas para crear y activar banners promocionales dinámicos.

### 🚀 Tecnología & Rendimiento

- **Frontend**: React 18 + Vite para una carga instantánea.
- **Diseño**: Tailwind CSS con estética minimalista y efectos de "Glassmorphism".
- **Animaciones**: Framer Motion para transiciones suaves y micro-interacciones.
- **Backend**: Node.js + Express con arquitectura robusta.
- **Base de Datos**: PostgreSQL para una gestión de datos relacional segura.
- **Seguridad**: Autenticación JWT, cifrado de contraseñas con bcrypt, protección con Helmet y **Google reCAPTCHA v3** en formularios críticos para prevenir spam y ataques automatizados.

---

## 🛠️ Instalación y Configuración

### 1. Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL
- Cuenta en Supabase (opcional para almacenamiento de imágenes)

### 2. Configuración del Repositorio

```bash
git clone https://github.com/alekseevpo/sushidemaksim.git
cd sushidemaksim
```

### 3. Instalación de Dependencias

```bash
# Instalar dependencias del Cliente (Frontend)
npm install

# Instalar dependencias del Servidor (Backend)
cd server && npm install
```

### 4. Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` con las siguientes claves:

```env
PORT=3000
DATABASE_URL=tu_url_de_postgresql
JWT_SECRET=tu_secreto_super_seguro
RECAPTCHA_SECRET_KEY=tu_clave_secreta_de_google
EMAIL_USER=tu_email
EMAIL_PASS=tu_password_de_app
```

### 5. Configuración de reCAPTCHA v3

Para proteger los formularios contra el spam, el proyecto utiliza Google reCAPTCHA v3.

1. Obtén tus claves en [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
2. Añade `RECAPTCHA_SECRET_KEY` en el `.env` del servidor.
3. Actualiza `RECAPTCHA_SITE_KEY` en `src/main.tsx` con tu clave de sitio.

---

## 📸 Estética del Proyecto

El proyecto utiliza una paleta de colores curada y tipografías modernas para transmitir una sensación de "Lujo Accesible".

- **Tipografía**: Inter & Outfit.
- **Colores**: Rojo Maksim (#DC2626), Fondos Crema (#FDFBF7), Sombras Suaves.

---

## 🤝 Desarrollo

Desarrollado con ❤️ por **SelenIT** y **Pavel Alekseev**.

© 2026 Sushi de Maksim. Todos los derechos reservados.

---

_English version available below._

---

# 🍣 Sushi de Maksim | Authentic Japanese Cuisine

A premium gastronomic e-commerce platform designed to offer the best user experience for ordering sushi at home.

## ✨ Key Features

- **Premium Interactive Menu**: Fluid navigation by categories with a "Sticky" design.
- **Advanced Admin Dashboard**: Real-time sales analytics, order management, and stock control.
- **Authentication & Favorites**: Secure system for users to save their preferred items.
- **Extras & Quantity Control**: Smart selection of add-ons (chopsticks, wasabi, ginger) with integrated quantity selectors in the cart and menu.
- **SEO Optimized**: Dynamic metadata and semantic HTML for better search engine ranking.
- **Tech Stack**: React 18, TypeScript, Tailwind CSS, Framer Motion, Express, PostgreSQL.

---

## 🗺️ Roadmap PRO (V4)

Nuestro compromiso con la excelencia continúa. Próximos pasos en el desarrollo:

1. **Arquitectura Limpia**: Refactorización del Backend (Controller-Service-Repository) y modularización de la administración.
2. **Real-time (WebSockets)**: Actualizaciones instantáneas de pedidos para clientes y personal de sala.
3. **Marketing Automatizado**: Sistema de recuperación de carritos abandonados y programa de fidelización por puntos.
4. **Analítica Avanzada**: Mapas de calor de pedidos y análisis ABC de rentabilidad del menú.

---

_Desarrollado con ❤️ por **SelenIT** и **Pavel Alekseev**._
