# 🚀 Data & Airtime Implementation Guide

This guide provides a deep dive into how I built the **Data Subscription** feature, with actual code examples you can use it for **Airtime Top-up**.

---

## 🏛️ Architecture Overview
I use a **Model-Route-Controller** pattern:
- **Model**: Defines how data looks in the database.
- **Route**: Defines the URL (e.g., `/api/data/purchase`).
- **Controller**: Contains the actual logic (the "Brain").
- **Middleware**: Checks security (Access tokens).

---

## 🛠️ Step-by-Step Implementation

### Step 1: Mapping the Data
Create a JSON file to store the API's specific IDs. 
**File**: `data/networks.json`
```json
[
  { "id": 1, "name": "MTN" },
  { "id": 2, "name": "GLO" }
]
```

### Step 2: Setting up the Route
Define your URL and protect it with `authMiddleware`.
**File**: `routes/data.route.js`
```javascript
import express from "express";
import * as dataController from "../controllers/data.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Get the list of plans
router.get("/plans", authMiddleware, dataController.getPlans);

// 2. Buy a plan
router.post("/purchase", authMiddleware, dataController.purchaseData);
```

### Step 3: Building the Controller (The Logic)
This is where you talk to the external API and move money.
**File**: `controllers/data.controller.js`
```javascript
export const purchaseData = async (req, res) => {
  const { network_id, mobile_number, plan_id } = req.body;

  // 1. Find the plan and its price from our JSON mapping
  const plan = allPlans.find(p => p.id === plan_id);
  const cost = plan.amount;

  // 2. Check the user's wallet
  const user = await User.findById(req.userId);
  if (user.walletBalance < cost) {
    return res.status(400).json({ message: "Insufficient Balance" });
  }

  // 3. Call the external API (e.g., DataStation)
  const apiResponse = await axios.post("https://api.com/buy", {
    network: network_id,
    mobile: mobile_number,
    plan: plan_id
  }, {
    headers: { "Authorization": "Token YOUR_TOKEN" }
  });

  // 4. If API success -> Subtract money and record transaction
  user.walletBalance -= cost;
  await user.save();

  await Transaction.create({
    user: req.userId,
    type: "data",
    amount: cost,
    status: "success",
    description: `Bought ${plan.size} for ${mobile_number}`
  });

  res.json({ message: "Success!" });
};
```

---

## 💡 Adapting for Airtime Top-up
To build Airtime, follow the same pattern for **Data**, but simpler!

### Step 3 (Airtime): Building the Controller
Instead of finding a plan ID, you just take the `amount` and `network_id`.

**External API Call (DataStation Top-up):**
```bash
curl --location 'https://datastationapi.com/api/topup/' \
--header 'Authorization: Token YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "network": network_id,
    "amount": amount,
    "mobile_number": phone,
    "Ported_number": true,
    "airtime_type": "VTU"
}'
```

### Implementation Logic
1.  **Input Check**:
    ```javascript
    const { network_id, mobile_number, amount } = req.body;
    if (amount < 50) return res.status(400).json({ message: "Minimum ₦50" });
    ```
2.  **API URL**: Use `https://datastationapi.com/api/topup/`.
3.  **Data Payload**: Ensure you include `"airtime_type": "VTU"` as required by DataStation.
4.  **Transaction Record**: Change `type` to `"airtime"` when saving the receipt.

### Template for Airtime API call:
```javascript
const apiResponse = await axios.post("https://datastationapi.com/api/topup/", {
    network: network_id,
    amount: amount,
    mobile_number: phone,
    Ported_number: true,
    airtime_type: "VTU"
}, {
    headers: { "Authorization": `Token ${process.env.DATASTATION_TOKEN}` }
});
```
