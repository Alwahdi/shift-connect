-- Add proposal_deadline column to shifts table for controlling how long shifts accept applications
ALTER TABLE shifts
ADD COLUMN proposal_deadline timestamp with time zone DEFAULT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN shifts.proposal_deadline IS 'The deadline for accepting proposals. After this time, the shift will no longer accept new applications.';

-- Create an index for efficient querying of active shifts
CREATE INDEX idx_shifts_proposal_deadline ON shifts (proposal_deadline) WHERE proposal_deadline IS NOT NULL;