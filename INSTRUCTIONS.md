# Creating Test Accounts via Supabase Dashboard

Since SQL insertion isn't working properly, here's how to create accounts through the UI:

## Step 1: Create Users in Auth Section

1. Go to https://supabase.com/dashboard/project/xikswjbanjuwepbsqngj/auth/users
2. Click "Add user" button
3. Select "Create new user"
4. Create Founder:
   - Email: `ad.founder@equityai.test`
   - Password: `TestPass123!`
   - Check "Auto-confirm email"
   - Click "Create user"
5. Click "Add user" again
6. Create Investor:
   - Email: `ad.investor@equityai.test`
   - Password: `TestPass123!`
   - Check "Auto-confirm email"
   - Click "Create user"

## Step 2: Update User Metadata

For each user, click on them and add this metadata:

**Founder:**
```json
{
  "full_name": "AD Founder",
  "role": "founder"
}
```

**Investor:**
```json
{
  "full_name": "AD Investor",
  "role": "investor"
}
```

## Step 3: Create Profiles via SQL

After creating both users, run this SQL in the SQL Editor:

```sql
-- Get the actual user IDs first
SELECT id, email FROM auth.users WHERE email LIKE '%@equityai.test';

-- Then insert profiles (replace UUIDs with actual values from above)
INSERT INTO public.profiles (id, email, full_name, role, onboarded) VALUES
  ('FOUNDER_UUID_HERE', 'ad.founder@equityai.test', 'AD Founder', 'founder', true),
  ('INVESTOR_UUID_HERE', 'ad.investor@equityai.test', 'AD Investor', 'investor', true);

-- Create investor profile
INSERT INTO public.investor_profiles (user_id, accredited, investment_min, investment_max, sectors_of_interest, stages_of_interest)
VALUES ('INVESTOR_UUID_HERE', true, 2500000, 50000000, ARRAY['AI', 'SaaS', 'Fintech'], ARRAY['seed', 'series-a']);
```

## Alternative: One-Step SQL (if you want to try again)

If you prefer SQL, try running this simpler version:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Delete existing
DELETE FROM auth.users WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');

-- Insert users with fixed UUIDs
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) VALUES
('a1111111-1111-1111-1111-111111111111', 'ad.founder@equityai.test', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"full_name":"AD Founder","role":"founder"}'),
('a2222222-2222-2222-2222-222222222222', 'ad.investor@equityai.test', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"full_name":"AD Investor","role":"investor"}');

-- Insert profiles
INSERT INTO public.profiles (id, email, full_name, role, onboarded) VALUES
('a1111111-1111-1111-1111-111111111111', 'ad.founder@equityai.test', 'AD Founder', 'founder', true),
('a2222222-2222-2222-2222-222222222222', 'ad.investor@equityai.test', 'AD Investor', 'investor', true);
```
