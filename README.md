# Loan Management System

A comprehensive loan management system built with Laravel (Backend) and Next.js (Frontend), featuring role-based authentication, loan application processing, and administrative management capabilities.

##  Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
  - [Docker Setup (Recommended)](#docker-setup-recommended)
  - [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Default Users](#default-users)
- [Deployment](#deployment)
- [Assumptions & Limitations](#assumptions--limitations)

##  Features

### Backend (Laravel)
- **Authentication & Authorization**
  - Token-based authentication with Laravel Sanctum
  - Role-based access control (RBAC) using Spatie Laravel Permission
  - Custom permissions for granular access control

- **Loan Application Module**
  - Applicants can submit loan applications
  - View own loan applications and status
  - Loan fields: amount, tenure (months), purpose
  - Status lifecycle: PENDING → APPROVED/REJECTED
  - Admin approval/rejection with comments

- **Caching Mechanism**
  - Redis/File-based caching for frequently accessed APIs
  - Cache invalidation on data mutations
  - 5-minute TTL for user/role/permission lists
  - 1-minute TTL for loan lists

- **Best Practices**
  - Form Request validation
  - API Resources for standardized responses
  - ResponseService for consistent JSON responses
  - Repository pattern ready
  - Database transactions for critical operations

### Frontend (Next.js)
- **Authentication**
  - Login/Register pages
  - Protected routes with middleware
  - Automatic token management

- **Applicant Features**
  - Intuitive loan application form
  - View submitted applications with status
  - Real-time form validation

- **Admin Features**
  - View all loan applications
  - Approve/Reject loans with comments
  - User management (CRUD operations)
  - Role and permission management
  - Search and filter capabilities

## 🛠 Technology Stack

### Backend
- **Framework:** Laravel 11.x
- **Database:** PostgreSQL 15
- **Authentication:** Laravel Sanctum
- **Authorization:** Spatie Laravel Permission
- **Caching:** Redis/File Cache
- **Testing:** PHPUnit

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Hooks

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx
- **Process Manager:** Supervisor

##  Requirements

- Docker & Docker Compose (for Docker setup)
- PHP 8.2+ (for manual setup)
- Composer
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

##  Installation

### Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Technical Assesment/Assesment"
```

2. **Set up environment variables**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend_new/.env.example frontend_new/.env
```

3. **Build and start containers**
```bash
docker-compose up -d --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- PostgreSQL: localhost:5432

The Docker setup automatically:
- Creates and migrates the database
- Seeds initial data (roles, permissions, users)
- Starts all services

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and configure database:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=loan_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

4. **Generate application key**
```bash
php artisan key:generate
```

5. **Run migrations and seeders**
```bash
php artisan migrate --seed
```

6. **Start the development server**
```bash
php artisan serve
```

Backend will be available at http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend_new
```

2. **Install Node dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. **Start the development server**
```bash
npm run dev
```

Frontend will be available at http://localhost:3000

##  Configuration

### Backend Configuration

Key configuration files:
- `backend/.env` - Environment variables
- `backend/config/sanctum.php` - API authentication
- `backend/config/permission.php` - Role & permission settings
- `backend/config/cache.php` - Cache configuration

### Frontend Configuration

- `frontend_new/.env.local` - Environment variables
- `frontend_new/next.config.mjs` - Next.js configuration
- `frontend_new/tailwind.config.ts` - Tailwind CSS configuration

## 🗄 Database Setup

### Migrations

All database tables are created via migrations:
```bash
php artisan migrate
```

Key tables:
- `users` - User accounts
- `loans` - Loan applications
- `roles` - User roles (Spatie)
- `permissions` - System permissions (Spatie)
- `model_has_roles` - User-role assignments
- `role_has_permissions` - Role-permission assignments

### Seeders

Seed the database with initial data:
```bash
php artisan db:seed
```

Available seeders:
- `RolePermissionSeeder` - Creates default roles and permissions
- `DatabaseSeeder` - Creates admin and applicant users
- `LoanSeeder` - Creates sample loan data (optional)

To seed loans:
```bash
php artisan db:seed --class=LoanSeeder
```

##  Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test --filter=AuthenticationTest

# Run with coverage
php artisan test --coverage
```

Test suites:
- `AuthenticationTest` - Login, register, logout
- `LoanManagementTest` - Loan CRUD, approval/rejection
- `UserManagementTest` - User management operations

### Frontend Tests

```bash
cd frontend_new

# Run tests (if configured)
npm test
```

##  API Documentation

### Postman Collection

Import the Postman collection: `Loan_Management_API.postman_collection.json`

### Environment Variables for Postman

Set these variables in Postman:
- `base_url`: http://localhost:8000/api
- `access_token`: (Auto-populated after login)

### Key API Endpoints

#### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/profile` - Get user profile

#### Loan Management (Applicant)
- `POST /api/loans/apply` - Submit loan application
- `GET /api/loans` - Get own loans
- `GET /api/loans/{id}` - Get loan details

#### Admin - Loan Management
- `GET /api/admin/loans` - Get all loans
- `PATCH /api/admin/loans/{id}/status` - Approve/Reject loan

#### Admin - User Management
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

#### Admin - Role Management
- `GET /api/admin/roles` - List roles
- `POST /api/admin/roles` - Create role
- `POST /api/admin/roles/{id}/permissions` - Assign permissions

#### Admin - Permission Management
- `GET /api/admin/permissions` - List permissions
- `GET /api/admin/permissions/grouped` - Get grouped permissions

##  Project Structure

```
.
├── backend/                    # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API controllers
│   │   │   ├── Requests/      # Form request validation
│   │   │   └── Resources/     # API resources
│   │   ├── Models/            # Eloquent models
│   │   ├── Policies/          # Authorization policies
│   │   └── Services/          # Business logic services
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/           # Database seeders
│   ├── routes/
│   │   └── api.php            # API routes
│   └── tests/                 # PHPUnit tests
│
├── frontend_new/               # Next.js frontend
│   ├── app/                   # App router pages
│   │   ├── admin/             # Admin pages
│   │   ├── loans/             # Loan pages
│   │   ├── login/             # Login page
│   │   └── register/          # Register page
│   ├── components/            # React components
│   ├── lib/                   # Utilities & helpers
│   └── public/                # Static assets
│
├── docker-compose.yml         # Docker orchestration
├── Loan_Management_API.postman_collection.json
└── README.md
```

## Default Users

After seeding, these users are available:

### Super Admin
- **Email:** admin@example.com
- **Password:** Super@2025
- **Permissions:** Full system access

### Applicant
- **Email:** applicant@example.com
- **Password:** password123
- **Permissions:** Loan application and viewing

##  Deployment

### Production Checklist

1. **Environment Configuration**
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Generate new `APP_KEY`
   - Configure production database
   - Set proper CORS origins

2. **Database**
   - Run migrations: `php artisan migrate --force`
   - Seed initial data: `php artisan db:seed --force`

3. **Optimization**
   - Cache configuration: `php artisan config:cache`
   - Cache routes: `php artisan route:cache`
   - Optimize autoloader: `composer install --optimize-autoloader --no-dev`

4. **Security**
   - Enable HTTPS
   - Configure proper CORS
   - Set secure session cookies
   - Use environment-specific secrets

5. **Frontend**
   - Build production bundle: `npm run build`
   - Set production API URL
   - Configure CDN for static assets

### Docker Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

##  Assumptions & Limitations

### Assumptions
- Single currency system
- Loan amount range: 1,000 - 10,000,000
- Tenure range: 1 - 120 months
- One loan application per submission
- Status changes are final (no reverting)

### Limitations
- File upload not implemented
- Email notifications not implemented
- Payment gateway integration not included
- Basic search (no full-text search)
- Local file storage (recommend S3 for production)

For complete details, see `TECHNICAL_ASSIGNMENT_STATUS.md`

##  License

This project is developed as a technical assignment.

##  Support

For issues or questions, please refer to the technical documentation or create an issue in the repository.

---

**Built with using Laravel & Next.js**
