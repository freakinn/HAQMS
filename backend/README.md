# HAQMS Backend - Node + Express + Prisma API Server

This is the Express API server and database layer for the Hospital Appointment & Queue Management System.

## 🚀 Running the API
The backend server runs on port `5000` by default.

### Setup Database Environment
1. Ensure a local PostgreSQL instance is running or launch the pre-packaged docker container.
2. Build migrations and run the mock seed:
```bash
npm run db:setup
```

### Start Development Server
```bash
npm run dev
```

## 🔍 Candidate Scope
### Production Demo Login Setup
On Render, run this once from the backend service Shell after configuring `DATABASE_URL`:
```bash
npm run db:deploy:setup
```

Demo accounts use password `password123`:
- `admin@haqms.com`
- `reception1@haqms.com`
- `doctor1@haqms.com`

Analyze, profile, secure, and refactor files inside `src/` and `prisma/`:
- **SQL Injection**: Resolve raw interpolation queries in `src/routes/doctors.js`.
- **N+1 Database Queries**: Optimize appointments aggregation inside `src/routes/appointments.js`.
- **Concurrency Race Conditions**: Secure `src/routes/queue.js` token increments.
- **Weak Authorization**: Patch route security in `src/routes/patients.js`.
- **Schema Optimization**: Introduce proper constraints and indexes in `prisma/schema.prisma`.
