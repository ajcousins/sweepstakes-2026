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

-- BLOCK 3: Constraints
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' order by kcu.ordinal_position) as columns,
  ccu.table_name as references_table,
  chk.check_clause
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_schema = kcu.constraint_schema
  and tc.constraint_name = kcu.constraint_name
left join information_schema.constraint_column_usage ccu
  on tc.constraint_schema = ccu.constraint_schema
  and tc.constraint_name = ccu.constraint_name
  and tc.constraint_type = 'FOREIGN KEY'
left join information_schema.check_constraints chk
  on tc.constraint_schema = chk.constraint_schema
  and tc.constraint_name = chk.constraint_name
where tc.table_schema = 'public'
  and tc.constraint_type in ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY', 'CHECK')
group by tc.table_name, tc.constraint_name, tc.constraint_type, ccu.table_name, chk.check_clause
order by tc.table_name, tc.constraint_type;

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
