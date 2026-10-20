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
  status_es text;
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

  status_es := case new.status
    when 'paused' then 'Pausado'
    when 'closed' then 'Cerrado'
    when 'sold' then 'Vendido'
    when 'rented' then 'Alquilado'
  end;

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
    values (conv_id, null, new.title || ' → ' || status_es, 'es', true);

    update public.conversations
    set last_message_at = now(), owner_read_at = null
    where id = conv_id;
  end loop;

  return new;
end;
$$;