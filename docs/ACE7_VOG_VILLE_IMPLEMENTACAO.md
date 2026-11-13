# ACE7 — Integração do Torneio Vog Ville

**Entrega inicial — branch `feat/vog-ville-tournament-module`**

## Objetivo

O ACE7 será a plataforma definitiva. O Vog Ville entra como organizador/torneio dentro do ACE7; não será mantido como segundo produto. A integração deve reaproveitar os cadastros centrais de atletas, modalidades, categorias, torneios e partidas.

## Estado confirmado no código e nos artefatos disponíveis

- Repositório: `FabioAelo/ace7`, branch principal `main`.
- O painel atual do organizador autentica pelo Supabase e cria/lista registros em `ace7_tournaments`.
- O cadastro atual do torneio contém nome, datas, local, taxa de inscrição, comissão e status. Ainda não oferece as operações de competição do Vog Ville.
- Há um protótipo de página do 2º Open de Tênis Vogue Ville, mas o próprio arquivo declara que é demonstração visual e **não consulta nem grava dados no Supabase**.
- O snapshot do banco disponível mostra `ace7_tournaments`, `ace7_registrations`, `ace7_tournament_collaborators`, `ace7_athletes`, `ace7_categories` e estrutura MATCH. O snapshot é de 10/11/2026 e não substitui a leitura do schema atual.
- A proposta de acesso privado/inscrição fechada existe como rascunho de migração, não como implantação confirmada.
- A especificação MATCH prevê vínculo opcional de partidas a `tournament_id` e `category_id`; é necessário confirmar o estado real dessas tabelas e suas policies antes de integrar.

## Escopo funcional do primeiro torneio

1. Organizador Vog Ville, com torneio privado e inscrição fechada por convite/autorização.
2. Categorias e formatos (simples/duplas) vinculados ao torneio.
3. Seleção de atletas existentes no cadastro central ACE7; não duplicar pessoas.
4. Convites e inscrições com estados claros (convidado, pendente, aceito, recusado, confirmado).
5. Geração e gestão de chaves/confrontos.
6. Programação por data, horário e quadra.
7. Lançamento de placar por set, validação conforme regulamento da categoria e histórico de correções.
8. Resultados oficiais, avanço na chave e classificação.
9. Página pública/privada que respeite a visibilidade e as permissões do torneio.
10. Equipe do organizador com permissões específicas, sem confundir colaborador com atleta convidado.

## Regras de integridade que não serão sacrificadas

- Um atleta ACE7 mantém um único perfil reutilizável.
- CPF e outros dados privados nunca aparecem na página pública.
- Ser convidado para um torneio não concede permissão administrativa.
- Torneio privado não fica acessível apenas por conhecer o link.
- Resultados confirmados não são sobrescritos silenciosamente; correções precisam de trilha auditável.
- Não usar `service_role` no navegador.
- Não copiar fórmulas antigas da planilha sem testes; gerar agenda e classificação a partir dos registros de partidas.
- Elo permanece separado do resultado oficial do torneio; partidas de torneio não entram automaticamente em ratings sem regra explícita.

## Primeiro bloqueio técnico a resolver

Antes de escrever uma migração de competição, precisamos comparar o banco vivo com o snapshot. O arquivo `supabase/diagnostico_vog_ville.sql` foi incluído nesta branch para fazer essa leitura. Ele é somente SELECT: não altera schema nem dados.

## Sequência de implementação

- **Fase 1 — Base e acesso:** validar schema/RLS; completar visibilidade privada, lista de acesso e convites; ligar o torneio ao organizador Vog Ville.
- **Fase 2 — Competição:** categorias, inscrições, equipes, chaves e partidas.
- **Fase 3 — Operação:** agenda/quadras, placar por set, validação, confirmação e auditoria.
- **Fase 4 — Experiência:** página do torneio e painel do organizador dentro do ACE7, responsivos.
- **Fase 5 — Migração operacional:** importar dados históricos selecionados do Vog Ville após conciliação; desligar o site independente somente depois de homologação.

## Critério de aceite do primeiro marco

Um organizador Vog Ville consegue entrar no ACE7, abrir o seu torneio privado, selecionar atletas já cadastrados, organizar uma partida e consultar o placar oficial — tudo no mesmo sistema e protegido pelas policies do banco.

## Segurança / implantação

Esta entrega é uma base de implementação em branch isolada. Nenhuma alteração foi aplicada ao banco Supabase de produção e nada foi publicado no site ao vivo. O diagnóstico precisa ser executado e revisado antes de gerar/rodar migrações.
