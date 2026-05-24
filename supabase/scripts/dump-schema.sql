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

  -- Constraints (PK, UNIQUE, FK, CHECK)
  select
    30,
    'constraint',
    tc.table_name::text,
    tc.constraint_name::text,
    tc.constraint_type::text
      || ' [' || string_agg(kcu.column_name, ', ' order by kcu.ordinal_position) || ']'
      || coalesce(
        ' -> ' || ccu.table_name::text || '('
          || string_agg(ccu.column_name::text, ', ' order by kcu.ordinal_position) || ')',
        ''
      )
      || coalesce(' check: ' || chk.check_clause, '')
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
  group by
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    ccu.table_name,
    chk.check_clause

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
