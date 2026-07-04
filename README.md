# Cars24 Clone

A full-stack used-car marketplace web app inspired by Cars24 — browse used cars, sell your own car, schedule inspection appointments, and book a purchase, all backed by a real REST API and MongoDB database.

---

## Features

- 🔐 **User Authentication** — signup/login with hashed passwords (BCrypt)
- 🚗 **Buy Used Cars** — browse listings, filter by brand, view full car details/specs
- 💰 **Sell Your Car** — multi-step listing form (basic details, images & specs, pricing, features)
- 📅 **Book Appointments** — schedule a home inspection or branch visit for a listed car
- 🧾 **Bookings** — complete a purchase (payment method, loan/EMI details) and view booking history
- 👤 **Profile** — view account info, manage appointments/bookings, sign out
- 📱 Responsive UI built with Tailwind CSS

---

## Tech Stack

**Frontend**
- Next.js (Pages Router) + React + TypeScript
- Tailwind CSS
- Sonner (toast notifications)
- Lucide React (icons)

**Backend**
- ASP.NET Core Web API (.NET 10)
- MongoDB.Driver (no ORM — direct collection access)
- BCrypt.Net for password hashing

**Database**
- MongoDB (Atlas)

---

## Architecture

```
Cars24/
├── Cars24API/                # ASP.NET Core Web API
│   ├── Controllers/          # UserAuth, Car, Booking, Appointment
│   ├── Services/             # Mongo collection wrappers (business logic)
│   ├── Models/                # User, Car, Booking, Appointment
│   ├── appsettings.json      # Mongo connection string & DB name
│   └── Program.cs            # DI setup, CORS, routing
│
└── cars24/                   # Next.js frontend
    └── src/
        ├── pages/            # buy-car, sell-car, bookings, appointments, profile, auth
        ├── components/       # Home, sellcar form steps, Header/Footer
        ├── context/          # AuthContext (login state via localStorage)
        └── lib/              # API helper functions (fetch wrappers per resource)
```

**Data flow:** Next.js pages call the API helpers in `src/lib/*.ts` → these hit the ASP.NET Core API at `http://localhost:5213/api/...` → controllers use scoped **Services** to talk to MongoDB collections (`Users`, `Cars`, `Bookings`, `Appointments`) → JSON responses are consumed directly by React state.

There's no separate database layer/ORM — each `Service` class (`CarService`, `BookingService`, etc.) wraps an `IMongoCollection<T>` directly, keeping the backend intentionally simple.

---

## Installation

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+) and npm
- A MongoDB connection string (Atlas or local)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/cars24-clone.git
cd cars24
```

### 2. Backend setup
```bash
cd Cars24API
```
Copy the example config and add your MongoDB connection string:
```bash
cp appsettings.example.json appsettings.json
```
Then edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "Cars24DB": "your-mongodb-connection-string"
  },
  "MongoDB": {
    "DatabaseName": "Cars24DB"
  }
}
```
Then run:
```bash
dotnet restore
dotnet run --launch-profile http
```
API will start at `http://localhost:5213`. Check `http://localhost:5213/db-check` to confirm the database connection.

### 3. Frontend setup
Open a new terminal:
```bash
cd cars24
npm install
npm run dev
```
App will start at `http://localhost:3000`.

> **Note:** Start the backend before using the app — the frontend calls the API directly with no offline fallback.

---

<!-- ## Screenshots

| Home | Buy Used Car | Car Details |
|---|---|---|
| ![home](./screenshots/home.png) | ![buy-car](./screenshots/buy-car.png) | ![details](./screenshots/details.png) |

| Sell Car | Book Appointment | My Bookings |
|---|---|---|
| ![sell-car](./screenshots/sell-car.png) | ![appointment](./screenshots/appointment.png) | ![bookings](./screenshots/bookings.png) |

--- -->

## Demo

🔗 [Live Demo](cars24-three.vercel.app)


---

## Future Improvements

- [ ] JWT-based authentication (currently session state is client-side only)
- [ ] Move MongoDB credentials to environment variables / user-secrets instead of `appsettings.json`
- [ ] Image upload to cloud storage (Cloudinary/S3) instead of URL-only image fields
- [ ] Server-side pagination and search for car listings
- [ ] Payment gateway integration (Razorpay/Stripe) for the booking flow
- [ ] Admin dashboard for managing listings and appointments
- [ ] Unit/integration tests for controllers and services

---

## License

This project is for educational purposes only and is not intended for commercial use.
