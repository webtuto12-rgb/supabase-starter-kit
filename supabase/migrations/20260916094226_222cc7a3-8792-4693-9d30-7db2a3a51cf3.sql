revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;