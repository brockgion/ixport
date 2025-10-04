SELECT 
    stages.stage_number,
    stages.stage_name,
    COALESCE(TO_CHAR(stages.stage_date, 'MM/DD/YYYY'), '-') as date_completed
FROM interconnection_application a
CROSS JOIN LATERAL (
    VALUES 
        (1, 'Site Selection', a.created_at),
        (2, 'Application Submitted', a.submitted_at),
        (3, 'Agreement Approved', a.agreement_approved_at),
        (4, 'Construction & Installation', a.construction_started_at),
        (5, 'Complete', a.completed_at)
) AS stages(stage_number, stage_name, stage_date)
WHERE a.ix_application_id::text LIKE 'APPLICATION_ID_STRING_GOES_HERE%'
ORDER BY stages.stage_number;