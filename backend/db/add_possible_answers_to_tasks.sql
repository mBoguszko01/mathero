ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS possible_answers jsonb;

