# ⚙️ Safe Share - Backend API

> **The secure, encrypted Node.js/Express engine powering the Safe Share platform.**

![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Framework-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Security](https://img.shields.io/badge/Encryption-AES--256--GCM-red)

This repository contains the backend REST API for **Safe Share**. It handles user authentication, data encryption, secure sharing link generation, and automated data expiration via MongoDB TTL indexes.

---

## 🛡️ Core Security Architecture

- **Server-Side Encryption**: Note content is encrypted using **AES-256-GCM** (Authenticated Encryption with Associated Data) before being stored in the database. Plaintext notes are never stored.
- **Stateless Authentication**: Protected API endpoints use **JSON Web Tokens (JWT)** for secure user sessions.
- **Cryptographic Hashing**: User passwords and note passkeys are securely hashed with **bcrypt** (cost factor 10).
- **Hardened Expiration**: Guest notes expire strictly after 2 minutes. Expired notes are aggressively rejected by the API layer, supplementing MongoDB's background TTL cleanup process to ensure zero leakage.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: `jsonwebtoken`
- **Cryptography**: Native Node `crypto` (AES-256-GCM), `bcrypt`

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── controllers/      # Route logic handlers
│   ├── middlewares/      # Express middlewares (e.g., JWT Auth)
│   ├── Models/           # Mongoose schemas (User, Note)
│   ├── routes/           # API route definitions
│   ├── types/            # TypeScript interface definitions
│   ├── utils/            # Crypto and helper utilities
│   └── index.ts          # Server entry point
├── .env                  # Environment variables (Ignored in Git)
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript compiler configuration
```

---

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v16+)
- A running MongoDB instance (Local or MongoDB Atlas)

### 1. Install Dependencies
Navigate to the `backend` directory and install the necessary packages:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `backend` folder to configure your secrets and database connection:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/safe-share
JWT_SECRET=your_super_secret_jwt_key
NOTE_ENCRYPTION_KEY=your_32_byte_hex_string_encryption_key
```
*(**Note:** The `NOTE_ENCRYPTION_KEY` must be a valid 32-byte hex string for AES-256 encryption to function properly).*

### 3. Start Development Server
Start the server using `nodemon` or your configured dev script:
```bash
npm run dev
```

The API will now be running and listening for requests at `http://localhost:5000`.

---

## 📡 Key API Endpoints

- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate a user and receive a JWT.
- `GET /api/notes/active` - Fetch all non-expired links belonging to the authenticated user.
- `POST /api/notes/create` - Create a new encrypted note with configurable expiration.
- `POST /api/notes/guest` - Create a guest note (auto-expires in 2 minutes).
- `GET /api/notes/:id/status` - Pre-flight check to see if a link is valid or expired.
- `POST /api/notes/:id/verify` - Submit a passkey to decrypt and view a note.
