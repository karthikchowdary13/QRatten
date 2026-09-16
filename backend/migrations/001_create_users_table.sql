-- backend/migrations/001_create_users_table.sql
-- Up Migration

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    mobile VARCHAR,
    password_hash VARCHAR NOT NULL,
    role VARCHAR CHECK (role IN ('student', 'teacher', 'admin', 'STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN', 'INSTITUTION_ADMIN')) DEFAULT 'student',
    
    -- existing project columns needed to prevent breaking other APIs
    avatar_url VARCHAR,
    institution_id VARCHAR,
    faculty_id VARCHAR UNIQUE,
    status VARCHAR DEFAULT 'PENDING',
    last_active TIMESTAMP WITH TIME ZONE,
    password_updated_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- Down Migration
-- DROP TABLE users;
