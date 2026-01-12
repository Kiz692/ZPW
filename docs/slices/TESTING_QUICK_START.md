# Quick Start - Manual Testing Guide

## ✅ Services Status

**Docker Services:** ✅ Running
- PostgreSQL: ✅ Ready
- Redis: ✅ Ready

---

## 🚀 Start Testing in 3 Steps

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

**Wait for:** `Server listening on http://0.0.0.0:3000`

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**Wait for:** `Local: http://localhost:5173/`

### Step 3: Test!

**Open in browser:**
- Frontend: http://localhost:5173/people/persons
- Swagger: http://localhost:3000/api-docs
- Health: http://localhost:3000/health

---

## 📋 Quick Test Checklist

### ✅ Basic Checks (2 minutes)

- [ ] **Health Check**: http://localhost:3000/health → Should show `{"status":"ok"}`
- [ ] **Frontend Loads**: http://localhost:5173 → Should see the app
- [ ] **Person List**: http://localhost:5173/people/persons → Should see person list page
- [ ] **Swagger UI**: http://localhost:3000/api-docs → Should see API documentation

### ✅ Create Person Test (3 minutes)

1. Go to: http://localhost:5173/people/persons
2. Click "Add Person"
3. Fill in:
   - First Name: `Test`
   - Last Name: `User`
4. Click "Create"
5. ✅ **Expected**: Person appears in list

### ✅ API Test (2 minutes)

1. Go to: http://localhost:3000/api-docs
2. Expand: `GET /api/v1/people/persons`
3. Click "Try it out" → "Execute"
4. ✅ **Expected**: Returns list of persons (may be empty array `[]`)

---

## 🛠️ Helper Scripts

### Test API Endpoints
```powershell
.\test-api.ps1
```

### Test Database
```powershell
.\test-database.ps1
```

### Start All Services
```powershell
.\start-testing.ps1
```

---

## 📖 Full Testing Guide

For comprehensive testing, see:
- **`MANUAL_TESTING_STEPS.md`** - Detailed step-by-step guide
- **`TESTING_CHECKLIST.md`** - Complete checklist
- **`TESTING_GUIDE.md`** - Full testing documentation

---

## 🎯 Success Indicators

You're ready to test if:
- ✅ Docker services are running
- ✅ Backend server is running (port 3000)
- ✅ Frontend server is running (port 5173)
- ✅ Health check returns `{"status":"ok"}`

---

**Ready to test!** 🧪

