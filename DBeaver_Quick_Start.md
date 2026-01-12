# DBeaver Quick Start Guide for ZPW

## Quick Connection Steps

### 1. Ensure Docker is Running

```bash
cd /home/tjoa/Documents/zimasa/ZPW
docker compose up -d
```

### 2. Open DBeaver

1. Launch DBeaver
2. Click **"New Database Connection"** (plug icon)
3. Select **PostgreSQL**
4. Click **Next**

### 3. Enter Connection Details

```
Host:     localhost
Port:     5432
Database: zpw_db
Username: zpw_user
Password: zpw_dev_password
```

### 4. Test & Connect

1. Click **"Test Connection"**
2. If driver missing, click **Download**
3. Wait for download
4. Click **Test Connection** again
5. Should see: ✅ **Connected**
6. Click **Finish**

### 5. Explore

Once connected, expand:
- **Databases** → **zpw_db** → **Schemas** → **public** → **Tables**

You should see all 11 PID_* tables with demo data!

---

## Connection String (Alternative)

If you prefer connection string format:

```
jdbc:postgresql://localhost:5432/zpw_db?user=zpw_user&password=zpw_dev_password
```

---

## Verify Connection

Run this query in DBeaver SQL Editor:

```sql
SELECT COUNT(*) as person_count FROM pid_person;
SELECT COUNT(*) as employee_count FROM pid_employee WHERE emp_tenant_id = 1;
```

Should return:
- `person_count`: 5 (from demo seed)
- `employee_count`: 3 (from demo seed)

---

## Troubleshooting

**Can't connect?**
```bash
# Check if containers are running
docker ps

# Check logs
docker logs zpw-postgres
```

**Tables not showing?**
- Right-click database → **Refresh**
- Verify you're connected to `zpw_db` database

---

**Ready to explore your People Core data!** 🎉
