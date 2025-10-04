-- Example of only showing applications assigned to a specific installer
SELECT 
    SUBSTRING(a.ix_application_id::text, 1, 8) as app_id,
    a.status,
    acc.full_name as customer_name,
    p.street_address || ', ' || p.city || ', ' || p.state as location,
    s.system_size_kw,
    s.panel_manufacturer,
    TO_CHAR(a.created_at, 'MM/DD/YYYY') as submitted_date,
    TO_CHAR(a.completed_at, 'MM/DD/YYYY') as completion_date
FROM interconnection_application a
JOIN interconnection_installer i ON a.ix_installer_id = i.ix_installer_id
JOIN customer c ON a.cust_id = c.cust_id
JOIN account acc ON c.account_id = acc.account_id
LEFT JOIN premise p ON c.prem_id = p.prem_id
JOIN interconnection_system s ON a.ix_system_id = s.ix_system_id
WHERE i.company_name = 'INSTALLER_NAME_GOES_HERE'  -- Replace with actual installer name
ORDER BY a.created_at DESC;