# Multi-Vendor Marketplace Client

This folder contains the React + Vite frontend for the marketplace. It is
intentionally limited to project structure and starter files for now.

## Folder guide

- `src/assets/` - Static images, icons, and other imported assets.
- `src/components/` - Reusable UI, shared components, and page layout pieces.
- `src/pages/` - Route-level screens grouped by user role.
- `src/routes/` - Frontend route definitions.
- `src/context/` - React context providers for shared state.
- `src/hooks/` - Reusable React hooks.
- `src/services/` - Frontend service modules for future integrations.
- `src/utils/` - Small, reusable utility functions.
- `src/constants/` - Shared application constants.
- `public/` - Static files served without processing by Vite.

## Run locally

```bash
npm install
npm run dev
```

## Demo administration

For frontend-only testing, log in with the seeded development admin account:

- Email: `admin@markethub.demo`
- Password: `MarketHubAdmin123!`

This account is created in localStorage after its first successful login. It is
not production authentication. Real authorization and vendor approval rules
must be enforced by the backend.
