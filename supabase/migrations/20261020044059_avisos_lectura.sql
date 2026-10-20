drop policy if exists "Participantes ven mensajes" on public.messages;

create policy "Participantes ven mensajes" on public.messages for select to authenticated
  using (
    is_system = true and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.owner_id = auth.uid() and c.is_system = true
    )
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and (c.owner_id = auth.uid() or c.buyer_id = auth.uid())
    )
  );