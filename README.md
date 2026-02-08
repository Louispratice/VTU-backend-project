# 📱 VTU Backend Project

This system handles user authentication, wallet management, and service purchases (Airtime & Data) using the DataStation API.

---

## ✨ Features
- **User Authentication**: Secure Signup, Login, and JWT-based protection.
- **Wallet System**: Fund wallets, check balances, and internal deductions.
- **Service Integration**: 
  - **Data Subscriptions**: Purchase data plans for MTN, GLO, Airtel, and 9Mobile.
  - **Airtime Top-up**: Instant airtime recharge.
- **Transaction History**: Detailed logging of all financial activities.
- **Global Error Handling**: Centralized error management for stability.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: jsonwebtoken (JWT), bcryptjs, helmet
- **External API**: DataStation

---

## 🚀 Local Setup Guide

### 1. Clone & Install
```bash
git clone https://github.com/your-username/VTU-backend-project.git
cd VTU-backend-project
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
DATASTATION_TOKEN=your_datastation_api_token
```

> [!IMPORTANT]
> **Security Warning**:
> 1.  **Never commit your `.env` file** to GitHub! It contains sensitive keys. Ensure `.env` is listed in your `.gitignore` file.
> 2.  **Avoid Hardcoding Keys**: Always access API keys via `process.env.KEY_NAME` in your code. Do not paste actual keys directly into your source files.

### 3. Run the App

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```
The server will start at `http://localhost:5000`.

---


## 🚂 Deployment Guide (Railway)

This guide shows you how to put your VTU Backend online using **Railway**.

### Step 1: Prepare Your Code
- Ensure your `package.json` has a `"start": "node server.js"` script.
- Push your latest code to GitHub.

### Step 2: Create Project on Railway
1.  Go to [railway.app](https://railway.app/).
2.  Click **+ New Project** > **Deploy from GitHub repo**.
3.  Select your repository (`VTU-backend-project`) and click **Deploy Now**.

### Step 3: Add Environment Variables
Your app will crash initially because it needs secrets.
1.  Click on your project card > **Variables** tab.
2.  Add the same variables from your local `.env` file (`MONGO_URI`, `JWT_SECRET`, etc.).
3.  The app will automatically restart and go live!

### Step 4: Public URL
1.  Go to **Settings** > **Networking**.
2.  Click **Generate Domain** to get your public API URL (e.g., `https://vtu-app.up.railway.app`).

---


