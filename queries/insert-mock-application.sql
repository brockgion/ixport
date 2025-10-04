-- Create a new interconnection application via SQL
-- This mimics the exact flow from handleNewApplication

-- 1. Create account
WITH new_account AS (
  INSERT INTO account (email, full_name, phone)
  VALUES ('parker.miller@example.com', 'Parker Miller', '555-0100')
  RETURNING account_id
),

-- 2. Create premise
new_premise AS (
  INSERT INTO premise (street_address, city, state, zip_code)
  VALUES ('258 Willow Way', 'Seattle', 'WA', '98101')
  RETURNING prem_id
),

-- 3. Create customer (links account + premise)
new_customer AS (
  INSERT INTO customer (account_id, prem_id)
  SELECT account_id, prem_id
  FROM new_account, new_premise
  RETURNING cust_id
),

-- 4. Create installer
new_installer AS (
  INSERT INTO interconnection_installer (company_name)
  VALUES ('SolarGood LLC')
  RETURNING ix_installer_id
),

-- 5. Create system
new_system AS (
  INSERT INTO interconnection_system (system_size_kw, panel_manufacturer, inverter_manufacturer)
  VALUES (16.4, 'LG Solar', 'Delta')
  RETURNING ix_system_id
)

-- 6. Create application (links everything together)
INSERT INTO interconnection_application (cust_id, ix_installer_id, ix_system_id, status, notes)
SELECT 
  new_customer.cust_id,
  new_installer.ix_installer_id,
  new_system.ix_system_id,
  'site_selection',
  'Customer site survey scheduled with engineering team.'
FROM new_customer, new_installer, new_system
RETURNING ix_application_id, status, created_at;