-- Manual Admin User Creation Script for Production
-- Run this script directly in your production database

-- First, check if AdminUser table exists and has the correct structure
-- You may need to run migrations first if this is a fresh database

-- Create a super admin user manually
-- Password: 'admin123' (hashed with bcrypt rounds=12)
-- You should change this password immediately after first login!

INSERT INTO "AdminUser" (
    id,
    username,
    email,
    "passwordHash",
    role,
    "isActive",
    "lastLoginAt",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin-' || EXTRACT(EPOCH FROM NOW())::text, -- Simple unique ID
    'admin',
    'admin@toolchest.local',
    '$2a$12$LQv3c1yqBwlVHpPekmEzKum.TxoW.D3gBN7THTF3g/H6QJ5Jl.Z2e', -- bcrypt hash of 'admin123'
    'SUPER_ADMIN',
    true,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Verify the user was created
SELECT id, username, email, role, "isActive", "createdAt" 
FROM "AdminUser" 
WHERE username = 'admin';

-- Note: After running this script and accessing the admin dashboard,
-- please change the default password immediately!
-- Default credentials:
-- Username: admin
-- Password: admin123 