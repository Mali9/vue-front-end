## Vue Dashboard

SPA for managing products, carts, and orders against the Laravel API.

### Requirements

- Node 20.19+ or 22.12+ (Vite warns on Node 22.0.0)
- npm 10+

### Setup

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE_URL=http://127.0.0.1:8000/api
npm run dev
```

Build/Test:

```bash
npm run build   # type-check + production build
npm run preview
```

### Pages

- **Auth**: Login & Register (stores JWT in `localStorage` and fetches `/auth/me`).
- **Dashboard**: Displays total products & orders.
- **Products**: CRUD + “Add to Cart” shortcut per product.
- **Orders**: Shows current cart items, ability to clear cart, order placement form (address + phone), and order history with itemized modal.

Axios interceptor injects the JWT header and forces a logout/redirect on HTTP 401 responses. Pinia is used for auth state, and route guards ensure authenticated access.***

