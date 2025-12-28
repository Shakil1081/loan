# Testing Guide

## Setup Test Database

### Option 1: Using Docker PostgreSQL

If using Docker, create the test database:

```bash
# Access PostgreSQL container
docker exec -it loan_postgres psql -U postgres

# Create test database
CREATE DATABASE loan_db_test;

# Exit PostgreSQL
\q
```

### Option 2: Using Local PostgreSQL

If PostgreSQL is installed locally:

```bash
# Windows (using pgAdmin or command line if psql is in PATH)
createdb -U postgres loan_db_test

# Or using SQL
psql -U postgres
CREATE DATABASE loan_db_test;
\q
```

### Option 3: Alternative - Use SQLite for Testing

Edit `backend/phpunit.xml` to use SQLite instead:

```xml
<php>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
</php>
```

## Running Tests

### Run All Tests
```bash
cd backend
php artisan test
```

### Run Specific Test Suite
```bash
# Authentication tests
php artisan test --filter=AuthenticationTest

# Loan management tests
php artisan test --filter=LoanManagementTest

# User management tests
php artisan test --filter=UserManagementTest
```

### Run Specific Test Method
```bash
php artisan test --filter=test_user_can_login_with_valid_credentials
```

### Run Tests in Parallel
```bash
php artisan test --parallel
```

### Run Tests with Coverage
```bash
php artisan test --coverage
```

## Test Structure

### Feature Tests
- **AuthenticationTest** - Tests login, register, logout, profile
- **LoanManagementTest** - Tests loan CRUD, approval/rejection
- **UserManagementTest** - Tests user management operations

### Expected Results
All 23 tests should pass:
- 4 authentication tests
- 8 loan management tests  
- 6 user management tests
- 5 authorization tests

## Troubleshooting

### "Target class [permission] does not exist"
- Make sure `RolePermissionSeeder` is being called in test setup
- Verify Spatie Permission package is installed

### Database Connection Errors
- Verify test database exists
- Check database credentials in `.env.testing` or `phpunit.xml`
- Ensure PostgreSQL service is running

### Cache Issues
- Clear application cache: `php artisan cache:clear`
- Clear config cache: `php artisan config:clear`

### Migration Errors
- Ensure migrations are up to date: `php artisan migrate:fresh --env=testing`
- Check that test database has proper permissions

## Quick Start

1. **Create test database:**
   ```bash
   docker exec -it loan_postgres psql -U postgres -c "CREATE DATABASE loan_db_test;"
   ```

2. **Run tests:**
   ```bash
   cd backend
   php artisan test
   ```

3. **Expected output:**
   ```
   Tests:    23 passed (XX assertions)
   Duration: XX.XXs
   ```
