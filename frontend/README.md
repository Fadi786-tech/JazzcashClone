# JazzCash Clone - Frontend

A modern React frontend application for the JazzCash Clone digital wallet system.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Dashboard**: Overview of balance, quick actions, and recent transactions
- **Money Transfer**: Transfer money via JazzCash, Bank, CNIC, or Other Wallets
- **Bill Payment**: Pay utility bills (Electricity, Gas, Water, Internet, Telephone)
- **Mobile Load**: Purchase prepaid, postpaid, or package mobile loads
- **Bank Accounts**: Manage multiple bank accounts with CRUD operations
- **Autopayments**: Schedule automatic payments for bills, transfers, and loads
- **Profile Management**: Update user profile and picture

## Technologies Used

- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

The application will run on `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Transfer.tsx
│   │   ├── Bills.tsx
│   │   ├── Load.tsx
│   │   ├── BankAccounts.tsx
│   │   ├── Autopayments.tsx
│   │   └── Profile.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── transferService.ts
│   │   ├── billService.ts
│   │   ├── loadService.ts
│   │   ├── bankAccountService.ts
│   │   └── autopaymentService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## API Integration

The frontend communicates with the backend API running on `http://localhost:5000`. Make sure the backend server is running before using the frontend.

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests

## Notes

- The application uses JWT tokens stored in localStorage for authentication
- All API requests include the JWT token in the Authorization header
- The frontend automatically redirects to login if the token is invalid or expired
- Image uploads are handled using FormData for multipart/form-data requests

