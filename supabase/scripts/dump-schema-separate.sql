-- Alternative: run ONE block at a time in Supabase SQL Editor (highlight + Run selected).
-- The editor only displays the result of the last query in a multi-statement run.

-- BLOCK 1: Tables + RLS flags
select
  c.relname as table_name,
  pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- BLOCK 2: Columns
select *
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- BLOCK 3: Constraints (full definitions, including CHECK bodies)
select
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and con.contype in ('p', 'u', 'f', 'c')
order by c.relname, con.conname;

-- BLOCK 4: Indexes
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

-- BLOCK 5: RLS policies
select *
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
