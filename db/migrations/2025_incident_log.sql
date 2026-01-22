create table if not exists incident_log (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  status text not null check (status in ('CRITICAL', 'DEGRADED', 'RESOLVED')),
  service text,
  message text,
  metadata jsonb,
  acknowledged boolean default false,
  acknowledged_by text,
  acknowledged_at timestamptz
);

-- Optional: Index for performance on common filters
create index idx_incident_log_timestamp on incident_log (timestamp desc);
create index idx_incident_log_status on incident_log (status);
create index idx_incident_log_service on incident_log (service);
