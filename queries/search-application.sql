-- Search by the short application number
SELECT * 
FROM interconnection_application 
WHERE ix_application_id::text LIKE 'APPLICATION_ID_STRING_GOES_HERE%';