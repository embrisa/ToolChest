-- Migration: Remove AdminUser and AdminAuditLog tables
-- This migration removes user-based authentication tables since admin auth is now token-based.

-- Drop dependent table first to satisfy FK constraints
DROP TABLE IF EXISTS "AdminAuditLog" CASCADE;

-- Drop main AdminUser table
DROP TABLE IF EXISTS "AdminUser" CASCADE; 