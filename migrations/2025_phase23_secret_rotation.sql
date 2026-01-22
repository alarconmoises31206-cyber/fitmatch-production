-- migrations/2025_phase23_secret_rotation.sql

CREATE TABLE IF NOT EXISTS secret_rotation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  requested_by text,
  reason text,
  status text NOT NULL DEFAULT 'requested', -- requested | in_progress | completed | failed
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS secret_rotation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  rotated_by text,
  old_hash text,             -- hash of previous value for audit (no raw secret)
  new_hash text,
  method text,               -- "vault","github","manual"
  created_at timestamptz DEFAULT now()
);
