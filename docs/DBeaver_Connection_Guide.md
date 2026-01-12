# DBeaver Connection Guide for ZPW

This guide explains how to connect DBeaver to the ZPW PostgreSQL and Redis databases.

---

## PostgreSQL Connection

### Connection Details

**Host**: `localhost`  
**Port**: `5432`  
**Database**: `zpw_db`  
**Username**: `zpw_user`  
**Password**: `zpw_dev_password`  
**Driver**: PostgreSQL

### Steps to Connect

1. **Open DBeaver**
   - Launch DBeaver application

2. **Create New Connection**
   - Click the "New Database Connection" button (plug icon) in the toolbar
   - Or go to: `Database` → `New Database Connection`

3. **Select Database Type**
   - In the connection wizard, select **PostgreSQL**
   - Click **Next**

4. **Enter Connection Details**
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `zpw_db`
   - **Username**: `zpw_user`
   - **Password**: `zpw_dev_password`
   - Check **"Save password"** if desired

5. **Test Connection**
   - Click **"Test Connection"**
   - If driver is missing, DBeaver will prompt to download it
   - Click **Download** and wait for installation
   - Click **Test Connection** again
   - You should see: "Connected"

6. **Finish**
   - Click **Finish** to save the connection

### Connection String (Alternative)

If you prefer to use a connection string:

```
jdbc:postgresql://localhost:5432/zpw_db?user=zpw_user&password=zpw_dev_password
```

### Verify Connection

Once connected, you should see:
- **Schemas**: `public`
- **Tables**: All PID_* tables (11 tables)
  - `pid_person`
  - `pid_employee`
  - `pid_emp_contract`
  - `pid_person_contact`
  - `pid_person_identifier`
  - `pid_dependent`
  - `pid_qualification`
  - `pid_employment_history`
  - `pid_emp_status_history`
  - `pid_wellness_profile`
  - `pid_wellness_profile_tag`
- **System Tables**: `sys_tenant`

---

## Redis Connection (Optional)

**Note**: DBeaver has limited Redis support. For Redis, consider using:
- **RedisInsight** (recommended)
- **Redis Commander**
- **Another Redis GUI**

If you want to try Redis in DBeaver:

1. **Install Redis Extension**
   - DBeaver may have a Redis plugin/extension
   - Check: `Help` → `Install New Software`

2. **Connection Details** (if supported)
   - **Host**: `localhost`
   - **Port**: `6379`
   - **Password**: (none by default in docker-compose)

---

## Troubleshooting

### Connection Refused

**Issue**: Cannot connect to PostgreSQL

**Solutions**:
1. Verify Docker containers are running:
   ```bash
   docker ps
   ```
   Should show `zpw-postgres` container running

2. Check container logs:
   ```bash
   docker logs zpw-postgres
   ```

3. Verify port is not in use:
   ```bash
   netstat -tlnp | grep 5432
   # or
   ss -tlnp | grep 5432
   ```

4. Restart containers if needed:
   ```bash
   docker compose down
   docker compose up -d
   ```

### Authentication Failed

**Issue**: Wrong username/password

**Solutions**:
1. Verify credentials in `docker-compose.yml`:
   ```yaml
   POSTGRES_USER: zpw_user
   POSTGRES_PASSWORD: zpw_dev_password
   POSTGRES_DB: zpw_db
   ```

2. Check if database exists:
   ```bash
   docker exec -it zpw-postgres psql -U zpw_user -d zpw_db -c "\dt"
   ```

### Driver Not Found

**Issue**: PostgreSQL driver missing

**Solutions**:
1. DBeaver should prompt to download driver automatically
2. Manual download:
   - Go to: `Database` → `Driver Manager`
   - Select **PostgreSQL**
   - Click **Download/Update**
   - Wait for download to complete

### Tables Not Visible

**Issue**: Connected but no tables shown

**Solutions**:
1. Refresh database connection (right-click → Refresh)
2. Check if tables exist:
   ```bash
   docker exec -it zpw-postgres psql -U zpw_user -d zpw_db -c "\dt pid_*"
   ```
3. Verify you're connected to correct database (`zpw_db`)

---

## Quick Reference

### Connection Parameters

| Parameter | Value |
|----------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `zpw_db` |
| Username | `zpw_user` |
| Password | `zpw_dev_password` |
| Driver | PostgreSQL |

### Docker Commands

```bash
# Start databases
docker compose up -d

# Check status
docker ps

# View logs
docker logs zpw-postgres
docker logs zpw-redis

# Connect via psql
docker exec -it zpw-postgres psql -U zpw_user -d zpw_db

# Stop databases
docker compose down
```

---

## Next Steps

After connecting:

1. **Explore Tables**: Browse the People Core tables
2. **View Data**: Check seeded demo data
3. **Run Queries**: Test SQL queries
4. **Export Data**: Use DBeaver's export features if needed

---

**Connection Guide**: Complete  
**Ready to Use**: ✅
