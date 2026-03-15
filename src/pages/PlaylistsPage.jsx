import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoPlay   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>;
const IcoClock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoPlus   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoCheck  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoRepeat = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;

// ─── Modal: Tocar Agora ───────────────────────────────────────────────────────
function PlayNowModal({ pl, onClose, onPlay }) {
  const [loops, setLoops] = useState(1);
  if (!pl) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 340 }}>
        <div className="modal-header">
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,var(--p4),var(--p2))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IcoPlay />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{pl.nome}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{(pl.itens || []).length} faixa(s)</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16 }}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Quantas vezes repetir?</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="loops-control">
                <button className="loops-btn" onClick={() => setLoops(l => Math.max(1, l - 1))}>−</button>
                <div className="loops-val">{loops}</div>
                <button className="loops-btn" onClick={() => setLoops(l => Math.min(99, l + 1))}>+</button>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{loops === 1 ? "vez" : "vezes"}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => { onPlay(pl, loops); onClose(); }}>
            <IcoPlay /> Tocar Agora
          </button>
          <button onClick={onClose} style={{ width: "100%", marginTop: 8, padding: "9px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--muted)", fontSize: 12 }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Criar / Editar Agendamento ────────────────────────────────────────
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

  const DIAS = [
    { k: "dom", l: "D" }, { k: "seg", l: "S" }, { k: "ter", l: "T" },
    { k: "qua", l: "Q" }, { k: "qui", l: "Q" }, { k: "sex", l: "S" }, { k: "sab", l: "S" },
  ];
  const DIAS_FULL = { dom: "Dom", seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb" };

  const toggleDia = (k) => {
    setForm(f => ({
      ...f,
      dias: f.dias.includes(k) ? f.dias.filter(d => d !== k) : [...f.dias, k],
    }));
  };

  const selectPl = (id) => {
    const pl = playlists.find(p => p.id === id);
    setForm(f => ({ ...f, playlist_id: id, playlist_nome: pl?.nome || "" }));
  };

  const save = () => {
    if (!form.playlist_id) return;
    if (!form.horario)     return;
    if (form.dias.length === 0) return;
    onSave({ ...form, id: schedule?.id || Date.now().toString() });
    onClose();
  };

  const canSave = form.playlist_id && form.horario && form.dias.length > 0;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 460 }}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,var(--p4),var(--p2))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IcoClock />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
              {isEdit ? "Editar Agendamento" : "Novo Agendamento"}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              Define quando uma playlist será tocada automaticamente
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16 }}>✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Label opcional */}
          <div>
            <div style={labelStyle}>Nome / Descrição <span style={{ color: "var(--muted)" }}>(opcional)</span></div>
            <input
              style={inputStyle}
              placeholder="Ex: Abertura da manhã, Almoço..."
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            />
          </div>

          {/* Playlist */}
          <div>
            <div style={labelStyle}>Playlist</div>
            {playlists.length === 0 ? (
              <div style={{ color: "var(--warn)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                Nenhuma playlist disponível. Crie no painel web primeiro.
              </div>
            ) : (
              <select style={inputStyle} value={form.playlist_id} onChange={e => selectPl(e.target.value)}>
                {playlists.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({(p.itens || []).length} faixas)</option>
                ))}
              </select>
            )}
          </div>

          {/* Horário + Loops */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Horário</div>
              <input
                type="time"
                style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--p1)", letterSpacing: 2, textAlign: "center", padding: "10px 12px" }}
                value={form.horario}
                onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
              />
            </div>
            <div>
              <div style={labelStyle}>Repetições</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="loops-control" style={{ flex: 1 }}>
                  <button className="loops-btn" onClick={() => setForm(f => ({ ...f, loops: Math.max(1, f.loops - 1) }))}>−</button>
                  <div className="loops-val" style={{ flex: 1 }}>{form.loops}</div>
                  <button className="loops-btn" onClick={() => setForm(f => ({ ...f, loops: Math.min(99, f.loops + 1) }))}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Dias da semana */}
          <div>
            <div style={{ ...labelStyle, marginBottom: 10 }}>Dias da Semana</div>
            <div style={{ display: "flex", gap: 7 }}>
              {DIAS.map(({ k, l }) => {
                const active = form.dias.includes(k);
                return (
                  <button
                    key={k}
                    title={DIAS_FULL[k]}
                    onClick={() => toggleDia(k)}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: `2px solid ${active ? "var(--p2)" : "var(--border)"}`,
                      background: active ? "var(--p2)" : "var(--surface3)",
                      color: active ? "white" : "var(--muted)",
                      cursor: "pointer", fontWeight: 700, fontSize: 11,
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {l}
                  </button>
                );
              })}
              <button
                title="Selecionar todos"
                onClick={() => setForm(f => ({ ...f, dias: f.dias.length === 7 ? [] : ["dom","seg","ter","qua","qui","sex","sab"] }))}
                style={{ marginLeft: "auto", padding: "0 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface3)", color: "var(--muted2)", cursor: "pointer", fontSize: 10, fontFamily: "var(--font-mono)" }}
              >
                {form.dias.length === 7 ? "nenhum" : "todos"}
              </button>
            </div>
            {form.dias.length === 0 && (
              <div style={{ marginTop: 6, fontSize: 10, color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
                Selecione pelo menos 1 dia
              </div>
            )}
          </div>

          {/* Ativo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface3)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>Ativo</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>Desativar não exclui o agendamento</div>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
              style={{
                width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                background: form.ativo ? "var(--p2)" : "var(--surface4)",
                position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: 3,
                left: form.ativo ? "calc(100% - 21px)" : 3,
                width: 18, height: 18, borderRadius: "50%",
                background: "white", transition: "left 0.2s",
              }} />
            </button>
          </div>

          {/* Preview */}
          {canSave && (
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Preview</div>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--p1)", fontWeight: 700 }}>{form.horario}</span>
                {" — "}
                <span style={{ color: "var(--text)" }}>{form.playlist_nome}</span>
                {form.loops > 1 && <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}> × {form.loops}</span>}
                <br/>
                <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  {form.dias.map(d => DIAS_FULL[d]).join(", ")}
                </span>
              </div>
            </div>
          )}

          {/* Botões */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center", opacity: canSave ? 1 : 0.4, cursor: canSave ? "pointer" : "not-allowed" }}
              onClick={canSave ? save : undefined}
            >
              <IcoCheck /> {isEdit ? "Salvar Alterações" : "Criar Agendamento"}
            </button>
            <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle = {
  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: 7,
};
const inputStyle = {
  width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "9px 12px", color: "var(--text)",
  fontFamily: "var(--font-body)", fontSize: 12, outline: "none",
  colorScheme: "dark",
};

// ─── Schedule Row ─────────────────────────────────────────────────────────────
function ScheduleRow({ sched, onEdit, onDelete, onToggle, isNext, playlists }) {
  const DIAS_FULL = { dom: "Dom", seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb" };
  const allDays = sched.dias?.length === 7;
  const weekdays = ["seg","ter","qua","qui","sex"];
  const isWeekdays = weekdays.every(d => sched.dias?.includes(d)) && !["dom","sab"].some(d => sched.dias?.includes(d));

  const diasLabel = allDays ? "Todos os dias" : isWeekdays ? "Seg – Sex" :
    (sched.dias || []).map(d => DIAS_FULL[d]).join(", ");

  const pl = playlists.find(p => p.id === sched.playlist_id);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "80px 1fr auto 90px 80px",
      alignItems: "center",
      gap: 12,
      padding: "0 18px",
      height: 58,
      borderBottom: "1px solid var(--border)",
      background: !sched.ativo ? "rgba(0,0,0,0.2)" : isNext ? "rgba(139,92,246,0.05)" : "transparent",
      transition: "background 0.15s",
      opacity: sched.ativo ? 1 : 0.55,
    }}>

      {/* Horário */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isNext && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0, boxShadow: "0 0 6px var(--green-glow)" }} />}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: isNext ? "var(--green)" : "var(--text)", letterSpacing: 1 }}>
          {sched.horario}
        </span>
      </div>

      {/* Info */}
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sched.label || pl?.nome || sched.playlist_nome || "—"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          {sched.label && (
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pl?.nome || sched.playlist_nome}
            </span>
          )}
          <span style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{diasLabel}</span>
          {sched.loops > 1 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "var(--cyan)", fontFamily: "var(--font-mono)", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 99, padding: "1px 6px" }}>
              <IcoRepeat /> {sched.loops}×
            </span>
          )}
        </div>
      </div>

      {/* Próximo badge */}
      <div style={{ width: 50 }}>
        {isNext && (
          <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(52,211,153,0.1)", color: "var(--green)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 99, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
            próximo
          </span>
        )}
      </div>

      {/* Toggle ativo */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => onToggle(sched.id)}
          title={sched.ativo ? "Desativar" : "Ativar"}
          style={{
            width: 38, height: 20, borderRadius: 99, border: "none", cursor: "pointer",
            background: sched.ativo ? "var(--p2)" : "var(--surface4)",
            position: "relative", transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: 2,
            left: sched.ativo ? "calc(100% - 18px)" : 2,
            width: 16, height: 16, borderRadius: "50%",
            background: "white", transition: "left 0.2s",
          }} />
        </button>
      </div>

      {/* Ações */}
      <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "5px 8px" }}
          onClick={() => onEdit(sched)}
          title="Editar"
        >
          <IcoEdit />
        </button>
        <button
          className="btn btn-sm"
          style={{ padding: "5px 8px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "var(--danger)" }}
          onClick={() => onDelete(sched.id)}
          title="Excluir"
        >
          <IcoTrash />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlaylistsPage() {
  const { state, call, setPage } = useApp();
  const { playlists, currentPlaylist: nowPlaying, schedules: stateSchedules } = state;

  const [tab, setTab]       = useState("schedules");
  const [playModal, setPlayModal] = useState(null);
  const [schedModal, setSchedModal] = useState(null); // null | {} (new) | {...} (edit)
  const [schedules, setSchedules] = useState(stateSchedules || []);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const plEntries = Object.entries(playlists || {})
    .filter(([, pl]) => pl && typeof pl === "object")
    .sort(([, a], [, b]) => (a.nome || "").localeCompare(b.nome || ""));

  const plList = plEntries.map(([id, pl]) => ({ id, ...pl }));

  // Próximo agendamento do dia
  const nowStr = new Date().toTimeString().slice(0, 5);
  const todayKey = ["dom","seg","ter","qua","qui","sex","sab"][new Date().getDay()];

  const nextSched = useMemo(() => {
    const active = schedules.filter(s => s.ativo && (s.dias || []).includes(todayKey));
    const future = active.filter(s => s.horario > nowStr).sort((a, b) => a.horario.localeCompare(b.horario));
    return future[0] || null;
  }, [schedules, nowStr, todayKey]);

  const sortedSchedules = useMemo(() =>
    [...schedules].sort((a, b) => a.horario.localeCompare(b.horario)),
  [schedules]);

  const handlePlay = (pl, loops) => {
    call("play_playlist_now", { playlist: pl, loops });
    setPage("Player");
  };

  const saveSchedule = (sched) => {
    setSchedules(prev => {
      const idx = prev.findIndex(s => s.id === sched.id);
      const next = idx >= 0
        ? prev.map((s, i) => i === idx ? sched : s)
        : [...prev, sched];
      call("save_schedules", next);
      return next;
    });
  };

  const deleteSchedule = (id) => {
    setSchedules(prev => {
      const next = prev.filter(s => s.id !== id);
      call("save_schedules", next);
      return next;
    });
    setDeleteConfirm(null);
  };

  const toggleSchedule = (id) => {
    setSchedules(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s);
      call("save_schedules", next);
      return next;
    });
  };

  const activeCount = schedules.filter(s => s.ativo).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      {/* Header */}
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--warn)" }} />
        <span className="page-title">Playlists</span>

        {/* Tab strip no header */}
        <div style={{ display: "flex", gap: 3, marginLeft: 16 }}>
          {[
            { id: "schedules", label: "⏰  Agendamentos" },
            { id: "playlists", label: "♫  Playlists" },
          ].map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
              style={{ fontSize: 11 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="page-header-right">
          {tab === "schedules" && (
            <>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                {activeCount} ativo{activeCount !== 1 ? "s" : ""}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSchedModal({})}
              >
                <IcoPlus /> Novo
              </button>
            </>
          )}
          {tab === "playlists" && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
              {plEntries.length} playlist{plEntries.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── TAB: AGENDAMENTOS ── */}
      {tab === "schedules" && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Próximo agendamento banner */}
          {nextSched && (
            <div style={{
              margin: "10px 16px 0",
              padding: "10px 16px",
              background: "rgba(52,211,153,0.07)",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 12,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>⏰</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)", letterSpacing: 1 }}>PRÓXIMO HOJE</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                  <span style={{ color: "var(--green)" }}>{nextSched.horario}</span>
                  {" — "}
                  {nextSched.label || nextSched.playlist_nome}
                </div>
              </div>
              {nextSched.loops > 1 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cyan)" }}>×{nextSched.loops}</span>
              )}
            </div>
          )}

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr auto 90px 80px",
            padding: "0 18px", height: 34, background: "var(--surface)",
            borderBottom: "1px solid var(--border)", alignItems: "center",
            flexShrink: 0, marginTop: 10,
          }}>
            {["Horário", "Playlist", "", "Ativo", ""].map((h, i) => (
              <div key={i} className={`th ${i <= 1 ? "left" : ""}`}>{h}</div>
            ))}
          </div>

          {/* List */}
          <div style={{ overflow: "auto", flex: 1 }}>
            {sortedSchedules.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>Nenhum agendamento criado.</p>
                <small>Clique em "+ Novo" para agendar uma playlist.</small>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setSchedModal({})}>
                  <IcoPlus /> Criar primeiro agendamento
                </button>
              </div>
            ) : (
              sortedSchedules.map(s => (
                <ScheduleRow
                  key={s.id}
                  sched={s}
                  playlists={plList}
                  isNext={nextSched?.id === s.id}
                  onEdit={setSchedModal}
                  onDelete={id => setDeleteConfirm(id)}
                  onToggle={toggleSchedule}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB: PLAYLISTS ── */}
      {tab === "playlists" && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 58px 88px 98px",
            padding: "0 16px", height: 33, background: "var(--surface)",
            borderBottom: "1px solid var(--border)", alignItems: "center",
          }}>
            {["Nome", "Faixas", "Status", ""].map((h, i) => (
              <div key={i} className={`th ${i === 0 ? "left" : ""}`}>{h}</div>
            ))}
          </div>

          <div className="pl-list">
            {plEntries.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <p>Nenhuma playlist encontrada.</p>
                <small>Crie playlists no painel web.</small>
              </div>
            ) : (
              plEntries.map(([id, pl]) => {
                const isPlaying = pl.nome === nowPlaying;
                const ativa = pl.ativa !== false;
                return (
                  <div key={id} className={`pl-row ${isPlaying ? "active-pl" : ""}`} onDoubleClick={() => setPlayModal({ id, ...pl })}>
                    <div className="pl-name">
                      {isPlaying && <span style={{ color: "var(--p1)" }}>▶</span>}
                      {pl.nome || "—"}
                      {isPlaying && <span className="pl-name-sub">tocando</span>}
                    </div>
                    <div className="pl-count">{(pl.itens || []).length}</div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span className={`pl-status-badge ${ativa ? "ativa" : "inativa"}`}>{ativa ? "Ativa" : "Inativa"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
                      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setPlayModal({ id, ...pl }); }}>
                        <IcoPlay /> Tocar
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Agendar esta playlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchedModal({ playlist_id: id, playlist_nome: pl.nome });
                          setTab("schedules");
                        }}
                      >
                        <IcoClock />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Modal Tocar ── */}
      {playModal && (
        <PlayNowModal
          pl={playModal}
          onClose={() => setPlayModal(null)}
          onPlay={handlePlay}
        />
      )}

      {/* ── Modal Agendamento ── */}
      {schedModal !== null && (
        <ScheduleModal
          schedule={schedModal}
          playlists={plList}
          onClose={() => setSchedModal(null)}
          onSave={saveSchedule}
        />
      )}

      {/* ── Confirm Delete ── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ width: 320 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoTrash />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>Excluir Agendamento</div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18, lineHeight: 1.5 }}>
                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => deleteSchedule(deleteConfirm)}>
                  <IcoTrash /> Excluir
                </button>
                <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
