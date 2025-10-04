-- COMPLETE DATABASE RESET SCRIPT
-- Run this in Supabase SQL Editor to start fresh

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS interconnection_application CASCADE;
DROP TABLE IF EXISTS service CASCADE;
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS interconnection_system CASCADE;
DROP TABLE IF EXISTS interconnection_installer CASCADE;
DROP TABLE IF EXISTS premise CASCADE;
DROP TABLE IF EXISTS account CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_status_change() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Account table
CREATE TABLE account (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Premise table
CREATE TABLE premise (
    prem_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer table
CREATE TABLE customer (
    cust_id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    prem_id UUID REFERENCES premise(prem_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Service table
CREATE TABLE service (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cust_id UUID NOT NULL REFERENCES customer(cust_id) ON DELETE CASCADE,
    utility_provider VARCHAR(255) NOT NULL,
    service_account_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interconnection Installer table
CREATE TABLE interconnection_installer (
    ix_installer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interconnection System table
CREATE TABLE interconnection_system (
    ix_system_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_size_kw DECIMAL(10,2) NOT NULL,
    panel_manufacturer VARCHAR(255),
    panel_model VARCHAR(255),
    inverter_manufacturer VARCHAR(255),
    inverter_model VARCHAR(255),
    estimated_annual_production_kwh DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interconnection Application table
CREATE TABLE interconnection_application (
    ix_application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cust_id UUID NOT NULL REFERENCES customer(cust_id) ON DELETE CASCADE,
    ix_installer_id UUID NOT NULL REFERENCES interconnection_installer(ix_installer_id),
    ix_system_id UUID NOT NULL UNIQUE REFERENCES interconnection_system(ix_system_id),
    
    status VARCHAR(50) NOT NULL DEFAULT 'site_selection',
    
    submitted_at TIMESTAMP,
    agreement_approved_at TIMESTAMP,
    construction_started_at TIMESTAMP,
    completed_at TIMESTAMP,
    withdrawn_at TIMESTAMP,
    
    notes TEXT,
    utility_reviewer_id UUID REFERENCES account(account_id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Application status history tracking
CREATE TABLE application_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ix_application_id UUID REFERENCES interconnection_application(ix_application_id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES account(account_id),
    changed_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- Create Indexes

-- Customer Indexes
CREATE INDEX idx_customer_account      ON customer(account_id);
CREATE INDEX idx_customer_premise      ON customer(prem_id);

-- Service Index
CREATE INDEX idx_service_customer      ON service(cust_id);

-- Interconnection Application Indexes
CREATE INDEX idx_application_customer  ON interconnection_application(cust_id);
CREATE INDEX idx_app_installer         ON interconnection_application(ix_installer_id);
CREATE INDEX idx_app_system            ON interconnection_application(ix_system_id);
CREATE INDEX idx_app_reviewer          ON interconnection_application(utility_reviewer_id);
CREATE INDEX idx_application_status ON interconnection_application(status);



-- Application Status History Indexes
CREATE INDEX idx_hist_app              ON application_status_history(ix_application_id);
CREATE INDEX idx_hist_changed_by       ON application_status_history(changed_by);


-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_ix_application_updated_at 
    BEFORE UPDATE ON interconnection_application 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log status changes
-- Note: this will carry forward notes into history
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO application_status_history
      (ix_application_id, old_status, new_status, changed_by, changed_at, notes)
    VALUES
      (
        NEW.ix_application_id,
        OLD.status,
        NEW.status,
        NEW.utility_reviewer_id,            
        NOW(),
        NULLIF(BTRIM(COALESCE(OLD.notes, '')), '')  -- store note only if non-empty
      );

    -- start a clean note for the new stage
    NEW.notes := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DISABLE RLS FOR DEMO (can re-enable for production with proper policies)
ALTER TABLE account DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer DISABLE ROW LEVEL SECURITY;
ALTER TABLE interconnection_application DISABLE ROW LEVEL SECURITY;

-- Database is now completely clean and ready for testing
SELECT 'Database reset complete - all tables recreated with no data' as status;