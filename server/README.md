# Zoberry Admin Server

> **LOCAL ONLY** — This server never gets deployed publicly.
> It connects directly to the shared MongoDB Atlas cluster.

## Stack
- Node.js + Express (plain JavaScript)
- MongoDB via Mongoose
- JWT for admin auth
- Runs on port 5000

## Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── models/
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── controllers/
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   └── user.controller.js
│   ├── routes/
│   │   ├── index.js            ← Mounts all route groups
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   └── user.routes.js
│   ├── middleware/
│   │   ├── auth.js             ← JWT verify
│   │   ├── validate.js         ← express-validator helper
│   │   └── errorHandler.js     ← Central error handler
│   ├── app.js                  ← Express app setup
│   └── server.js               ← Entry point (starts HTTP server)
├── .env                        ← Local secrets (git-ignored)
├── .env.example                ← Template for env vars
├── .gitignore
└── package.json
```

## Setup

```bash
cd server
npm install
cp .env.example .env        # fill in your values
npm run dev
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/login | Admin login |
| GET | /api/products | List all products |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| GET | /api/orders | List all orders |
| GET | /api/orders/:id | Get single order |
| PUT | /api/orders/:id/status | Update order status |
| GET | /api/users | List all users |
| DELETE | /api/users/:id | Delete user |
