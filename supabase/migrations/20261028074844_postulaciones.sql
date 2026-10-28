alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('pending', 'accepted', 'rejected'));

create unique index if not exists applications_one_per_job
  on public.applications (job_id, applicant_id);