# 🛒 E-Commerce API

A secure **Node 18 + Express 5** back‑end that powers a full‑stack e‑commerce platform.  
Tech stack: **MongoDB / Mongoose**, **JWT** (access + refresh), **Redis**, **Cloudinary**, plus hardening middle‑wares (Helmet, rate‑limiting, XSS/NoSQL sanitizers).

---

## ✨ Key Features

| Domain | Highlights |
| ------ | ---------- |
| **Authentication** | Email + password sign‑up / login, refresh‑token rotation, logout, “forgot password” flow |
| **Authorization**  | Role‑based access control (`user`, `admin`) with reusable `authenticate` + `restrictTo` middle‑wares |
| **Products**       | CRUD, Cloudinary image upload, slug generation, featured flag, tags, stock management |
| **Reviews**        | One‑to‑many product reviews (rating 1–5) with average‑rating aggregation |
| **Uploads**        | Single‑image endpoint (`multer` → Cloudinary) |
| **Security**       | `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `express-xss-sanitizer`, signed HTTP‑only cookies |
| **Performance**    | Built‑in Redis client for caching, token black‑listing, or job queues |
| **Codebase**       | Layered structure — **routes ➜ controllers ➜ services ➜ models** — with centralized error handling |

---

## 🌐 REST API (v1)

_All paths are prefixed with **`/api/v1`**._

### Auth `/auth`

| Method | Path | Access | Description |
| ------ | ---- | ------ | ----------- |
| POST   | `/register`        | Public        | Create account |
| POST   | `/login`           | Public        | Email + password (rate‑limited) |
| POST   | `/refresh`         | Public        | Issue a new access token |
| POST   | `/logout`          | Public        | Invalidate current refresh token |
| POST   | `/forgot-password` | Public        | Send reset e‑mail |
| POST   | `/reset-password`  | Public        | Reset forgotten password |
| POST   | `/update-password` | Authenticated | Change password while logged‑in |

### Users `/users`

| Method | Path   | Access | Description        |
| ------ | ------ | ------ | ------------------ |
| GET    | `/me`  | Auth   | Get own profile    |
| PATCH  | `/me`  | Auth   | Update own profile |
| GET    | `/`    | Admin  | List users         |
| POST   | `/`    | Admin  | Create user        |
| GET    | `/:id` | Admin  | Get single user    |
| PATCH  | `/:id` | Admin  | Update user        |
| DELETE | `/:id` | Admin  | Delete user        |

### Products `/products`

| Method | Path     | Access | Description               |
| ------ | -------- | ------ | ------------------------- |
| GET    | `/`      | Public | Filterable list of products |
| POST   | `/`      | Admin  | Create product            |
| GET    | `/:id`   | Public | Single product            |
| PATCH  | `/:id`   | Admin  | Update product            |
| DELETE | `/:id`   | Admin  | Delete product            |
| —      | `/:productId/reviews` | – | Delegates to **reviewRouter** |

### Reviews `/reviews` or `/products/:productId/reviews`

| Method | Path   | Access | Description                          |
| ------ | ------ | ------ | ------------------------------------ |
| GET    | `/`    | Auth   | List reviews (optionally by product) |
| POST   | `/`    | Auth   | Create review                        |
| GET    | `/:id` | Owner,Admin  | Get single review                    |
| PATCH  | `/:id` | Owner,Admin  | Update review                        |
| DELETE | `/:id` | Owner,Admin  | Delete review                        |

### Upload `/upload`

| Method | Path | Access | Description                                            |
| ------ | ---- | ------ | ------------------------------------------------------ |
| POST   | `/`  | Admin  | Upload a single image (`multipart/form-data` `image`) |

---

## 📂 Project Structure

```text
config/            # constants & third‑party configs
controllers/       # request handlers
services/          # DB / email / cloudinary helpers
routes/            # Express routers (auth, users, products…)
models/            # Mongoose schemas
middlewares/       # auth, RBAC, uploads, error handler…
utils/redisClient  # ready‑made Redis connection
templates/         # Handlebars email templates
public/            # static assets
app.js             # Express app entry point
```

---

## ⚙️ Environment Variables

Create a **`.env`** file in the project root and fill in the values:

```dotenv
# General
NODE_ENV=production
PORT=5000

# Database & Caching
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/db?retryWrites=true&w=majority
REDIS_URL=redis://:<password>@localhost:6379

# Authentication
JWT_SECRET=<random-hex>
SALT_ROUNDS=12
ACCESS_TOKEN_LIFETIME=5m
RT_COOKIE_LIFETIME=30d
SIGNED_COOKIE_SECRET=<random-hex>
MAX_SESSIONS=2

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER_NAME=

# Temporary URLs
TEMP_IMAGE_TOKEN_LIFETIME=

# SMTP (Email)
SMPT_HOST=
SMTP_USER=
SMTP_PASSWORD=
SMTP_NAME=
SMTP_EMAIL=

# CORS
FRONTEND_HOST=http://localhost:5173
```

---

## 🛠️ Getting Started

```bash
# 1 – clone & install
git clone https://github.com/Youssef-Elnemaky/E-Commerce.git
cd E-Commerce
npm install

# 2 – configure environment
# (paste the .env block above into a file named .env)

# 3 – ensure MongoDB, Redis & Cloudinary are reachable
# 4 – run the server
npm start
```

Open **`http://localhost:5000/api/v1`** — you should see:

```json
{ "status": "success", "msg": "Hello World" }
```

---

## 🛡️ Security & Best Practices

* **Helmet** — secure HTTP headers  
* **Rate‑limiting** — 300 req / 15 min globally; stricter for `/login`  
* **Sanitizers** — blocks NoSQL injection & XSS (`express-mongo-sanitize`, `express-xss-sanitizer`)  
* **Signed, HTTP‑only cookies** — store refresh tokens safely  
* **Central error handler** — uniform JSON responses  

---

## 📈 To Do Roadmap

* Cart & order 
* Stripe payment
* Swagger / OpenAPI documentation  
* Docker and hosting on a VPS
---
