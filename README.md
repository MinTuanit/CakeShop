# 🎂 Cake Shop Website

## 🚀 Overview

This is a full-stack e-commerce website for ordering birthday cakes online. The system allows users to browse cakes, place orders, and pay online, while admins can manage products, orders, and users.

---

## 🧩 Tech Stack

### Frontend

* Next.js
* React
* Axios

### Backend

* NestJS
* Node.js

### Database

* MongoDB (Mongoose)

### Other

* JWT Authentication
* Payment Integration (VNPay / Stripe)
* ESLint + Prettier

---

## 🎯 Features

### 👤 User

* Register / Login
* Browse cakes
* Search & filter products
* View product details
* Add to cart
* Checkout & payment
* View order history

### 🛠️ Admin

* Manage products (CRUD)
* Manage orders
* Manage users
* Dashboard (revenue, statistics)

---

## 🏗️ Project Structure

### Backend (NestJS)

```
src/
 ├── modules/
 │    ├── auth/
 │    ├── users/
 │    ├── products/
 │    ├── orders/
 │    ├── payments/
 │    └── categories/
 ├── common/
 ├── config/
 └── main.ts
```

### Frontend (NextJS)

```
src/
 ├── app/
 │    ├── (auth)/
 │    ├── products/
 │    ├── cart/
 │    ├── checkout/
 │    ├── admin/
 ├── components/
 ├── services/
 └── hooks/
```

---

## 💳 Payment Flow

1. User places an order
2. Backend creates order (pending)
3. Redirect to payment gateway
4. Callback updates order status

---

## ⚙️ Installation

### 1. Clone project

```
git clone <repo-url>
cd project
```

### 2. Backend setup

```
cd backend
npm install
npm run start:dev
```

### 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create `.env` file in backend:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/cake-shop
JWT_SECRET=your_secret_key
```

---

## 🧪 Testing

* Unit Test: Jest
* E2E Test: Supertest

---

## 💡 Future Improvements

* AI cake recommendation
* Real-time order tracking
* Chatbot support
* Custom cake design upload

---

## 📌 Conclusion

This project demonstrates a scalable full-stack architecture using modern technologies. It is suitable for real-world deployment and can be extended with advanced features.
