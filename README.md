# 🛒 Order Allocation System

## 📌 Overview

This project is a mini **Order Allocation System** built as part of a technical assignment.

It demonstrates:

* Relational database design
* Transaction handling
* Concurrency control
* Backend API structuring
* Frontend API integration
* logging integrate

The system allows:

* create products with limited stock
* place orders
* Safe stock allocation without overselling
* Order cancellation with stock restoration

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MySQL
* Raw SQL (used for core logic)
* JWT Authentication
* bcrypt (password hashing)

### Frontend

* Next.js (App Router)
* Fetch API

---

## 📁 Project Structure

```
Assignment-backend/
│── config/        # DB config & environment setup
│── controllers/   # Request handlers
│── db/            # Database connection
│── middleware/    # Auth middleware
│── routes/        # API routes
│── services/      # Business logic (transactions)
│── app.js         # Entry point
│── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <repo-url>
cd Assignment-backend
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Environment Variables

Create `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123
DB_NAME=order_system
JWT_SECRET=secret
```

---

## 🗄️ Database Schema

### Create Database

```sql
CREATE DATABASE order_system;
USE order_system;
```

---

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Products Table

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Orders Table

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10,2),
  status ENUM('PENDING','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

### Order Items Table

```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 📊 Indexing Strategy

```sql
CREATE INDEX idx_products_id ON products(id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Why?

* Faster product lookup
* Faster joins between orders & items
* Efficient pagination queries

---

## 🚀 Running the Server

```bash
node app.js
```

Server runs on:

```
http://localhost:5000
```

---

## 🔐 Authentication

### Signup

```
POST /auth/signup
```

Body:

```json
{
  "name": "Shani",
  "email": "shani@example.com",
  "password": "123456"
}
```

---

### Login

```
POST /auth/login
```

Returns:

```json
{
  "token": "JWT_TOKEN"
}
```

---

## 📦 API Endpoints

### 1. Create Product

```
POST /products
```

---

### 2. Create Order (Protected)

```
POST /orders
```

Headers:

```
Authorization: <JWT_TOKEN>
```

Body:

```json
{
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

---

### 3. Cancel Order (Protected)

```
PATCH /orders/:id/cancel
```

---

### 4. Get Orders (Pagination)

```
GET /orders?page=1&limit=10
```

---

## 🔥 Concurrency Handling (VERY IMPORTANT)

To prevent **overselling**, the system uses:

### 1. Database Transactions

* Ensures atomic operations
* Either full order succeeds OR fails

### 2. Row-Level Locking

```sql
SELECT * FROM products WHERE id = ? FOR UPDATE;
```

### How it works:

* Locks the product row
* Prevents other transactions from modifying it
* Ensures correct stock deduction

---

## ⚡ Order Flow (Atomic)

1. Start transaction
2. Lock product row (`FOR UPDATE`)
3. Check stock
4. Deduct stock
5. Create order
6. Insert order items
7. Commit transaction

👉 If any step fails → rollback

---

## ❌ Error Handling

* Insufficient stock → rollback transaction
* Invalid user → error response
* Double cancellation → prevented

---

## 🔄 Cancel Order Logic

* Lock order row
* Check status
* Restore product stock
* Update order status to CANCELLED

---

## 🚫 Edge Case Handling

### Scenario:

Two users try to buy last 5 items simultaneously

### Solution:

* Row-level locking
* Transaction isolation
* Prevents overselling

---

## 🧠 Assumptions

* Each order belongs to one user
* Stock cannot go negative
* Orders are atomic (no partial success)
* Basic authentication only (no refresh tokens)

---

## 🚀 Future Improvements

* Rate limiting (5 orders/min per user)
* Soft delete for products
* Logging system
* Advanced indexing
* Admin dashboard

---

## 👨‍💻 Author

**Shani Kotadiya**
