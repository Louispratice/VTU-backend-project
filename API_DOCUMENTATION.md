# VTU Backend Project - API Documentation

This documentation provides details for all available API endpoints in the VTU Backend Project.

**Base URL:** `http://localhost:5000/api` (or your production URL)

---

## 🔐 Authentication (`/api/auth`)

### 1. User Signup
**Endpoint:** `POST /signup`  
**Description:** Register a new user account.

**Request Body:**
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "strongpassword123"
}
```

**Response (Success - 201):**
```json
{
    "message": "Signup successful. Verify your email.",
    "verificationToken": "..."
}
```

---

### 2. User Login
**Endpoint:** `POST /login`  
**Description:** Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "strongpassword123"
}
```

**Response (Success - 200):**
```json
{
    "message": "Login successful",
    "token": "JWT_TOKEN_HERE",
    "user": {
        "id": "...",
        "username": "johndoe",
        "email": "john@example.com",
        "walletBalance": 0
    }
}
```

---

### 3. Verify Email
**Endpoint:** `POST /verify-email`  
**Description:** Verify user's email using the token received in signup.

**Request Body:**
```json
{
    "token": "VERIFICATION_TOKEN"
}
```

---

### 4. Update Profile
**Endpoint:** `PUT /update`  
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
    "username": "newusername",
    "email": "newemail@example.com"
}
```

---

### 5. Change Password
**Endpoint:** `POST /change-password`  
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
    "oldPassword": "...",
    "newPassword": "..."
}
```

---

## 📱 Data Services (`/api/data`)

### 1. Get Data Plans
**Endpoint:** `GET /plans`  
**Authentication:** Required (Bearer Token)

**Response (Success - 200):**
```json
{
    "plans": [
        {
            "id": "1",
            "network": "MTN",
            "size": "500MB",
            "amount": 150,
            "duration": "30 days"
        },
        ...
    ]
}
```

---

### 2. Purchase Data
**Endpoint:** `POST /purchase`  
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
    "network_id": "1",
    "mobile_number": "08123456789",
    "plan_id": "1",
    "Ported_number": false
}
```

---

## 📞 Airtime Services (`/api/airtime`)

### 1. Purchase Airtime
**Endpoint:** `POST /`  
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
    "network_id": "MTN",
    "phone": "08123456789",
    "amount": 100
}
```

---

## 💡 Electricity Services (`/api/electricity`)

### 1. Buy Electricity
**Endpoint:** `POST /buy`  
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
    "disco_name": "IKEDC",
    "amount": 1000,
    "meter_number": "1234567890",
    "MeterType": "Prepaid",
    "mobile_number": "08123456789"
}
```

---

## 💳 Wallet (`/api/wallet`)

### 1. Get Balance
**Endpoint:** `GET /balance`  
**Authentication:** Required (Bearer Token)

---

### 2. Fund Wallet
**Endpoint:** `POST /fund`  
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
    "amount": 5000,
    "description": "Optional funding note"
}
```

---

## 📜 Transactions (`/api/transactions`)

### 1. Get History
**Endpoint:** `GET /history`  
**Authentication:** Required (Bearer Token)
**Query Parameters:** `type` (optional), `status` (optional)

---

### 2. Get Transaction by Reference
**Endpoint:** `GET /:reference`  
**Authentication:** Required (Bearer Token)
