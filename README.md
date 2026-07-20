# ShopHub — E-Commerce Platform

A full-stack e-commerce web application built with React (Vite) and Node.js, optimized for Hostinger Business Plan deployment.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios
- **Backend:** Node.js, Express, Sequelize ORM
- **Database:** MySQL
- **Auth:** JWT (httpOnly cookies + Bearer tokens), bcrypt
- **Payments:** Razorpay, Paytm (modular gateway system)
- **Email:** Nodemailer (Gmail / Hostinger / any SMTP)
- **Storage:** Local file uploads (multer)

## Features

- Product catalog with categories, search, filters, and sorting
- Product image upload with drag-and-drop (admin)
- Shopping cart with localStorage persistence
- Guest checkout + registered user checkout
- Multiple payment gateways (Razorpay, Paytm, COD, Bank Transfer)
- Order management with status tracking
- Automated order confirmation & status update emails
- Admin panel (products CRUD, order management)
- Responsive design with editorial luxury aesthetic
- Rate limiting, CSRF protection, password strength validation

## Home Showcase Video (Cloudinary)

The "Crafted To Perfection" video on the home page (right of the "Built For
Excellence" cards) is set from **Admin → Settings → Theme → Showcase Video** —
no code change and no API keys required. Paste a hosted video URL plus an
optional title/subtitle; it plays muted and loops, and falls back to a built-in
default clip until one is saved.

Use the **direct delivery URL** (must end in `.mp4`), not the player-embed link:

```
https://res.cloudinary.com/<cloud_name>/video/upload/<public_id>.mp4
```

If you have the Cloudinary player-embed URL, e.g.
`https://player.cloudinary.com/embed/?cloud_name=cvrv3c6j&public_id=<public_id>`,
convert it to the delivery form above (take `cloud_name` and `public_id`, drop
the rest, append `.mp4`). The current store uses cloud name `cvrv3c6j`.

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL

### Setup

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MySQL credentials and API keys

# Seed database
cd server && npm run seed

# Run development servers
npm run dev:server   # Backend on :3000
npm run dev:client   # Frontend on :5173
```

### Default Accounts

- **Admin:** admin@store.com / admin123
- **Customer:** john@example.com / password123

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET`, `JWT_EXPIRE` | JWT authentication |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay payment gateway |
| `PAYTM_MERCHANT_ID`, `PAYTM_MERCHANT_KEY`, `PAYTM_ENV` | Paytm payment gateway |
| `SMTP_EMAIL`, `SMTP_APP_PASSWORD` | Email (Gmail) |
| `SMTP_HOST`, `SMTP_PORT` | Custom SMTP (Hostinger, Zoho, etc.) |


## License

MIT — see [LICENSE](LICENSE)
