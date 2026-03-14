# 📊 Detailed Project Audit Report: Sushi de Maksim

**Date:** March 14, 2026
**Status:** 🛡️ Comprehensive Audit Completed

---

## 1. Project Overview & Architecture

Sushi de Maksim is a premium sushi delivery platform.

- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js 18 (Express 5/4), Supabase (PostgreSQL), Nodemailer + React Email.
- **Infrastructure**: Vercel (Frontend + Serverless Functions), Supabase (Managed DB & Storage).

---

## 2. Comprehensive Findings

### 🔴 Critical / High Priority

1.  **Search Logic Flaw**: In `AdminOrders.tsx` and `AdminUsers.tsx`, searching is performed on the frontend using `filter()`. Since the API uses pagination, this only searches the _current page_ of results. Search queries should be handled by the backend.
2.  **Missing Bulk Operations**: Syncing a guest cart after login performs sequential POST requests for each item. This is inefficient and prone to partial failures. A `POST /api/cart/bulk` endpoint is needed.
3.  **Vercel Cron Gap**: The `setInterval` background jobs in `index.ts` will not run in a serverless environment (Vercel). The project has `/api/cron/check-late-orders` but it is only scheduled once a day in `vercel.json`. For late order detection (60 min threshold), it should run every 30-60 minutes.
4.  **Backend Error Mapping**: The `errorHandler.ts` still contains logic for SQLite string errors. Since the migration to Supabase (PostgreSQL), it should use PG error codes (e.g., `23505`) for more reliable constraint checking.
5.  **Permissive CSP**: The `helmet` configuration allows `unsafe-inline` and `unsafe-eval`. While sometimes necessary for certain libraries, it should be tightened if possible, especially for `script-src`.

### 🟡 Medium Priority

6.  **Component Modularization**: `AdminPage.tsx` (~1100 lines) and its sub-components like `AdminMenu.tsx` (~800 lines) are exceeding healthy limits. Logic for specific tabs (Dashboard, Analytics) should be extracted.
7.  **Data Fetching Boilerplate**: Most components use `useState` + `useEffect` + `loading` state for every request. This leads to code duplication and lack of caching.
8.  **Type Safety (Any Types)**: There are still multiple instances of `any` types in `AdminPage.tsx`, `useCart.tsx`, and `api.ts`.
9.  **Zustand Consistency**: Previous audit mentioned deprecation warnings. Usage should be standardized to `import { create } from 'zustand'` and avoid deprecated default exports.

### 🟢 Low Priority / Nice to Have

10. **Haptic Feedback Consistency**: Haptics are present (`navigator.vibrate`) but not applied consistently across all interactive elements (e.g., checkout success).
11. **Image Optimization**: Images are served from Supabase Storage. Implementing a proxy or using Next.js-like image optimization would improve mobile performance.

---

## 3. Recommended Roadmaps

### Phase 1: Robust Infrastructure (Immediate)

- [ ] **Backend-Side Search**: Update `/api/admin/orders` and `/api/admin/users` to accept a `q` or `search` parameter and perform `LIKE` queries in PostgreSQL.
- [ ] **Bulk Cart Sync**: Implement `POST /api/cart/bulk` to sync multiple items in one transaction.
- [ ] **PG Error Handling**: Update `server/src/middleware/errorHandler.ts` to recognize PostgreSQL error codes.
- [ ] **Cron Frequency**: Update `vercel.json` cron schedule to `*/30 * * * *` if permissible (or use a dedicated cron service).

### Phase 2: Modern State Management

- [ ] **TanStack Query Migration**: Replace `useEffect` fetching with `useQuery` and `useMutation`. This will provide:
    - Automatic caching (no "flicker" on re-navigation).
    - Unified loading/error states.
    - Optimistic updates for favorites and cart.
    - Background sync for admin stats.

### Phase 3: Architectural Cleanup

- [ ] **Component Splitting**:
    - Extract `AdminDashboard` and `AdminAnalytics` from `AdminPage.tsx`.
    - Extract `OrderItem`, `OrderDetailsModal` from `AdminOrders.tsx`.
- [ ] **Strict Typing**: Create a dedicated `types/api.ts` for backend responses and `types/models.ts` for database entities.

---

## 4. Specific Suggestions for "Wow" Factor

- **Real-time Order Status**: Use Supabase Realtime in `OrderTrackingPage` to update the UI instantly when an admin changes the status, instead of 30s polling.
- **PWA Features**: Add a manifest and service worker to allow "Add to Home Screen" and offline viewing of the menu.
- **Lottie Animations**: Replace some static icons with micro-animations for success/delivery states.
- **Admin Mobile App**: Since the UI is already responsive, consider a dedicated "Courier View" in the admin panel to simplify deliveries.
