# 🧪 Test ZPW Now - Step-by-Step Guide

**Date**: 2024-12-19  
**Status**: Ready to test People Core module

---

## ✅ Pre-Flight Check

### 1. Verify Docker Services
```bash
docker ps
```

**Expected Output:**
```
NAMES          STATUS
zpw-postgres   Up (healthy)
zpw-redis      Up (healthy)
```

✅ **Your Docker services are running!**

---

## 🚀 Quick Start Testing (5 Minutes)

### Step 1: Set Up Backend Environment

**Create `backend/.env` file** (if it doesn't exist):

```bash
cd backend
```

Create `.env` file with this content:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://zpw_user:zpw_dev_password@localhost:5432/zpw_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
SKIP_AUTH=true
```

**Important**: `SKIP_AUTH=true` allows testing without authentication tokens.

### Step 2: Start Backend Server

**Open Terminal 1:**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server listening on http://localhost:3000
```

**Wait for**: "Server listening" message

### Step 3: Start Frontend Server

**Open Terminal 2:**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Wait for**: "ready" message

### Step 4: Test Health Check

**Open Browser:**
- Go to: http://localhost:3000/health

**Expected Response:**
```json
{"status":"ok"}
```

✅ **Backend is working!**

---

## 🎯 Test Scenarios

### Scenario 1: Test Person Management (UI)

1. **Open Frontend**: http://localhost:5173/people/persons

2. **Create a Person:**
   - Click **"Add Person"** button
   - Fill in:
     - First Name: `John`
     - Last Name: `Doe`
     - Date of Birth: `1990-01-15`
     - Gender: `MALE`
   - Click **"Create"**

3. **Verify:**
   - Person appears in the list
   - Display name shows as "John Doe"

4. **Edit Person:**
   - Click **"Edit"** on the person
   - Change Last Name to `Smith`
   - Click **"Update"**

5. **Verify:**
   - Display name updates to "John Smith"

6. **View Details:**
   - Click **"View"** on the person
   - Should see tabs: Details, Contacts, Identifiers, Qualifications, Employment History

✅ **Person management works!**

---

### Scenario 2: Test Employee Management (UI)

1. **Open**: http://localhost:5173/people/employees

2. **Create an Employee:**
   - **First, create a Person** (if you haven't):
     - Go to Persons page
     - Create a person (e.g., "Jane Employee")
     - Note the Person ID
   
   - **Then create Employee:**
     - Go to Employees page
     - Click **"Add Employee"**
     - Fill in:
       - Person: Select the person you created
       - Employee Number: `EMP001`
       - Hire Date: `2024-01-01`
       - Employment Type: `FULL_TIME`
       - Employment Status: `ACTIVE`
     - Click **"Create"**

3. **Verify:**
   - Employee appears in the list
   - Shows employee number and status

4. **View Employee Details:**
   - Click **"View"** on the employee
   - Should see tabs: Details, Dependents, Status History, Contracts, Wellness Profile

✅ **Employee management works!**

---

### Scenario 3: Test Related Entities (UI)

#### Test Person Contact

1. **Open Person Detail Page** (from Scenario 1)
2. **Go to "Contacts" tab**
3. **Click "Add Contact"**
4. **Fill in:**
   - Contact Type: `EMAIL`
   - Contact Value: `john.doe@example.com`
   - Is Primary: `Yes`
5. **Click "Create"**
6. **Verify**: Contact appears in list

✅ **Person Contact works!**

#### Test Employee Contract

1. **Open Employee Detail Page** (from Scenario 2)
2. **Go to "Contracts" tab**
3. **Click "Add Contract"**
4. **Fill in:**
   - Contract Type: `PERMANENT`
   - Start Date: `2024-01-01`
   - End Date: (leave empty for permanent)
   - Standard Hours Per Week: `40`
5. **Click "Create"**
6. **Verify**: Contract appears in list

✅ **Contract management works!**

---

### Scenario 4: Test API via Swagger UI

1. **Open Swagger UI**: http://localhost:3000/api-docs

2. **Test GET /api/v1/people/persons:**
   - Expand the endpoint
   - Click **"Try it out"**
   - Click **"Execute"**
   - **Verify**: Returns list of persons (JSON array)

3. **Test POST /api/v1/people/persons:**
   - Expand the endpoint
   - Click **"Try it out"**
   - Enter request body:
   ```json
   {
     "perFirstName": "API",
     "perLastName": "Test",
     "perDateOfBirth": "1995-05-20",
     "perGenderCode": "MALE"
   }
   ```
   - Click **"Execute"**
   - **Verify**: Returns created person with `perId`

4. **Test GET /api/v1/people/persons/{id}:**
   - Use the `perId` from step 3
   - Expand the endpoint
   - Click **"Try it out"**
   - Enter the `perId` in the path parameter
   - Click **"Execute"**
   - **Verify**: Returns that specific person

✅ **API endpoints work!**

---

### Scenario 5: Test Database Directly

**Open Terminal 3:**

```bash
docker exec -it zpw-postgres psql -U zpw_user -d zpw_db
```

**Run SQL queries:**

```sql
-- Check persons
SELECT per_id, per_first_name, per_last_name, per_display_name 
FROM pid_person 
WHERE per_deleted_at IS NULL 
ORDER BY per_created_at DESC 
LIMIT 5;

-- Check employees
SELECT emp_id, emp_employee_number, emp_employment_status_code, emp_hire_date
FROM pid_employee 
WHERE emp_deleted_at IS NULL 
ORDER BY emp_created_at DESC 
LIMIT 5;

-- Check contracts
SELECT ctr_id, ctr_emp_id, ctr_contract_type_code, ctr_start_date
FROM pid_emp_contract 
WHERE ctr_deleted_at IS NULL 
ORDER BY ctr_created_at DESC 
LIMIT 5;

-- Exit
\q
```

✅ **Database queries work!**

---

## 🧪 Comprehensive Testing Checklist

### Backend API Testing

- [ ] **Health Check**
  - [ ] GET /health returns `{"status":"ok"}`
  - [ ] GET /ready returns `{"status":"ready"}`

- [ ] **Person Endpoints**
  - [ ] GET /api/v1/people/persons (list)
  - [ ] GET /api/v1/people/persons/:id (by ID)
  - [ ] POST /api/v1/people/persons (create)
  - [ ] PUT /api/v1/people/persons/:id (update)
  - [ ] DELETE /api/v1/people/persons/:id (soft delete)

- [ ] **Employee Endpoints**
  - [ ] GET /api/v1/people/employees (list)
  - [ ] GET /api/v1/people/employees/:id (by ID)
  - [ ] POST /api/v1/people/employees (create)
  - [ ] PUT /api/v1/people/employees/:id (update)
  - [ ] DELETE /api/v1/people/employees/:id (soft delete)

- [ ] **Contract Endpoints**
  - [ ] GET /api/v1/people/contracts?employeeId=X (list)
  - [ ] GET /api/v1/people/contracts/:id (by ID)
  - [ ] GET /api/v1/people/contracts/employee/:employeeId/active (active contract)
  - [ ] POST /api/v1/people/contracts (create)
  - [ ] PUT /api/v1/people/contracts/:id (update)
  - [ ] DELETE /api/v1/people/contracts/:id (soft delete)

- [ ] **Wellness Profile Endpoints**
  - [ ] GET /api/v1/people/wellness-profiles?employeeId=X (by employee)
  - [ ] GET /api/v1/people/wellness-profiles/:id (by ID)
  - [ ] POST /api/v1/people/wellness-profiles (upsert)
  - [ ] PUT /api/v1/people/wellness-profiles/:id (update)
  - [ ] DELETE /api/v1/people/wellness-profiles/:id (soft delete)

- [ ] **Related Entity Endpoints**
  - [ ] Person Contact endpoints (5 endpoints)
  - [ ] Person Identifier endpoints (5 endpoints)
  - [ ] Dependent endpoints (5 endpoints)
  - [ ] Qualification endpoints (5 endpoints)
  - [ ] Employment History endpoints (5 endpoints)
  - [ ] Status History endpoints (5 endpoints)
  - [ ] Wellness Profile Tag endpoints (5 endpoints)

### Frontend UI Testing

- [ ] **Person Pages**
  - [ ] Person List Page (list, search, pagination)
  - [ ] Person Form Page (create, edit)
  - [ ] Person Detail Page (view, tabs)

- [ ] **Employee Pages**
  - [ ] Employee List Page (list, search, filter)
  - [ ] Employee Form Page (create, edit)
  - [ ] Employee Detail Page (view, tabs)

- [ ] **Related Entity Components**
  - [ ] Person Contact List & Form
  - [ ] Person Identifier List & Form
  - [ ] Qualification List & Form
  - [ ] Employment History List & Form
  - [ ] Dependent List & Form
  - [ ] Status History List & Form
  - [ ] Contract List & Form
  - [ ] Wellness Profile View & Form
  - [ ] Wellness Profile Tag List & Form

### Data Validation Testing

- [ ] **Required Fields**
  - [ ] Cannot create person without first name
  - [ ] Cannot create employee without person
  - [ ] Cannot create contract without employee

- [ ] **Date Validation**
  - [ ] Contract start date must be before end date
  - [ ] Employment history dates are valid
  - [ ] Status history effective dates are valid

- [ ] **Uniqueness Validation**
  - [ ] Cannot create duplicate employee number
  - [ ] Cannot create duplicate person identifier (type + country + value)
  - [ ] Cannot create duplicate wellness profile tag (code)

### Multi-Tenancy Testing

- [ ] **Tenant Isolation**
  - [ ] Employees from tenant 1 not visible to tenant 2
  - [ ] Contracts from tenant 1 not visible to tenant 2
  - [ ] Wellness profiles from tenant 1 not visible to tenant 2

- [ ] **Global Entities**
  - [ ] Persons are visible across all tenants
  - [ ] Person contacts are visible across all tenants

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check Docker
docker ps

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker logs zpw-postgres
```

### Issue: "401 Unauthorized" in Frontend

**Solution:**
1. Ensure `SKIP_AUTH=true` in `backend/.env`
2. Restart backend server
3. Clear browser cache

### Issue: "Failed to fetch" in Frontend

**Solution:**
1. Check backend is running: http://localhost:3000/health
2. Check `VITE_API_URL` in `frontend/.env` (should be `http://localhost:3000`)
3. Check CORS settings in backend

### Issue: "Port already in use"

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change PORT in backend/.env
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

---

## 📊 Expected Results

### Backend
- ✅ Server starts on port 3000
- ✅ Health check returns `{"status":"ok"}`
- ✅ Swagger UI accessible at `/api-docs`
- ✅ All API endpoints respond correctly
- ✅ Database queries work
- ✅ Audit logs are created

### Frontend
- ✅ Dev server starts on port 5173
- ✅ UI loads without errors
- ✅ Can navigate between pages
- ✅ Forms work (create, edit)
- ✅ Lists display data
- ✅ Search/filter works
- ✅ Detail pages show related entities

### Database
- ✅ Tables exist (13 People Core tables)
- ✅ Data persists after creation
- ✅ Soft deletes work (deleted_at set)
- ✅ Audit columns populated (created_at, created_by, etc.)

---

## 🎯 Success Criteria

**You've successfully tested ZPW if:**

1. ✅ Docker services are running
2. ✅ Backend server starts without errors
3. ✅ Frontend server starts without errors
4. ✅ Health check returns OK
5. ✅ Can create a person via UI
6. ✅ Can create an employee via UI
7. ✅ Can view person/employee details
8. ✅ Can add related entities (contacts, contracts, etc.)
9. ✅ API endpoints work via Swagger UI
10. ✅ Data persists in database

---

## 🚀 Next Steps After Testing

1. **Seed Core Data:**
   ```bash
   cd backend
   npm run db:seed:core -- --tenant-id=1
   ```

2. **Test with Seed Data:**
   - Create employees with leave types
   - Test performance templates
   - Test gamification levels

3. **Expand Testing:**
   - Test error scenarios
   - Test edge cases
   - Test performance with larger datasets

4. **Move to Next Module:**
   - Work Lattice (ORG_*)
   - Leave & Absence (LEA_*)
   - Performance (PRF_*)

---

## 📝 Testing Notes

- **Authentication**: Currently bypassed with `SKIP_AUTH=true` for easier testing
- **Database**: Using Docker PostgreSQL (data persists in volume)
- **Redis**: Using Docker Redis (for rate limiting, caching)
- **Logs**: Check backend console for request logs
- **Errors**: Check browser console for frontend errors

---

**Ready to test!** Follow the scenarios above step by step. 🧪

