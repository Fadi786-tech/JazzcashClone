# 🏦 Jazzcash Clone

A TypeScript + React Js + Express + MongoDB backend that replicates the core functionalities of the Jazzcash mobile wallet system, including authentication, money transfer, bill payments, mobile loads, and auto-payments — all with secure JWT authentication, file upload, and cron-based scheduling.

---
# 🚀 Features
**🔐 Authentication & User Management**

- Register with CNIC/Picture upload using Multer

- Login with JWT-based authentication

- Update profile (with optional picture)

- Secure password hashing using bcryptjs

**💸 Money Transfer Module**

- Jazzcash Wallet to Wallet transfer

- Bank transfer

- CNIC-based transfer

- Other wallet transfer

- Each transaction recorded with sender, receiver, type, amount, and status

**🧾 Bill Payment Module**

Pay bills for:

- Electricity

- Gas

- Water

- Internet

- Telephone

- Status tracking for paid and pending bills

**📱 Load & Packages Module**

- Prepaid and postpaid mobile loads

- Mobile package payments (Jazz, Zong, Ufone, Telenor)

**🔁 Auto Payment System**

- Automated recurring payments using node-cron

- Custom scheduling: daily, weekly, or monthly

- Simple simulation for testing auto-debit flow

**💰 Account Management**

- View balance

- Fetch all registered accounts

---

# 🗂️ Tech Stack
- Technology	Purpose
- TypeScript	Type-safe backend logic
- Express.js	REST API framework
- React.js Frontend
- MongoDB Atlas	Cloud database
- Mongoose	ODM for MongoDB
- JWT	Authentication
- bcryptjs	Password hashing
- multer	File upload handling
- dotenv	Environment variables
- node-cron	Scheduled auto-payments
- express-validator	Input validation

---

# 🧩 Database Schema Overview

Collections:

- users → User registration info, CNIC image, balance

- transactions → All money transfer logs

- loads → Mobile load & package records

- bills → Bill payments & statuses

- autopayments → Scheduled auto-payment records

---

# ⚙️ Environment Setup
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

# 📦 Installation & Run
# Clone repository
```
git clone https://github.com/<your-username>/Jazzcash-Clone-Backend.git
```

# Move into project
```
cd Jazzcash-Clone-Backend
cd backend & npm install
cd frontend & npm install
```

# Run in development mode
```
npm run dev
```

---

# ✅ API Modules
- Module	Base Route	Description:
- Auth: 	/api/auth	Register, Login
- Users:	/api/users	Update profile, show balance
- Transfer: 	/api/transfer	Jazzcash, Bank, CNIC, OtherWallet
- Bills: 	/api/bills	Pay and fetch bills
- Load: 	/api/load	Prepaid, Postpaid, Packages
- AutoPayments: 	/api/autopayments	Create and schedule auto-payments

---

# 🧠 Key Highlights

- Clean, simple TypeScript codebase

- Modular structure for easy scalability

- Ready-to-deploy backend for any wallet/payment simulation project

- Secure and production-ready architecture

---

# 👨‍💻 Author

Fahad Sohail

Backend Developer | Node.js | TypeScript | MongoDB
