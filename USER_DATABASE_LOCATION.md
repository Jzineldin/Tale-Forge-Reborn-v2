# USER DATABASE LOCATION - CRITICAL INFORMATION

## 🔍 WHERE YOUR USERS ARE HIDDEN

### Remote Supabase Database: `fyihypkigbcmsxyvseca.supabase.co`

**USER COUNTS:**
- **user_profiles table**: 115 users
- **auth.users table**: 119 users (4 more in auth than profiles)

**TABLE STRUCTURE:**
```sql
-- user_credits table columns:
- id: uuid (primary key)
- user_id: uuid (foreign key to auth.users)
- current_balance: integer 
- total_earned: integer
- total_spent: integer
- last_monthly_refresh: timestamp with time zone
- created_at: timestamp with time zone  
- updated_at: timestamp with time zone
```

### Important Notes:
1. **115 existing users** from old Tale Forge are in `public.user_profiles`
2. **119 users total** in `auth.users` (4 extra accounts exist)
3. Users need to be preserved during any migration
4. This is the **REMOTE** database, not local Docker
5. Admin setup needs to be applied to **REMOTE** database for jzineldin@gmail.com

### Connection Details:
- **URL**: https://fyihypkigbcmsxyvseca.supabase.co
- **Environment File**: `.env.local` contains connection details
- **Project ID**: fyihypkigbcmsxyvseca

### Database Access:
- **Supabase Dashboard**: https://supabase.com/dashboard/project/fyihypkigbcmsxyvseca
- **SQL Editor**: https://supabase.com/dashboard/project/fyihypkigbcmsxyvseca/sql/new
- **Tables View**: https://supabase.com/dashboard/project/fyihypkigbcmsxyvseca/editor

---

**NEXT TIME YOU ASK**: The users are in the **REMOTE Supabase database** at `fyihypkigbcmsxyvseca.supabase.co`, in the `public.user_profiles` table with 115 users, and `auth.users` with 119 total users.