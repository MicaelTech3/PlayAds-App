import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

const IcoPlay   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>;
const IcoClock  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoPlus   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoCheck  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoRepeat = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const IcoChevR  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>;
const IcoMusic  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;

const DIAS_FULL = { dom:"Dom", seg:"Seg", ter:"Ter", qua:"Qua", qui:"Qui", sex:"Sex", sab:"Sáb" };
const labelSt = { fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--muted)", marginBottom:7 };
const inputSt = { width:"100%", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:12, outline:"none", colorScheme:"dark" };

// ── Modal mídia ───────────────────────────────────────────────────────────────
function MediaModal({ item, onClose, onPlay }) {
  const [loops,    setLoops]    = useState(1);
  const [picking,  setPicking]  = useState(false);

  const horarios = Array.isArray(item.horarios) && item.horarios.length > 0
    ? item.horarios : item.horario ? [item.horario] : [];
  const dias   = item.dias || [];
  const allDias = dias.length === 0 || dias.length === 7;
  const isYT   = (item.url || "").includes("youtu");

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:400 }}>
        <div className="modal-header">
          <div style={{ width:38,height:38,borderRadius:10,background:isYT?"rgba(244,63,94,.15)":"rgba(155,89,245,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <IcoMusic />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.nome}</div>
            <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)",marginTop:2 }}>
              {isYT?"YouTube":(item.tipo||"MP3").toUpperCase()}
              {item.tamanho ? ` · ${(item.tamanho/1048576).toFixed(1)} MB` : ""}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16,flexShrink:0 }}>✕</button>
        </div>

        <div className="modal-body" style={{ display:"flex",flexDirection:"column",gap:16 }}>
          {/* Horários */}
          <div>
            <div style={labelSt}>Horários Agendados</div>
            {horarios.length === 0 ? (
              <div style={{ color:"var(--muted)",fontSize:12,fontFamily:"var(--font-mono)",padding:"10px 12px",background:"var(--surface3)",borderRadius:8 }}>Sem horário agendado</div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {horarios.map((h,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"var(--surface3)",borderRadius:8,border:"1px solid var(--border)" }}>
                    <span style={{ fontFamily:"var(--font-mono)",fontSize:15,fontWeight:700,color:"var(--p1)",minWidth:48 }}>{h}</span>
                    <div style={{ flex:1 }}>
                      {allDias
                        ? <span style={{ fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)" }}>Todos os dias</span>
                        : <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
                            {["dom","seg","ter","qua","qui","sex","sab"].map(d => (
                              <span key={d} style={{ fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:5,fontFamily:"var(--font-mono)",background:dias.includes(d)?"rgba(155,89,245,.18)":"var(--surface4)",color:dias.includes(d)?"var(--p1)":"var(--muted)",border:`1px solid ${dias.includes(d)?"rgba(155,89,245,.3)":"var(--border)"}` }}>
                                {DIAS_FULL[d]}
                              </span>
                            ))}
                          </div>
                      }
                    </div>
                    {item.loops > 1 && (
                      <span style={{ display:"flex",alignItems:"center",gap:3,fontSize:9,color:"var(--cyan)",fontFamily:"var(--font-mono)",background:"rgba(34,211,238,.08)",border:"1px solid rgba(34,211,238,.2)",borderRadius:99,padding:"2px 7px" }}>
                        <IcoRepeat /> {item.loops}×
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Botão tocar → expande loops */}
          {!picking ? (
            <div style={{ display:"flex",gap:8 }}>
              <button className="btn btn-primary" style={{ flex:1,justifyContent:"center" }} onClick={() => setPicking(true)}>
                <IcoPlay /> Tocar Agora
              </button>
              <button onClick={onClose} className="btn btn-ghost">Fechar</button>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <div style={labelSt}>Quantas vezes repetir?</div>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div className="loops-control">
                  <button className="loops-btn" onClick={() => setLoops(l => Math.max(1,l-1))}>−</button>
                  <div className="loops-val">{loops}</div>
                  <button className="loops-btn" onClick={() => setLoops(l => Math.min(99,l+1))}>+</button>
                </div>
                <span style={{ color:"var(--muted)",fontSize:12 }}>{loops===1?"vez":"vezes"}</span>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width:"100%",justifyContent:"center" }} onClick={() => { onPlay(item, loops); onClose(); }}>
                <IcoPlay /> Confirmar e Tocar
              </button>
              <button onClick={() => setPicking(false)} style={{ width:"100%",padding:"8px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,cursor:"pointer",color:"var(--muted)",fontSize:12 }}>
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal agendamento ─────────────────────────────────────────────────────────
function ScheduleModal({ schedule, playlists, onClose, onSave }) {
  const isEdit = !!schedule?.id;
  const [form, setForm] = useState({
    playlist_id:   schedule?.playlist_id   || (playlists[0]?.id || ""),
    playlist_nome: schedule?.playlist_nome || (playlists[0]?.nome || ""),
    horario:       schedule?.horario       || "08:00",
    loops:         schedule?.loops         || 1,
    dias:          schedule?.dias          || ["seg","ter","qua","qui","sex"],
    ativo:         schedule?.ativo         !== false,
    label:         schedule?.label         || "",
  });

  const DIAS = [{k:"dom",l:"D"},{k:"seg",l:"S"},{k:"ter",l:"T"},{k:"qua",l:"Q"},{k:"qui",l:"Q"},{k:"sex",l:"S"},{k:"sab",l:"S"}];
  const toggleDia = k => setForm(f => ({ ...f, dias: f.dias.includes(k) ? f.dias.filter(d=>d!==k) : [...f.dias,k] }));
  const selectPl  = id => { const pl=playlists.find(p=>p.id===id); setForm(f=>({...f,playlist_id:id,playlist_nome:pl?.nome||""})); };
  const canSave   = form.playlist_id && form.horario && form.dias.length > 0;
  const save      = () => { if (!canSave) return; onSave({...form, id:schedule?.id||Date.now().toString()}); onClose(); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:460 }}>
        <div className="modal-header">
          <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,var(--p4),var(--p2))",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><IcoClock /></div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:14 }}>{isEdit?"Editar Agendamento":"Novo Agendamento"}</div>
            <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)",marginTop:2 }}>Define quando uma playlist será tocada automaticamente</div>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16 }}>✕</button>
        </div>
        <div className="modal-body" style={{ display:"flex",flexDirection:"column",gap:18 }}>
          <div>
            <div style={labelSt}>Nome / Descrição <span style={{color:"var(--muted)"}}>(opcional)</span></div>
            <input style={inputSt} placeholder="Ex: Abertura da manhã..." value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} />
          </div>
          <div>
            <div style={labelSt}>Playlist</div>
            {playlists.length===0 ? (
              <div style={{ color:"var(--warn)",fontSize:12,fontFamily:"var(--font-mono)" }}>Nenhuma playlist disponível.</div>
            ) : (
              <select style={inputSt} value={form.playlist_id} onChange={e=>selectPl(e.target.value)}>
                {playlists.map(p => <option key={p.id} value={p.id}>{p.nome} ({(p.itens||[]).length} faixas)</option>)}
              </select>
            )}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <div style={labelSt}>Horário</div>
              <input type="time" style={{ ...inputSt,fontFamily:"var(--font-mono)",fontSize:18,fontWeight:700,color:"var(--p1)",letterSpacing:2,textAlign:"center",padding:"10px 12px" }} value={form.horario} onChange={e=>setForm(f=>({...f,horario:e.target.value}))} />
            </div>
            <div>
              <div style={labelSt}>Repetições</div>
              <div className="loops-control" style={{ width:"100%" }}>
                <button className="loops-btn" onClick={()=>setForm(f=>({...f,loops:Math.max(1,f.loops-1)}))}>−</button>
                <div className="loops-val" style={{ flex:1 }}>{form.loops}</div>
                <button className="loops-btn" onClick={()=>setForm(f=>({...f,loops:Math.min(99,f.loops+1)}))}>+</button>
              </div>
            </div>
          </div>
          <div>
            <div style={{ ...labelSt,marginBottom:10 }}>Dias da Semana</div>
            <div style={{ display:"flex",gap:7 }}>
              {DIAS.map(({k,l}) => {
                const active = form.dias.includes(k);
                return <button key={k} title={DIAS_FULL[k]} onClick={()=>toggleDia(k)} style={{ width:36,height:36,borderRadius:"50%",border:`2px solid ${active?"var(--p2)":"var(--border)"}`,background:active?"var(--p2)":"var(--surface3)",color:active?"white":"var(--muted)",cursor:"pointer",fontWeight:700,fontSize:11,transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center" }}>{l}</button>;
              })}
              <button onClick={()=>setForm(f=>({...f,dias:f.dias.length===7?[]:["dom","seg","ter","qua","qui","sex","sab"]}))} style={{ marginLeft:"auto",padding:"0 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--surface3)",color:"var(--muted2)",cursor:"pointer",fontSize:10,fontFamily:"var(--font-mono)" }}>
                {form.dias.length===7?"nenhum":"todos"}
              </button>
            </div>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button className="btn btn-primary" style={{ flex:1,justifyContent:"center",opacity:canSave?1:0.4 }} onClick={save}>
              <IcoCheck /> {isEdit?"Salvar":"Criar Agendamento"}
            </button>
            <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Schedule row ──────────────────────────────────────────────────────────────
function ScheduleRow({ sched, onEdit, onDelete, onToggle, isNext, playlists }) {
  const allDays    = sched.dias?.length === 7;
  const isWeekdays = ["seg","ter","qua","qui","sex"].every(d=>sched.dias?.includes(d)) && !["dom","sab"].some(d=>sched.dias?.includes(d));
  const diasLabel  = allDays?"Todos os dias":isWeekdays?"Seg – Sex":(sched.dias||[]).map(d=>DIAS_FULL[d]).join(", ");
  const pl         = playlists.find(p => p.id === sched.playlist_id);
  return (
    <div style={{ display:"grid",gridTemplateColumns:"80px 1fr auto 90px 80px",alignItems:"center",gap:12,padding:"0 18px",height:58,borderBottom:"1px solid var(--border)",background:!sched.ativo?"rgba(0,0,0,0.2)":isNext?"rgba(139,92,246,0.05)":"transparent",opacity:sched.ativo?1:0.55 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        {isNext && <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--green)",flexShrink:0 }} />}
        <span style={{ fontFamily:"var(--font-mono)",fontSize:16,fontWeight:700,color:isNext?"var(--green)":"var(--text)",letterSpacing:1 }}>{sched.horario}</span>
      </div>
      <div style={{ overflow:"hidden" }}>
        <div style={{ fontSize:12,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{sched.label||pl?.nome||sched.playlist_nome||"—"}</div>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
          {sched.label && <span style={{ fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{pl?.nome||sched.playlist_nome}</span>}
          <span style={{ fontSize:9,color:"var(--muted)",fontFamily:"var(--font-mono)" }}>{diasLabel}</span>
          {sched.loops>1 && <span style={{ display:"flex",alignItems:"center",gap:3,fontSize:9,color:"var(--cyan)",fontFamily:"var(--font-mono)",background:"rgba(34,211,238,0.08)",border:"1px solid rgba(34,211,238,0.2)",borderRadius:99,padding:"1px 6px" }}><IcoRepeat /> {sched.loops}×</span>}
        </div>
      </div>
      <div style={{ width:50 }}>
        {isNext && <span style={{ fontSize:9,padding:"2px 8px",background:"rgba(52,211,153,0.1)",color:"var(--green)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:99,fontFamily:"var(--font-mono)",whiteSpace:"nowrap" }}>próximo</span>}
      </div>
      <div style={{ display:"flex",justifyContent:"center" }}>
        <button onClick={()=>onToggle(sched.id)} style={{ width:38,height:20,borderRadius:99,border:"none",cursor:"pointer",background:sched.ativo?"var(--p2)":"var(--surface4)",position:"relative",transition:"background 0.2s" }}>
          <span style={{ position:"absolute",top:2,left:sched.ativo?"calc(100% - 18px)":2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s" }} />
        </button>
      </div>
      <div style={{ display:"flex",gap:5,justifyContent:"flex-end" }}>
        <button className="btn btn-ghost btn-sm" style={{ padding:"5px 8px" }} onClick={()=>onEdit(sched)}><IcoEdit /></button>
        <button className="btn btn-sm" style={{ padding:"5px 8px",background:"rgba(244,63,94,0.08)",border:"1px solid rgba(244,63,94,0.2)",color:"var(--danger)" }} onClick={()=>onDelete(sched.id)}><IcoTrash /></button>
      </div>
    </div>
  );
}

// ── Page principal ────────────────────────────────────────────────────────────
export default function PlaylistsPage() {
  const { state, call, setPage } = useApp();
  const { playlists, currentPlaylist: nowPlaying, schedules: stateSchedules } = state;

  const [tab,           setTab]           = useState("playlists");
  const [selectedPl,    setSelectedPl]    = useState(null);
  const [mediaModal,    setMediaModal]    = useState(null);
  const [schedModal,    setSchedModal]    = useState(null);
  const [schedules,     setSchedules]     = useState(stateSchedules || []);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const plEntries = Object.entries(playlists || {})
    .filter(([,pl]) => pl && typeof pl === "object" && !pl.temp)
    .sort(([,a],[,b]) => (a.nome||"").localeCompare(b.nome||""));
  const plList = plEntries.map(([id,pl]) => ({ id, ...pl }));

  const selectedData  = selectedPl ? playlists[selectedPl] : null;
  const selectedItens = selectedData?.itens || [];

  const nowStr   = new Date().toTimeString().slice(0,5);
  const todayKey = ["dom","seg","ter","qua","qui","sex","sab"][new Date().getDay()];
  const nextSched = useMemo(() => {
    const active = schedules.filter(s => s.ativo && (s.dias||[]).includes(todayKey));
    return active.filter(s => s.horario > nowStr).sort((a,b) => a.horario.localeCompare(b.horario))[0] || null;
  }, [schedules, nowStr, todayKey]);

  const handlePlayItem = (item, loops) => {
    call("play_item_now", { nome:item.nome, url:item.url||"", path:item.path||"", tipo:item.tipo||"url", loops });
    setPage("Player");
  };

  const saveSchedule   = sched => setSchedules(prev => { const idx=prev.findIndex(s=>s.id===sched.id); const next=idx>=0?prev.map((s,i)=>i===idx?sched:s):[...prev,sched]; call("save_schedules",next); return next; });
  const deleteSchedule = id    => { setSchedules(prev => { const next=prev.filter(s=>s.id!==id); call("save_schedules",next); return next; }); setDeleteConfirm(null); };
  const toggleSchedule = id    => setSchedules(prev => { const next=prev.map(s=>s.id===id?{...s,ativo:!s.ativo}:s); call("save_schedules",next); return next; });

  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1,overflow:"hidden" }}>

      {/* Header */}
      <div className="page-header">
        <div className="page-header-accent" style={{ background:"var(--warn)" }} />
        <span className="page-title">Playlists</span>
        <div style={{ display:"flex",gap:3,marginLeft:16 }}>
          {[{id:"playlists",label:"♫  Playlists"},{id:"schedules",label:"⏰  Agendamentos"}].map(t => (
            <button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)} style={{ fontSize:11 }}>{t.label}</button>
          ))}
        </div>
        <div className="page-header-right">
          {tab==="schedules" && <button className="btn btn-primary btn-sm" onClick={()=>setSchedModal({})}><IcoPlus /> Novo</button>}
          {tab==="playlists" && <span style={{ fontFamily:"var(--font-mono)",fontSize:10,color:"var(--muted)" }}>{plEntries.length} playlist{plEntries.length!==1?"s":""}</span>}
        </div>
      </div>

      {/* ── TAB: PLAYLISTS — 2 colunas ── */}
      {tab === "playlists" && (
        <div style={{ flex:1,display:"flex",overflow:"hidden" }}>

          {/* Esquerda: lista de playlists */}
          <div style={{ width:240,minWidth:240,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden" }}>
            <div style={{ padding:"8px 12px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)" }}>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--muted)" }}>
                {plEntries.length} playlist{plEntries.length!==1?"s":""}
              </span>
            </div>
            <div style={{ overflow:"auto",flex:1 }}>
              {plEntries.length === 0 ? (
                <div style={{ padding:"24px 16px",textAlign:"center",color:"var(--muted)",fontSize:12 }}>
                  Nenhuma playlist.<br/>
                  <span style={{ fontSize:10,fontFamily:"var(--font-mono)" }}>Crie no painel web.</span>
                </div>
              ) : plEntries.map(([id,pl]) => {
                const isPlaying  = pl.nome === nowPlaying;
                const isSelected = selectedPl === id;
                return (
                  <div
                    key={id}
                    onClick={() => setSelectedPl(isSelected ? null : id)}
                    style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 12px",cursor:"pointer",background:isSelected?"var(--surface3)":isPlaying?"rgba(139,92,246,0.06)":"transparent",borderLeft:isSelected?"3px solid var(--p2)":isPlaying?"3px solid rgba(139,92,246,0.4)":"3px solid transparent",borderBottom:"1px solid var(--border)",transition:"background 0.12s" }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background="var(--surface2)"; }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background=isPlaying?"rgba(139,92,246,0.06)":"transparent"; }}
                  >
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:isSelected?700:600,color:isSelected?"var(--text)":"var(--text2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5 }}>
                        {isPlaying && <span style={{ color:"var(--p1)",fontSize:10 }}>▶</span>}
                        {pl.nome||"—"}
                      </div>
                      <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)",marginTop:2 }}>
                        {(pl.itens||[]).length} faixa{(pl.itens||[]).length!==1?"s":""} · {pl.ativa!==false?"Ativa":"Inativa"}
                      </div>
                    </div>
                    <span style={{ color:"var(--muted)",opacity:0.4,flexShrink:0 }}><IcoChevR /></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direita: mídias */}
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
            {!selectedPl ? (
              <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,color:"var(--muted)" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity:0.25 }}>
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <span style={{ fontSize:13 }}>Selecione uma playlist</span>
                <span style={{ fontSize:10,fontFamily:"var(--font-mono)",opacity:0.6 }}>para ver as mídias</span>
              </div>
            ) : (
              <>
                <div style={{ padding:"11px 14px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface2)" }}>
                  <div style={{ fontSize:14,fontWeight:700,color:"var(--text)" }}>{selectedData?.nome||"—"}</div>
                  <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)",marginTop:2 }}>
                    {selectedItens.length} faixa{selectedItens.length!==1?"s":""} · {selectedData?.ativa!==false?"Ativa":"Inativa"}
                  </div>
                </div>
                <div style={{ overflow:"auto",flex:1 }}>
                  {selectedItens.length === 0 ? (
                    <div style={{ padding:"32px",textAlign:"center",color:"var(--muted)",fontSize:12 }}>
                      Playlist vazia.<br/><span style={{ fontSize:10,fontFamily:"var(--font-mono)" }}>Adicione mídias no painel web.</span>
                    </div>
                  ) : selectedItens.map((item, idx) => {
                    const isYT    = (item.url||"").includes("youtu");
                    const horarios = Array.isArray(item.horarios)&&item.horarios.length>0 ? item.horarios : item.horario ? [item.horario] : [];
                    return (
                      <div
                        key={idx}
                        onClick={() => setMediaModal(item)}
                        style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer",transition:"background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background="var(--surface2)"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}
                      >
                        <span style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)",width:20,textAlign:"right",flexShrink:0 }}>{idx+1}</span>
                        <div style={{ width:30,height:30,borderRadius:7,background:isYT?"rgba(244,63,94,.1)":"rgba(155,89,245,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <IcoMusic />
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.nome||"—"}</div>
                          <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap" }}>
                            {horarios.length > 0 ? horarios.map((h,i) => (
                              <span key={i} style={{ display:"flex",alignItems:"center",gap:3,fontSize:9,color:"var(--warn)",fontFamily:"var(--font-mono)",background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",borderRadius:99,padding:"1px 6px" }}>
                                <IcoClock /> {h}
                              </span>
                            )) : <span style={{ fontSize:9,color:"var(--muted)",fontFamily:"var(--font-mono)" }}>sem horário</span>}
                            {item.loops>1 && <span style={{ display:"flex",alignItems:"center",gap:3,fontSize:9,color:"var(--cyan)",fontFamily:"var(--font-mono)",background:"rgba(34,211,238,.08)",border:"1px solid rgba(34,211,238,.2)",borderRadius:99,padding:"1px 6px" }}><IcoRepeat /> {item.loops}×</span>}
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();setMediaModal(item);}} style={{ flexShrink:0 }}>
                          <IcoPlay />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: AGENDAMENTOS ── */}
      {tab === "schedules" && (
        <div style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column" }}>
          {nextSched && (
            <div style={{ margin:"10px 16px 0",padding:"10px 16px",background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
              <span style={{ fontSize:20,lineHeight:1 }}>⏰</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11,color:"var(--green)",fontFamily:"var(--font-mono)",letterSpacing:1 }}>PRÓXIMO HOJE</div>
                <div style={{ fontSize:13,fontWeight:700,color:"var(--text)",marginTop:2 }}>
                  <span style={{ color:"var(--green)" }}>{nextSched.horario}</span>{" — "}{nextSched.label||nextSched.playlist_nome}
                </div>
              </div>
            </div>
          )}
          <div style={{ display:"grid",gridTemplateColumns:"80px 1fr auto 90px 80px",padding:"0 18px",height:34,background:"var(--surface)",borderBottom:"1px solid var(--border)",alignItems:"center",flexShrink:0,marginTop:10 }}>
            {["Horário","Playlist","","Ativo",""].map((h,i)=><div key={i} className={`th ${i<=1?"left":""}`}>{h}</div>)}
          </div>
          <div style={{ overflow:"auto",flex:1 }}>
            {schedules.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p>Nenhum agendamento criado.</p>
                <small>Clique em "+ Novo" para agendar.</small>
                <button className="btn btn-primary" style={{ marginTop:12 }} onClick={()=>setSchedModal({})}><IcoPlus /> Criar agendamento</button>
              </div>
            ) : [...schedules].sort((a,b)=>a.horario.localeCompare(b.horario)).map(s => (
              <ScheduleRow key={s.id} sched={s} playlists={plList} isNext={nextSched?.id===s.id}
                onEdit={setSchedModal} onDelete={id=>setDeleteConfirm(id)} onToggle={toggleSchedule} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {mediaModal && <MediaModal item={mediaModal} onClose={()=>setMediaModal(null)} onPlay={handlePlayItem} />}
      {schedModal !== null && <ScheduleModal schedule={schedModal} playlists={plList} onClose={()=>setSchedModal(null)} onSave={saveSchedule} />}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={()=>setDeleteConfirm(null)}>
          <div className="modal" style={{ width:320 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(244,63,94,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}><IcoTrash /></div>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:14 }}>Excluir Agendamento</div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize:13,color:"var(--text2)",marginBottom:18,lineHeight:1.5 }}>Tem certeza que deseja excluir este agendamento?</p>
              <div style={{ display:"flex",gap:8 }}>
                <button className="btn btn-danger" style={{ flex:1,justifyContent:"center" }} onClick={()=>deleteSchedule(deleteConfirm)}><IcoTrash /> Excluir</button>
                <button className="btn btn-ghost" onClick={()=>setDeleteConfirm(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}