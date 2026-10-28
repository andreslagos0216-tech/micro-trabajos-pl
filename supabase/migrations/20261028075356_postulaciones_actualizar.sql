create policy "Dueno de la oferta cambia estado" on public.applications for update to authenticated
  using (auth.uid() in (select author_id from public.job_posts where id = applications.job_id))
  with check (auth.uid() in (select author_id from public.job_posts where id = applications.job_id));

grant update on public.applications to authenticated;