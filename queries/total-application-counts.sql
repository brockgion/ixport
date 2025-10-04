-- Different query examples for total IAs in IX portal

-- Get count of IAs
-- SELECT COUNT(*) as total_applications
-- FROM interconnection_application;

-- Get count of IAs with status
SELECT 
  status,
  COUNT(*) as count
FROM interconnection_application
GROUP BY status
ORDER BY count DESC;

-- Get count of IAs with status for all 5 stages
-- SELECT 
--   COUNT(*) as total,
--   COUNT(CASE WHEN status = 'complete' THEN 1 END) as completed,
--   COUNT(CASE WHEN status = 'construction' THEN 1 END) as in_construction,
--   COUNT(CASE WHEN status = 'agreement_approved' THEN 1 END) as approved,
--   COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
--   COUNT(CASE WHEN status = 'site_selection' THEN 1 END) as site_selection
-- FROM interconnection_application;