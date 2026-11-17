
/* ACE7 — módulo adicional de formação de duplas
   Inclua <script src="organizador_duplas.js"></script> antes de </body> em organizador/index.html.
   Não substitui nem modifica autenticação, cadastro de torneios ou outros módulos.
*/
(() => {
  'use strict';
  const URL = 'https://xoazlhficbqpolkkxdmp.supabase.co';
  const KEY = 'sb_publishable_nRifD5UMD0v9OzYYVpzqKg_cYAKE4Z';
  const css = `
  #ace7DoublesModule{margin-top:18px}#ace7DoublesModule .ad-card{background:#fff;border:1px solid #dce5f0;border-radius:14px;padding:22px;box-shadow:0 8px 24px #0b27420b}
  #ace7DoublesModule h2{font-size:21px;color:#09264b;margin:0 0 6px}#ace7DoublesModule .muted{font-size:13px;color:#647084;line-height:1.5;margin:0 0 14px}
  #ace7DoublesModule label{display:block;font-weight:700;font-size:13px;margin:12px 0 6px}#ace7DoublesModule select,#ace7DoublesModule input{width:100%;padding:11px;border:1px solid #ccd3df;border-radius:8px;font-size:14px;background:#fff}
  #ace7DoublesModule .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#ace7DoublesModule button{border:0;border-radius:8px;padding:11px 15px;font-size:13px;font-weight:700;cursor:pointer;background:#0b1f3b;color:#fff;margin-top:14px}
  #ace7DoublesModule button:disabled{opacity:.55;cursor:wait}#ace7DoublesModule .alt{background:#e9edf3;color:#09264b}
  #ace7DoublesModule .msg{padding:10px 12px;border-radius:8px;margin:12px 0;font-size:13px;background:#edf3f8;color:#173453;overflow-wrap:anywhere}#ace7DoublesModule .error{background:#fff0ee;color:#9b2520}
  #ace7DoublesModule .pair{border:1px solid #e0e6ee;border-radius:10px;padding:12px;margin-top:9px;display:flex;justify-content:space-between;gap:10px;align-items:center}
  #ace7DoublesModule .pair strong{font-size:14px;color:#09264b}#ace7DoublesModule .pair small{display:block;color:#647084;margin-top:3px;font-size:12px}
  #ace7DoublesModule .empty{padding:18px;border:1px dashed #cbd5e1;border-radius:10px;color:#647084;text-align:center;font-size:13px}
  @media(max-width:650px){#ace7DoublesModule .ad-card{padding:16px}#ace7DoublesModule .grid{grid-template-columns:1fr}#ace7DoublesModule .pair{align-items:flex-start;flex-direction:column}}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  function boot(){
    const dashboard=document.getElementById('dashboard');
    if(!dashboard||!window.supabase){setTimeout(boot,400);return;}
    if(document.getElementById('ace7DoublesModule'))return;
    install(dashboard);
  }
  function install(dashboard){
    const root=document.createElement('section');root.id='ace7DoublesModule';
    root.innerHTML=`<div class="ad-card">
      <h2>Formação de duplas</h2><p class="muted">Selecione um torneio e uma categoria de duplas. Os atletas já cadastrados no torneio poderão ser combinados em pares.</p>
      <div class="grid"><div><label for="adTournament">Torneio</label><select id="adTournament"><option value="">Carregando…</option></select></div>
      <div><label for="adCategory">Categoria de duplas</label><select id="adCategory" disabled><option value="">Selecione um torneio</option></select></div></div>
      <div id="adMessage" class="msg">Carregando acesso do organizador…</div>
      <div class="grid"><div><label for="adAthlete1">Atleta 1</label><select id="adAthlete1" disabled><option value="">Selecione a categoria</option></select></div>
      <div><label for="adAthlete2">Atleta 2</label><select id="adAthlete2" disabled><option value="">Selecione a categoria</option></select></div></div>
      <label for="adPairName">Nome da dupla (opcional)</label><input id="adPairName" maxlength="100" placeholder="Ex.: Dupla A">
      <button id="adCreatePair" disabled>Formar dupla</button>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:22px"><strong style="font-size:15px;color:#09264b">Duplas formadas</strong><button id="adRefreshPairs" class="alt" style="margin:0">Atualizar</button></div>
      <div id="adPairs" style="margin-top:8px"><div class="empty">Selecione um torneio e uma categoria.</div></div></div>`;
    dashboard.appendChild(root);
    const $=id=>root.querySelector('#'+id);
    // Mesmo projeto e armazenamento de sessão do painel original.
    const db=window.supabase.createClient(URL,KEY);
    let tournamentId='',categoryId='',athletes=[];
    function say(t,err=false){$('adMessage').textContent=t;$('adMessage').classList.toggle('error',err);}
    function opt(v,t){const o=document.createElement('option');o.value=v;o.textContent=t;return o;}
    function fillAthletes(){
      ['adAthlete1','adAthlete2'].forEach(id=>{const s=$(id);s.replaceChildren(opt('','Selecione um atleta'));athletes.forEach(a=>s.appendChild(opt(a.athlete_id,a.athlete_name)));s.disabled=athletes.length<2;});
      $('adCreatePair').disabled=athletes.length<2||!categoryId;
    }
    async function loadTournaments(){
      const {data:sd,error:se}=await db.auth.getSession();if(se)throw se;
      const user=sd.session?.user;if(!user){$('adTournament').replaceChildren(opt('','Entre na sua conta'));say('Faça login no painel do organizador para continuar.',true);return;}
      const {data,error}=await db.from('ace7_tournaments').select('id,name,status').eq('organizer_id',user.id).order('created_at',{ascending:false});
      if(error)throw error;$('adTournament').replaceChildren(opt('','Selecione um torneio'));
      (data||[]).forEach(t=>$('adTournament').appendChild(opt(t.id,`${t.name} · ${t.status==='draft'?'Rascunho':t.status}`)));
      if(!data?.length)say('Nenhum torneio encontrado para esta conta.');
    }
    async function loadCategories(){
      categoryId='';athletes=[];fillAthletes();$('adCategory').disabled=true;$('adCategory').replaceChildren(opt('','Carregando categorias…'));
      if(!tournamentId)return;
      const {data,error}=await db.from('ace7_categories').select('id,name,format_code').eq('tournament_id',tournamentId).order('name');
      if(error)throw error;const doubles=(data||[]).filter(c=>c.format_code==='doubles');
      $('adCategory').replaceChildren(opt('',doubles.length?'Selecione a categoria':'Nenhuma categoria de duplas cadastrada'));
      doubles.forEach(c=>$('adCategory').appendChild(opt(c.id,c.name)));$('adCategory').disabled=!doubles.length;
      $('adPairs').innerHTML='<div class="empty">Selecione uma categoria de duplas.</div>';
      if(!doubles.length)say('Este torneio ainda não possui categoria de duplas. Nenhuma categoria foi criada ou modificada por este módulo.');
    }
    async function loadPairsAndAthletes(){
      categoryId=$('adCategory').value;athletes=[];fillAthletes();if(!categoryId)return;
      $('adPairs').innerHTML='<div class="empty">Carregando…</div>';
      const [{data:regs,error:re},{data:pairs,error:pe}]=await Promise.all([
        db.rpc('ace7_organizer_list_tournament_registrations',{p_tournament_id:tournamentId}),
        db.rpc('ace7_organizer_list_tournament_pairs',{p_tournament_id:tournamentId,p_category_id:categoryId})
      ]);
      if(re)throw re;if(pe)throw pe;
      const used=new Set();(pairs||[]).forEach(p=>{used.add(p.athlete1_id);used.add(p.athlete2_id);});
      const unique=new Map();(regs||[]).forEach(r=>{if(r.athlete_id&&!unique.has(r.athlete_id)&&!used.has(r.athlete_id))unique.set(r.athlete_id,{athlete_id:r.athlete_id,athlete_name:r.athlete_name});});
      athletes=[...unique.values()].sort((a,b)=>a.athlete_name.localeCompare(b.athlete_name,'pt-BR'));fillAthletes();renderPairs(pairs||[]);
      say(athletes.length>=2?`${athletes.length} atleta(s) disponível(is) para formar novas duplas.`:'Não há pelo menos dois atletas disponíveis. Atletas já utilizados em duplas ativas nesta categoria não aparecem novamente.');
    }
    function renderPairs(pairs){
      const box=$('adPairs');box.replaceChildren();if(!pairs.length){box.innerHTML='<div class="empty">Ainda não há duplas formadas nesta categoria.</div>';return;}
      pairs.forEach((p,i)=>{const item=document.createElement('div');item.className='pair';const info=document.createElement('div');const title=document.createElement('strong');title.textContent=p.pair_name||`Dupla ${i+1}`;const names=document.createElement('small');names.textContent=`${p.athlete1_name} + ${p.athlete2_name}`;info.append(title,names);const tag=document.createElement('span');tag.textContent='Dupla salva';tag.style.cssText='font-size:11px;color:#167447;background:#e9f8ef;padding:5px 8px;border-radius:20px';item.append(info,tag);box.appendChild(item);});
    }
    $('adTournament').addEventListener('change',async()=>{tournamentId=$('adTournament').value;try{await loadCategories();say('Torneio selecionado. Escolha uma categoria de duplas.');}catch(e){say(e.message||'Erro ao carregar categorias.',true);}});
    $('adCategory').addEventListener('change',async()=>{try{await loadPairsAndAthletes();}catch(e){say(e.message||'Erro ao carregar atletas e duplas.',true);}});
    $('adRefreshPairs').addEventListener('click',async()=>{try{await loadPairsAndAthletes();}catch(e){say(e.message||'Erro ao atualizar duplas.',true);}});
    $('adCreatePair').addEventListener('click',async()=>{
      const a1=$('adAthlete1').value,a2=$('adAthlete2').value;
      if(!tournamentId||!categoryId)return say('Selecione torneio e categoria.',true);
      if(!a1||!a2||a1===a2)return say('Escolha dois atletas diferentes.',true);
      const b=$('adCreatePair');b.disabled=true;b.textContent='Salvando dupla…';
      try{
        const {error}=await db.rpc('ace7_organizer_create_tournament_pair',{p_tournament_id:tournamentId,p_category_id:categoryId,p_athlete1_id:a1,p_athlete2_id:a2,p_pair_name:$('adPairName').value.trim()||null});
        if(error)throw error;$('adPairName').value='';await loadPairsAndAthletes();say('Dupla criada e salva com sucesso.');
      }catch(e){say(e.message||'Não foi possível formar a dupla.',true);}
      finally{b.textContent='Formar dupla';b.disabled=athletes.length<2||!categoryId;}
    });
    loadTournaments().then(()=>say('Selecione o torneio para carregar as categorias de duplas.')).catch(e=>say(e.message||'Falha ao iniciar módulo de duplas.',true));

    db.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          loadTournaments().then(() => {
            say('Login identificado. Selecione o torneio para carregar as categorias de duplas.');
          }).catch(e => say(e.message || 'Falha ao carregar torneios.', true));
        }, 0);
      }

      if (event === 'SIGNED_OUT') {
        tournamentId = '';
        categoryId = '';
        athletes = [];
        $('adTournament').replaceChildren(opt('', 'Entre na sua conta'));
        $('adCategory').replaceChildren(opt('', 'Faça login primeiro'));
        $('adCategory').disabled = true;
        fillAthletes();
        $('adPairs').innerHTML = '<div class="empty">Entre na conta do organizador.</div>';
        say('Faça login no painel do organizador para continuar.', true);
      }
    });
  }
  boot();
})();