# 🔒 NoteCrypt (Safe-Share)

![React](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=black)
![Node](https://img.shields.io/badge/backend-Node.js-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white)

NoteCrypt (Safe-Share) is a simple, secure, and visually appealing web application that allows users to create, share, and protect encrypted notes using passwords. Share sensitive information with confidence knowing it is protected.

## ✨ Features

- **Password Protection**: Every shared note is secured with a unique password.
- **User Authentication**: Secure login and signup system using JWT (JSON Web Tokens).
- **Responsive Design**: Accessible and beautiful on both desktop and mobile devices.
- **Fast & Modern**: Built with React (Vite) for a lightning-fast frontend experience.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Bootstrapped with Vite)
- **TypeScript**
- **React Router** for navigation
- **Axios** for API requests

### Backend
- **Node.js** & **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose** (Database)
- **bcrypt** for password hashing
- **jsonwebtoken (JWT)** for secure authentication

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- A [MongoDB](https://www.mongodb.com/) database (Local or MongoDB Atlas)

### Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd safe-share
   ```

2. **Setup Backend:**
   Open a new terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   Open another terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open the app!**
   Navigate to the URL provided by Vite (usually `http://localhost:5173`) in your browser.

## 📁 Project Structure

```text
safe-share/
├── backend/            # Express server, MongoDB models, APIs
│   ├── src/            # Backend source code
│   ├── .env            # Backend environment variables
│   └── package.json    # Backend dependencies
└── frontend/           # React frontend application
    ├── src/            # Frontend source code, components, pages
    ├── .env            # Frontend environment variables
    └── package.json    # Frontend dependencies
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is open-source and available under the MIT License.
