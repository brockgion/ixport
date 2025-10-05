--Count applications CURRENTLY at each stage (based on status)
WITH all_stages AS (
    VALUES 
        (1, 'Site Selection', 'site_selection'),
        (2, 'Application Submitted', 'submitted'),
        (3, 'Agreement Approved', 'agreement_approved'),
        (4, 'Construction & Installation', 'construction'),
        (5, 'Complete', 'complete')
),
stage_counts AS (
    SELECT 
        a.status,
        COUNT(*) as count
    FROM interconnection_application a
    GROUP BY a.status
),
total_count AS (
    SELECT COUNT(*) as total FROM interconnection_application
)
SELECT 
    s.column1 as stage_number,
    s.column2 as stage_name,
    COALESCE(sc.count, 0) as application_count,
    ROUND(COALESCE(sc.count, 0) * 100.0 / NULLIF(t.total, 0), 1) || '%' as percentage
FROM all_stages s
CROSS JOIN total_count t
LEFT JOIN stage_counts sc ON s.column3 = sc.status
ORDER BY s.column1;