alter table public.conversations
  add column if not exists is_system boolean not null default false;

alter table public.conversations alter column buyer_id drop not null;
alter table public.conversations drop constraint if exists conversations_not_self;
alter table public.conversations add constraint conversations_not_self
  check (is_system or owner_id <> buyer_id);

alter table public.messages
  add column if not exists is_system boolean not null default false;

alter table public.messages alter column sender_id drop not null;

create or replace function public.notify_favorites_on_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kind text;
  rec record;
  conv_id uuid;
  title_text text;
  status_text text;
begin
  if new.status = old.status then
    return new;
  end if;
  if new.status not in ('paused', 'closed', 'sold', 'rented') then
    return new;
  end if;

  kind := case TG_TABLE_NAME
    when 'sale_listings' then 'sale'
    when 'rental_listings' then 'rent'
    when 'job_posts' then 'job'
  end;

  title_text := new.title;
  status_text := new.status;

  for rec in
    select user_id from public.favorites
    where listing_kind = kind and listing_id = new.id and user_id <> new.author_id
  loop
    select id into conv_id from public.conversations
    where is_system = true and owner_id = rec.user_id
    limit 1;

    if conv_id is null then
      insert into public.conversations (listing_kind, listing_id, owner_id, buyer_id, is_system, owner_read_at)
      values (kind, new.id, rec.user_id, null, true, null)
      returning id into conv_id;
    end if;

    insert into public.messages (conversation_id, sender_id, body, original_lang, is_system)
    values (conv_id, null, title_text || ' → ' || status_text, 'es', true);

    update public.conversations
    set last_message_at = now(), owner_read_at = null
    where id = conv_id;
  end loop;

  return new;
end;
$$;

drop trigger if exists job_status_notify on public.job_posts;
create trigger job_status_notify after update of status on public.job_posts
  for each row execute function public.notify_favorites_on_status_change();

drop trigger if exists sale_status_notify on public.sale_listings;
create trigger sale_status_notify after update of status on public.sale_listings
  for each row execute function public.notify_favorites_on_status_change();

drop trigger if exists rent_status_notify on public.rental_listings;
create trigger rent_status_notify after update of status on public.rental_listings
  for each row execute function public.notify_favorites_on_status_change();