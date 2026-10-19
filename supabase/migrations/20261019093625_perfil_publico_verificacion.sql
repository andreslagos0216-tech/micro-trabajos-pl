alter table public.profiles
  add column if not exists show_phone boolean not null default false;

grant update (show_phone) on public.profiles to authenticated;

update public.profiles p
set is_verified = true
from auth.users u
where u.id = p.id and u.email_confirmed_at is not null;

create or replace function public.sync_profile_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null then
    update public.profiles set is_verified = true where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.sync_profile_verified();