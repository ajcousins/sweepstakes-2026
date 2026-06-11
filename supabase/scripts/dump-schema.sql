-- Supabase SQL Editor only shows the LAST select in a multi-query file.
-- This script returns ONE result table. Run the whole file, then copy all rows.
--
-- Columns:
--   section   - table | column | constraint | index | rls_table | rls_policy | trigger
--   table_name
--   object_name
--   definition

select * from (
  -- Tables
  select
    10 as sort,
    'table' as section,
    c.relname::text as table_name,
    null::text as object_name,
    'size=' || pg_size_pretty(pg_total_relation_size(c.oid))
      || ', rls=' || c.relrowsecurity::text as definition
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'

  union all

  -- Columns
  select
    20,
    'column',
    c.table_name::text,
    c.column_name::text,
    concat(
      c.data_type,
      coalesce('(' || c.character_maximum_length::text || ')', ''),
      ', pos=', c.ordinal_position,
      ', nullable=', c.is_nullable,
      ', default=', coalesce(c.column_default, 'null'),
      ', generated=', coalesce(c.is_generated, 'NEVER'),
      case when c.generation_expression is not null
        then ', expr=' || c.generation_expression
        else ''
      end
    )
  from information_schema.columns c
  where c.table_schema = 'public'

  union all

  -- Constraints (PK, UNIQUE, FK, CHECK) — pg_get_constraintdef includes full CHECK bodies
  select
    30,
    'constraint',
    c.relname::text,
    con.conname::text,
    pg_get_constraintdef(con.oid)
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and con.contype in ('p', 'u', 'f', 'c')

  union all

  -- Indexes
  select
    40,
    'index',
    tablename::text,
    indexname::text,
    indexdef::text
  from pg_indexes
  where schemaname = 'public'

  union all

  -- RLS policies (if none, this section will be empty)
  select
    50,
    'rls_policy',
    tablename::text,
    policyname::text,
  concat(
    'cmd=', cmd,
    ', permissive=', permissive,
    ', roles=', coalesce(roles::text, ''),
    ', using=', coalesce(qual::text, ''),
    ', with_check=', coalesce(with_check::text, '')
  )
  from pg_policies
  where schemaname = 'public'

  union all

  -- Triggers
  select
    60,
    'trigger',
    event_object_table::text,
    trigger_name::text,
    concat(action_timing, ' ', event_manipulation, ': ', action_statement)
  from information_schema.triggers
  where trigger_schema = 'public'
) dump
order by sort, table_name, object_name nulls first, definition;
