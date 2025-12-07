# Database Setup Guide

## 📍 Database Configuration Location

The database configuration is set in **two places**:

### 1. **Environment Variables** (Recommended - `.env` file)
Location: `rms-be/.env`

### 2. **Code Configuration** (Fallback - `app.module.ts`)
Location: `rms-be/src/app.module.ts` (lines 43-72)

---

## 🗄️ Database Setup Steps

### Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:
- **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### Step 2: Create PostgreSQL Database

1. **Open PostgreSQL Command Line** (psql) or **pgAdmin**

2. **Connect to PostgreSQL**:
```bash
psql -U postgres
```

3. **Create Database**:
```sql
CREATE DATABASE rms_db;
```

4. **Verify Database Created**:
```sql
\l
```

### Step 3: Configure Database Connection

#### Option A: Using Environment Variables (Recommended)

1. **Create `.env` file** in `rms-be/` directory:
```bash
cd rms-be
cp env.example .env
```

2. **Edit `.env` file** with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=rms_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Other configurations...
```

3. **Update `app.module.ts`** to use environment variables:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '9695',
  database: process.env.DB_DATABASE || 'rms_db',
  // ... rest of config
})
```

#### Option B: Direct Configuration (Current Setup)

Currently, the database is hardcoded in `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '9695',  // ⚠️ Change this to your PostgreSQL password
  database: 'rms_db',
  // ...
})
```

**Update the password** in `rms-be/src/app.module.ts` line 48 to match your PostgreSQL password.

### Step 4: Run Database Setup Script

1. **Navigate to rms-be directory**:
```bash
cd rms-be
```

2. **Run the setup script** using psql:
```bash
psql -U postgres -d rms_db -f setup-database.sql
```

Or if you need to enter password:
```bash
psql -U postgres -d rms_db -f setup-database.sql
# Enter password when prompted
```

**Alternative: Using pgAdmin**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `rms_db` database → Query Tool
4. Open `setup-database.sql` file
5. Execute the script (F5)

### Step 5: (Optional) Seed Initial Data

If you want to add sample data:
```bash
psql -U postgres -d rms_db -f seed-data.sql
```

---

## 📋 Database Setup Scripts

The following SQL scripts are available in `rms-be/`:

| Script | Purpose |
|--------|---------|
| `setup-database.sql` | Creates all tables, enums, and schema |
| `seed-data.sql` | Inserts sample/test data |
| `reset-db.sql` | Drops and recreates database (⚠️ WARNING: Deletes all data) |
| `migrations/001-cart-management-system.sql` | Cart management system tables |
| `fix-orders-migration.sql` | Fixes order-related schema issues |

---

## ✅ Verify Database Setup

### Check Tables Created:
```sql
\dt
```

You should see tables like:
- users
- restaurants
- menu_items
- orders
- order_items
- tables
- payments
- notifications
- carts
- etc.

### Check Database Connection from App:

1. **Start the backend**:
```bash
cd rms-be
npm start
```

2. **Check logs** - You should see:
```
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
```

If you see connection errors, check:
- PostgreSQL is running
- Database credentials are correct
- Database `rms_db` exists

---

## 🔧 Troubleshooting

### Error: "password authentication failed"
- **Solution**: Check your PostgreSQL password in `app.module.ts` or `.env` file
- Verify password: `psql -U postgres` (enter password)

### Error: "database rms_db does not exist"
- **Solution**: Create database: `CREATE DATABASE rms_db;`

### Error: "relation already exists"
- **Solution**: Database tables already exist. Use `reset-db.sql` to recreate, or continue (it's fine)

### Error: "permission denied"
- **Solution**: Make sure your PostgreSQL user has CREATE privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE rms_db TO postgres;
```

### Connection Timeout
- **Solution**: 
  - Check PostgreSQL is running: `pg_isready`
  - Check firewall settings
  - Verify host/port in configuration

---

## 📝 Current Database Configuration

**Location**: `rms-be/src/app.module.ts`

**Current Settings**:
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: 9695 ⚠️ **Change this to your password**
- **Database**: rms_db
- **Synchronize**: false (manual migrations)

---

## 🚀 Quick Setup Commands

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE rms_db;"

# 2. Run setup script
psql -U postgres -d rms_db -f setup-database.sql

# 3. (Optional) Seed data
psql -U postgres -d rms_db -f seed-data.sql

# 4. Update password in app.module.ts or .env

# 5. Start backend
cd rms-be
npm start
```

---

## 📚 Next Steps

After database setup:
1. ✅ Database created and configured
2. ✅ Tables created via setup script
3. ✅ Backend can connect to database
4. ✅ Start implementing features!

---

**Need Help?** Check the error logs in the terminal when starting the backend server.

