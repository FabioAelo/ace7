-- ACE7 | Diagnóstico de integração do Torneio Vog Ville
-- READ ONLY: execute no SQL Editor do projeto Supabase ACE7.
-- Não cria, altera ou apaga tabelas/dados. Não retorna credenciais.

-- 1) Estrutura real das tabelas relevantes
SELECT c.table_name, c.ordinal_position, c.column_name, c.data_type,
       c.udt_name, c.is_nullable, c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (c.table_name LIKE 'ace7_%tournament%'
       OR c.table_name IN ('ace7_matches','ace7_match_participants',
                           'ace7_match_score_sets','ace7_categories',
                           'ace7_athletes','ace7_sports','ace7_registrations'))
ORDER BY c.table_name, c.ordinal_position;

-- 2) Relacionamentos e regras de integridade
SELECT conrelid::regclass AS table_name, conname, contype,
       pg_get_constraintdef(oid, true) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid::regclass::text IN (
    'ace7_tournaments','ace7_tournament_access',
    'ace7_tournament_collaborators','ace7_registrations',
    'ace7_categories','ace7_matches','ace7_match_participants',
    'ace7_match_score_sets'
  )
ORDER BY 1, 2;

-- 3) RLS e policies efetivamente instaladas
SELECT t.tablename, t.rowsecurity, t.forcerowsecurity,
       p.policyname, p.permissive, p.roles, p.cmd,
       p.qual, p.with_check
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND (t.tablename LIKE 'ace7_%tournament%'
       OR t.tablename IN ('ace7_matches','ace7_match_participants',
                          'ace7_match_score_sets','ace7_categories',
                          'ace7_registrations'))
ORDER BY t.tablename, p.policyname;

-- 4) Índices/uniqueness (evita duplicar inscrição ou confronto)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (tablename LIKE 'ace7_%tournament%'
       OR tablename IN ('ace7_matches','ace7_match_participants',
                        'ace7_match_score_sets','ace7_categories',
                        'ace7_registrations'))
ORDER BY tablename, indexname;

-- 5) Torneios já cadastrados (sem dados pessoais de atletas)
SELECT id, organizer_id, name, sport_code, start_date, end_date,
       location, status, created_at
FROM public.ace7_tournaments
ORDER BY created_at DESC
LIMIT 100;
