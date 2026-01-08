# Security: Row Level Security (RLS) Setup

This document contains the complete SQL commands to secure your Supabase database.

## Prerequisites
- Supabase project created
- Database schema pushed via `npx drizzle-kit push`

## Setup Instructions

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Run each SQL block below in order

---

## Step 1: Enable RLS on All Tables

```sql
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE section ENABLE ROW LEVEL SECURITY;
```

---

## Step 2: User Profile Policies

```sql
CREATE POLICY "Users can view own profile"
  ON user_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profile FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Step 3: Category Policies

```sql
CREATE POLICY "Users can view own categories"
  ON category FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON category FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON category FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON category FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Step 4: Transaction Policies

```sql
CREATE POLICY "Users can view own transactions"
  ON transaction FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transaction FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transaction FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transaction FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Step 5: Tag Policies

```sql
CREATE POLICY "Users can view own tags"
  ON tag FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tag FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tag FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Step 6: Transaction Tag Policies

```sql
CREATE POLICY "Users can view own transaction tags"
  ON transaction_tag FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transaction
      WHERE transaction.id = transaction_tag.transaction_id
      AND transaction.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transaction tags"
  ON transaction_tag FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transaction
      WHERE transaction.id = transaction_tag.transaction_id
      AND transaction.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transaction tags"
  ON transaction_tag FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transaction
      WHERE transaction.id = transaction_tag.transaction_id
      AND transaction.user_id = auth.uid()
    )
  );
```

---

## Step 7: Section Policies (NEW)

```sql
CREATE POLICY "Users can view own sections"
  ON section FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sections"
  ON section FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sections"
  ON section FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sections"
  ON section FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔒 Verification Steps

To ensure RLS is active and correct:

1.  **Check RLS Status:**
    ```sql
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public';
    ```
    *All rows should show `true` for `rowsecurity`.*

2.  **Verify Row Count per User:**
    Logged in as a user, you should only see your own rows.
    ```sql
    -- This should return 0 rows if run in Supabase SQL editor (as it defaults to service_role)
    -- UNLESS you specifically test with a user session.
    ```

3.  **Check Policies Applied:**
    ```sql
    SELECT * FROM pg_policies;
    ```

---

## Testing RLS

1. Create 2 test user accounts
2. Add transactions to each account
3. Try to query the other user's data via SQL Editor:
   ```sql
   SELECT * FROM transaction WHERE user_id != auth.uid();
   ```
   **Expected:** 0 rows (RLS blocks access)

---

## 🛠️ Troubleshooting

If you see **"UNRESTRICTED"** in the Supabase Table Editor:
- It means RLS is either disabled or you have a `PERMISSIVE` policy like `FOR ALL TO public USING (true)`.
- Make sure to run `ALTER TABLE [name] ENABLE ROW LEVEL SECURITY;`
- Delete any old testing policies: `DROP POLICY IF EXISTS "public access" ON [table];`

### "Row violates row-level security policy"
- ✅ This is correct! RLS is working.
- The app should handle this gracefully with auth checks.

### Policies not applying
- Ensure you're logged in as the correct user in Supabase Dashboard
- Check `auth.uid()` returns the expected user ID:
  ```sql
  SELECT auth.uid();
  ```

### Need to reset policies
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```
Then re-run the CREATE POLICY commands.

---

## Security Best Practices

✅ **DO:**
- Keep RLS enabled on all tables
- Test policies with multiple user accounts
- Use `auth.uid()` for user identification
- Review policies before production deployment

❌ **DON'T:**
- Disable RLS in production
- Use `user_id` from request body (can be spoofed)
- Grant public access unless absolutely necessary
- Forget to test edge cases (deleted users, etc.)
