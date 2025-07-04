# 🦖 Chope

Welcome to **Chope** — a fun and interactive virtual task management system for families! 👨‍👩‍👧‍👦✨

## 🌟 Project Overview

Chope is a gamified platform designed to help parents and children manage daily tasks, chores, and responsibilities together. Children complete tasks, earn rewards, and care for their own digital pet! Parents can assign, track, and approve tasks, making household management engaging and educational.

## 🚀 Features

- 👨‍👩‍👧‍👦 Parent & Child accounts with secure authentication
- ✅ Task assignment, completion, and approval workflow
- 🏆 Reward system for completed tasks
- 🐾 Virtual pet that grows and evolves as tasks are completed
- 📊 Progress tracking and statistics
- 🎨 Modern, responsive UI (React + Vite + TailwindCSS)
- 🔒 JWT-based authentication & MongoDB data storage

## 🛠️ Quick Start

### 1. Run the Server (Backend) 🖥️

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend` folder with the following content:
   ```env
   MONGO_URI=mongodb://localhost:27017/chope
   JWT_SECRET=your_jwt_secret_here
   PORT=5001
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run at: [http://localhost:5001](http://localhost:5001)

### 2. Run the Client (Frontend) 🌐

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development environment:
   ```bash
   npm run dev
   ```
   The app will be available at the address shown in the terminal (default: [http://localhost:5173](http://localhost:5173))

> **Note:** No `.env` file is required for the frontend by default.

## 📁 Project Structure

```
Chope/
  ├── backend/   # Node.js server (Express, MongoDB)
  └── frontend/  # React app (Vite, TypeScript)
```

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (recommended version 18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or in the cloud

Enjoy using **Chope**! 🦕✨
