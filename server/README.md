# MarketHub Backend

This is the Node.js + Express backend foundation for MarketHub. It is kept
separate from the React frontend. Product and order data are persisted as JSON
files under `server/data/`; this is file persistence for the CE-1 demo, not a
database.

## Install dependencies

```bash
cd server
npm install
```

## Configure environment

Create a local `.env` file in this folder before starting the server. Do not commit real secrets:

```bash
copy .env.example .env
```

Then set a strong secret value:

```env
AUTH_TOKEN_SECRET=replace-with-a-long-random-secret-at-least-32-characters
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
PORT=5000
```

On Windows PowerShell, you can also create the file manually with:

```powershell
@'
AUTH_TOKEN_SECRET=replace-with-a-long-random-secret-at-least-32-characters
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
PORT=5000
'@ | Set-Content -Path .env
```

## Run the server

Development mode with automatic restarts:

```bash
npm run dev
```

Standard Node.js mode:

```bash
npm start
```

The server runs on port `5000` by default.

## Test the health endpoint

Open this URL in a browser:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "MarketHub backend is running"
}
```

The API is configured to accept requests from the local Vite development
servers at `http://localhost:5173` and `http://localhost:5174`. You can
override this with a comma-separated `CLIENT_ORIGIN` environment variable.

## Product APIs

All product responses use the shape `{ success, data }`. Collection responses
also include a dynamic `count`.

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

List products with optional combined query parameters:

```text
/api/products?search=headphones&category=Electronics&sort=price-asc
```

Supported sort values are `price-asc`, `price-desc`, and `name`.

Create or update requests require `name`, `description`, `category`, `price`,
`stock`, `image`, `vendorId`, and `vendor`. Price must be greater than zero,
stock must be a non-negative integer, and image must be an HTTP(S) URL.

Example create request:

```json
{
  "name": "Demo Desk Lamp",
  "description": "A warm reading lamp for a calm workspace.",
  "category": "Home & Living",
  "price": 2499,
  "stock": 12,
  "image": "https://example.com/demo-desk-lamp.jpg",
  "vendorId": "demo-vendor-123",
  "vendor": "Demo Store"
}
```

## Order APIs

Orders are persisted in `server/data/orders.json`. Order ownership is derived
from the authenticated backend user; client-supplied customer and vendor IDs
are not trusted.

```text
POST  /api/orders
GET   /api/orders/customer/:customerId
GET   /api/orders/vendor/:vendorId
GET   /api/orders/:orderId
PATCH /api/orders/:orderId/status
```

The create endpoint accepts a customer ID, delivery details, and product IDs
with quantities. The server reads current product prices and vendor ownership,
creates an order snapshot, and calculates totals.

```json
{
  "customerId": "demo-customer-123",
  "deliveryDetails": {
    "fullName": "Aarav Sharma",
    "phone": "9876543210",
    "email": "aarav@example.com",
    "address": "12 Market Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400001"
  },
  "items": [
    { "productId": "arc-wireless-headphones", "quantity": 1 }
  ]
}
```

Vendor order responses contain only items for the requested vendor and include
`vendorSubtotal`. Supported status values are `Placed`, `Processing`,
`Shipped`, `Delivered`, and `Cancelled`.

Admin order summary:

```text
GET /api/orders/admin/summary
```

This endpoint requires an authenticated Admin bearer token. It counts each
persisted order once and sums its `total` field. Cancelled orders remain
included because these are historical marketplace order metrics; payable
earnings and payout summaries continue to exclude cancelled orders.

## Authentication and authorization

Users are persisted in `server/data/users.json`. Passwords are stored as salted
Node `scrypt` hashes and are never returned by the API. Signup accepts only
Customer and Vendor accounts; new vendors start with `Pending` status.

```text
POST  /api/auth/signup
POST  /api/auth/login
GET   /api/auth/me
GET   /api/auth/users
PATCH /api/auth/users/:id/status
```

Login returns an expiring HMAC-signed bearer token. Send it on protected
requests as `Authorization: Bearer <token>`. Product writes require a
Verified vendor, customer orders require the authenticated customer, and
vendor/admin data is scoped by the authenticated user. Admin user and payout
operations are server-protected.

The existing demo admin account is initialized only when it is missing:
`admin@markethub.demo` / `MarketHubAdmin123!`. Ordinary signup cannot register
the admin role. Set a strong `AUTH_TOKEN_SECRET` outside local development;
the built-in fallback secret is only suitable for this demo.

## Demo payment and payout APIs

Orders start with a pending, non-real payment:

```json
{
  "status": "Pending",
  "method": "Demo Payment",
  "transactionId": null,
  "paidAt": null
}
```

Simulate one successful payment:

```text
POST /api/orders/:orderId/payment
```

This generates one demo transaction ID and timestamp. Repeating the request
returns the existing payment without creating another transaction. No card
numbers, bank details, or real credentials are accepted or stored.

Payout endpoints:

```text
GET   /api/payouts/vendor/:vendorId
GET   /api/payouts
PATCH /api/payouts/:orderId/:vendorId/status
```

Only paid, non-cancelled orders contribute to payable payout summaries. The
demo commission rate is 10%. Payouts begin as `Pending` and can be marked
`Paid`; a paid payout cannot be moved back to pending. Cancelled or unpaid
orders cannot be marked payable.

Payment metadata and payout records are embedded in each persisted order, so
separate `payments.json` and `payouts.json` files are intentionally not used.
Payment and payout state therefore survives backend restarts with
`server/data/orders.json`.

The frontend stores only the current public user session and bearer token for
UI continuity. These local values are not authorization: every protected
operation is authenticated and authorized by the backend.

The storage utility writes through a temporary file and renames it, and creates
timestamped backups under `server/data/backups/` before modifying an existing
JSON file. Do not edit or remove those files while the server is running.
This remains a single-process demo with JSON-file persistence and is not a
production-grade deployment. In-memory request state and expired tokens reset
or become invalid when appropriate; JSON-backed users, products, orders,
payments, and payouts survive backend restarts.
