# RentRide - Vehicle Rental Platform

A modern, full-stack vehicle rental platform with user authentication, booking management, and integrated payment processing.

## 🚀 Features

### Backend
- **Node.js & Express** REST API
- **MongoDB** database with Mongoose ORM
- **JWT Authentication** with secure password hashing
- **Role-based access control** (User/Admin)
- **Stripe Payment Integration** for secure transactions
- **Comprehensive API** for vehicles, bookings, and payments

### Frontend
- **Modern UI/UX** with premium dark theme
- **Glassmorphism effects** and smooth animations
- **Responsive design** for all devices
- **User Dashboard** for booking management
- **Advanced search & filtering** for vehicles
- **Secure payment flow** with Stripe Elements

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe Account (for payment processing)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - MongoDB connection string
   - JWT secret key
   - Stripe API keys
   - Port number

5. (Optional) Seed the database with sample vehicles:
```bash
node seed.js
```

6. Start the backend server:
```bash
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Serve the frontend using any static file server:
```bash
npx serve -p 3000
```

Or use Live Server extension in VS Code.

The frontend will be available at `http://localhost:3000`

## 🧪 Testing

### API Endpoints

You can test the API using Postman or Thunder Client:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

**Vehicles:**
- `GET /api/vehicles` - Get all vehicles (with filtering)
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle (admin only)

**Bookings:**
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings/user` - Get user bookings (requires auth)
- `PUT /api/bookings/:id/cancel` - Cancel booking (requires auth)

**Payments:**
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

### Test Payment

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and any 3-digit CVC

## 📁 Project Structure

```
Vehicle On Rent/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── css/
    │   ├── main.css         # Design system
    │   └── components.css   # Component styles
    ├── js/
    │   ├── api.js          # API utilities
    │   └── utils.js        # Helper functions
    ├── index.html          # Landing page
    ├── vehicles.html       # Vehicle listing
    ├── vehicle-details.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    └── payment.html
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vehicle-rental
JWT_SECRET=your_secure_random_string
STRIPE_SECRET_KEY=sk_test_your_stripe_key
FRONTEND_URL=http://localhost:3000
```

## 🎨 Key Features

1. **User Authentication**
   - Secure registration and login
   - JWT-based authentication
   - Password hashing with bcrypt

2. **Vehicle Management**
   - Browse vehicles with advanced filters
   - Search by type, price, location
   - View detailed specifications

3. **Booking System**
   - Date-based availability checking
   - Real-time price calculation
   - Booking history tracking

4. **Payment Integration**
   - Stripe payment processing
   - Secure card handling
   - Payment confirmation

5. **User Dashboard**
   - View and manage bookings
   - Cancel bookings
   - Update profile information

## 🚧 Admin Features

To create an admin user, manually update the user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Admin users can:
- Create new vehicles
- Update vehicle details
- Delete vehicles
- View all bookings

## 📝 Notes

- The frontend uses vanilla JavaScript (no framework)
- Stripe test mode is enabled by default
- MongoDB connection uses Mongoose
- CORS is enabled for local development

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`

**Stripe Payment Issues:**
- Verify Stripe API keys
- Use test card numbers
- Check browser console for errors

**CORS Errors:**
- Ensure FRONTEND_URL in `.env` matches your frontend URL
- Check that backend is running on correct port

## 📄 License

This project is open source and available under the MIT License.

## 👤 Support

For issues or questions, please create an issue in the repository.
