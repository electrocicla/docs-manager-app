-- Update existing UNDER_REVIEW documents back to PENDING status
UPDATE worker_documents 
SET status = 'PENDING', updated_at = datetime('now')
WHERE status = 'UNDER_REVIEW';
