// src/pages/index.jsx  (LogsPage + ConfigPage + AccountPage)
import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

// ══════════════════════════════════════════════════════════════════
//  LOGS PAGE
// ══════════════════════════════════════════════════════════════════
export function LogsPage() {
  const { state, setState } = useApp();
  const { logs } = state;
  const clearLogs = () => setState((s) => ({ ...s, logs: [] }));

  return (
    <div className="logs-layout">
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--green)" }} />
        <span className="page-title">Logs</span>
        <div className="page-header-right">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
            {logs.length} registro{logs.length !== 1 ? "s" : ""}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={clearLogs}>Limpar</button>
        </div>
      </div>

      <div className="log-table-header">
        {["Horário", "Status", "Mensagem"].map((h, i) => (
          <div key={i} className={`th ${i === 2 ? "left" : ""}`}>{h}</div>
        ))}
      </div>

      <div className="log-table">
        {logs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>Nenhum log ainda.</p>
          </div>
        ) : (
          logs.map((l, i) => {
            const ts = l.timestamp
              ? new Date(l.timestamp).toLocaleString("pt-BR", {
                  day: "2-digit", month: "2-digit",
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                })
              : "—";
            const st = (l.status || "info").toLowerCase();
            return (
              <div key={i} className="log-row">
                <div className="log-ts">{ts}</div>
                <div>
                  <span className={`log-status-badge ${st === "ok" ? "ok" : st === "error" ? "error" : "info"}`}>
                    {st.toUpperCase()}
                  </span>
                </div>
                <div className="log-msg">{l.mensagem || "—"}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  DEPS SECTION (usado dentro do ConfigPage)
// ══════════════════════════════════════════════════════════════════
const DEP_INFO = {
  pywebview:  { name: "pyWebView",         desc: "Interface gráfica",           required: true  },
  pygame:     { name: "Pygame",            desc: "Reprodução de áudio",         required: true  },
  requests:   { name: "Requests",          desc: "Comunicação Firebase",        required: true  },
  pythonnet:  { name: "PythonNet (.NET)",  desc: "Renderização da janela",      required: true  },
  pycaw:      { name: "PyCaw",             desc: "Duck de volume automático",   required: false },
  yt_dlp:     { name: "yt-dlp",            desc: "Download YouTube",            required: false },
};
const PIP_MAP = {
  pywebview: "pywebview", pygame: "pygame", requests: "requests",
  pythonnet: "pythonnet", pycaw: "pycaw",   yt_dlp: "yt-dlp",
};

function DepsSection({ call }) {
  const [deps,       setDeps]       = useState(null);
  const [installing, setInstalling] = useState(false);
  const [log,        setLog]        = useState([]);
  const [expanded,   setExpanded]   = useState(false);

  const loadDeps = () =>
    call("get_deps_status").then(r => { if (r) setDeps(r); }).catch(() => {});

  useEffect(() => { loadDeps(); }, []);

  const addLog = (msg) => setLog(prev => [...prev.slice(-40), msg]);

  const installPkgs = async (keys) => {
    setInstalling(true);
    setLog([]);
    setExpanded(true);
    for (const key of keys) {
      addLog(`Instalando ${DEP_INFO[key]?.name || key}...`);
      try {
        const res = await call("install_dep", PIP_MAP[key] || key);
        addLog(res?.ok ? `  ✓ OK` : `  ✗ ${res?.error || "erro"}`);
      } catch (e) { addLog(`  ✗ ${e.message}`); }
    }
    addLog("Concluído — reiniciando para aplicar...");
    setInstalling(false);
    loadDeps();
    setTimeout(() => call("cmd_restart"), 1800);
  };

  if (!deps) return (
    <div style={{ fontSize: 11, color: "var(--muted)", padding: "8px 0" }}>
      Verificando dependências...
    </div>
  );

  const miss_req = Object.keys(DEP_INFO).filter(k => !deps[k] &&  DEP_INFO[k].required);
  const miss_opt = Object.keys(DEP_INFO).filter(k => !deps[k] && !DEP_INFO[k].required);
  const all_ok   = miss_req.length === 0 && miss_opt.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Object.entries(DEP_INFO).map(([key, info]) => {
        const ok = !!deps[key];
        return (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 8,
            background: "var(--surface2)", border: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 13, color: ok ? "var(--green)" : info.required ? "var(--danger)" : "#f59e0b" }}>
              {ok ? "●" : "○"}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{info.name}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{info.desc}</div>
            </div>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 7px", borderRadius: 99,
              background: ok ? "rgba(52,211,153,.1)" : info.required ? "rgba(244,63,94,.1)" : "rgba(245,158,11,.1)",
              color:      ok ? "var(--green)"        : info.required ? "var(--danger)"       : "#f59e0b",
              border:    `1px solid ${ok ? "rgba(52,211,153,.2)" : info.required ? "rgba(244,63,94,.2)" : "rgba(245,158,11,.2)"}`,
            }}>
              {ok ? "OK" : info.required ? "FALTA" : "OPCIONAL"}
            </span>
          </div>
        );
      })}

      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {miss_req.length > 0 && (
          <button
            onClick={() => installPkgs([...miss_req, ...miss_opt])}
            disabled={installing}
            style={{
              background: "var(--danger)", color: "white", border: "none",
              borderRadius: 8, padding: "10px 18px", cursor: installing ? "default" : "pointer",
              fontSize: 12, fontWeight: 700, opacity: installing ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            }}
          >
            {installing ? "Instalando..." : `⬇  Instalar Dependências (${miss_req.length + miss_opt.length} pacotes)`}
          </button>
        )}

        {miss_req.length === 0 && miss_opt.length > 0 && (
          <button
            onClick={() => installPkgs(miss_opt)}
            disabled={installing}
            style={{
              background: "rgba(245,158,11,.1)", color: "#f59e0b",
              border: "1px solid rgba(245,158,11,.25)",
              borderRadius: 8, padding: "10px 18px", cursor: installing ? "default" : "pointer",
              fontSize: 12, fontWeight: 700, opacity: installing ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            }}
          >
            {installing ? "Instalando..." : `⬇  Instalar Opcionais (${miss_opt.length} pacotes)`}
          </button>
        )}

        {all_ok && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)",
            borderRadius: 8, fontSize: 11, color: "var(--green)",
          }}>
            ✓ Todas as dependências instaladas
          </div>
        )}
      </div>

      {log.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setExpanded(v => !v)} style={{
            background: "none", border: "none", color: "var(--muted)",
            cursor: "pointer", fontSize: 10, fontFamily: "var(--font-mono)", padding: 0, marginBottom: 4,
          }}>
            {expanded ? "▼" : "▶"} Log de instalação
          </button>
          {expanded && (
            <div style={{
              background: "var(--surface3)", borderRadius: 8, padding: "10px 12px",
              fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cyan)",
              maxHeight: 140, overflowY: "auto", lineHeight: 1.7,
              border: "1px solid var(--border)",
            }}>
              {log.map((l, i) => (
                <div key={i} style={{
                  color: l.startsWith("  ✓") ? "var(--green)"
                       : l.startsWith("  ✗") ? "var(--danger)"
                       : "var(--cyan)",
                }}>{l}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CONFIG PAGE
// ══════════════════════════════════════════════════════════════════

// ── Ícones dos quick-action cards ────────────────────────────────
const IcoVolume = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IcoDeps = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IcoWeb = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IcoUpdate = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IcoStartup = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22V12"/>
    <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
    <path d="M12 2a5 5 0 0 1 5 5v5H7V7a5 5 0 0 1 5-5z"/>
  </svg>
);

// ── Slider de volume ──────────────────────────────────────────────
function VolumeSlider({ label, value, onChange, color, icon }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{label}</span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color,
          background: `${color}18`, border: `1px solid ${color}33`,
          borderRadius: 6, padding: "2px 10px", minWidth: 44, textAlign: "center",
        }}>
          {value}%
        </div>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 99, background: "var(--surface3)", border: "1px solid var(--border)" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${value}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: "width 0.1s",
        }} />
        <input
          type="range" min={0} max={100} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0, cursor: "pointer", margin: 0,
          }}
        />
      </div>
    </div>
  );
}

// ── Card expansível ───────────────────────────────────────────────
function ExpandCard({ icon, label, badge, badgeColor, badgeBg, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "var(--surface2)",
      border: `1px solid ${open ? "rgba(139,92,246,0.25)" : "var(--border)"}`,
      borderRadius: 12, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: open ? "rgba(139,92,246,0.15)" : "var(--surface3)",
          border: `1px solid ${open ? "rgba(139,92,246,0.3)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "var(--p1)" : "var(--muted)", transition: "all 0.2s",
        }}>
          {icon}
        </div>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{label}</span>
        {badge && (
          <span style={{
            fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700,
            padding: "2px 8px", borderRadius: 99,
            background: badgeBg || "rgba(139,92,246,0.12)",
            color: badgeColor || "var(--p1)",
            border: `1px solid ${badgeColor ? badgeColor + "44" : "rgba(139,92,246,0.25)"}`,
          }}>{badge}</span>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />
          {children}
        </div>
      )}
    </div>
  );
}

export function ConfigPage() {
  const { state, setState, call } = useApp();
  const { config, cacheInfo } = state;

  // ── Nome do player (edição inline) ────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameDraft,   setNameDraft]   = useState("");
  const nameInputRef = useRef(null);

  const startEditName = () => {
    setNameDraft(config?.player_nome || "");
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };
  const saveNameInline = () => {
    if (nameDraft.trim()) {
      setState(s => ({ ...s, config: { ...s.config, player_nome: nameDraft.trim() } }));
    }
    setEditingName(false);
  };

  // ── Volume ────────────────────────────────────────────────────
  const [volAnuncio, setVolAnuncio] = useState(config?.volume_anuncio ?? 100);
  const [volOutros,  setVolOutros]  = useState(config?.volume_outros  ?? 10);
  const [fadeDuck,   setFadeDuck]   = useState(config?.duck_fade_ms   ?? 1200);

  useEffect(() => {
    setVolAnuncio(config?.volume_anuncio ?? 100);
    setVolOutros(config?.volume_outros   ?? 10);
    setFadeDuck(config?.duck_fade_ms     ?? 1200);
  }, [config]);

  // ── Startup ───────────────────────────────────────────────────
  const [startupEnabled, setStartupEnabled] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);
  const [startupMsg,     setStartupMsg]     = useState("");

  useEffect(() => {
    call("get_startup_status").then(r => { if (r != null) setStartupEnabled(!!r); }).catch(() => {});
  }, []);

  const handleStartupToggle = async () => {
    setStartupLoading(true); setStartupMsg("");
    try {
      const res = await call("toggle_startup", !startupEnabled);
      if (res?.ok) { setStartupEnabled(v => !v); setStartupMsg(res.msg || ""); }
      else setStartupMsg(res?.error || "Não foi possível alterar.");
    } catch { setStartupMsg("Erro ao alterar."); }
    finally {
      setStartupLoading(false);
      setTimeout(() => setStartupMsg(""), 5000);
    }
  };

  // ── Save all ──────────────────────────────────────────────────
  const save = () => {
    const newConfig = {
      ...config,
      volume_anuncio: volAnuncio,
      volume_outros:  volOutros,
      duck_fade_ms:   fadeDuck,
    };
    setState(s => ({ ...s, config: newConfig }));
    call("save_config", newConfig).then(() => {
      const el = document.createElement("div");
      el.textContent = "✓  Configurações salvas";
      Object.assign(el.style, {
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        background: "var(--green)", color: "#000", padding: "10px 20px",
        borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "12px",
        fontWeight: 700,
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    });
  };

  const LOCAL_DIR = window.__playads_local_dir || "local/";
  const isStartupErr = startupMsg.toLowerCase().includes("erro") || startupMsg.includes("possível");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--muted2)" }} />
        <span className="page-title">Configurações</span>
        <span className="page-sub">Player e sistema</span>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <div className="config-layout">

          {/* ── Nome do Player ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px",
              textTransform: "uppercase", color: "var(--muted)", marginBottom: 10,
            }}>Nome do Player</div>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px",
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 12,
            }}>
              {/* Avatar / ícone */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(34,211,238,0.2))",
                border: "1px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--p1)" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>

              {editingName ? (
                <input
                  ref={nameInputRef}
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onBlur={saveNameInline}
                  onKeyDown={e => { if (e.key === "Enter") saveNameInline(); if (e.key === "Escape") setEditingName(false); }}
                  style={{
                    flex: 1, background: "var(--surface3)", border: "1px solid rgba(139,92,246,0.5)",
                    borderRadius: 7, padding: "6px 10px", color: "var(--text)",
                    fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)",
                    outline: "none",
                  }}
                />
              ) : (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {config?.player_nome || "Player Principal"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    Identificação deste player no painel
                  </div>
                </div>
              )}

              <button
                onClick={editingName ? saveNameInline : startEditName}
                title={editingName ? "Salvar nome" : "Editar nome"}
                style={{
                  background: editingName ? "rgba(52,211,153,0.12)" : "var(--surface3)",
                  border: `1px solid ${editingName ? "rgba(52,211,153,0.3)" : "var(--border)"}`,
                  borderRadius: 8, padding: "7px 10px", cursor: "pointer",
                  color: editingName ? "var(--green)" : "var(--muted)",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {editingName ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Salvar
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Cards expansíveis ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>

            {/* Volume */}
            <ExpandCard
              icon={<IcoVolume />}
              label="Volume & Duck de Volume"
              badge="Áudio"
              badgeColor="var(--cyan)"
              badgeBg="rgba(34,211,238,0.1)"
            >
              <VolumeSlider
                label="Volume dos Anúncios"
                value={volAnuncio}
                onChange={setVolAnuncio}
                color="var(--p1)"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                }
              />
              <VolumeSlider
                label="Volume de Outros Apps (Duck)"
                value={volOutros}
                onChange={setVolOutros}
                color="var(--warn)"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                }
              />

              {/* Fade duck ms */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Fade de Entrada/Saída (ms)</div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--cyan)",
                    background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)",
                    borderRadius: 6, padding: "2px 10px", minWidth: 54, textAlign: "center",
                  }}>
                    {fadeDuck}ms
                  </div>
                </div>
                <div style={{ position: "relative", height: 6, borderRadius: 99, background: "var(--surface3)", border: "1px solid var(--border)" }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, height: "100%",
                    width: `${((fadeDuck - 500) / 2500) * 100}%`, borderRadius: 99,
                    background: "linear-gradient(90deg, rgba(34,211,238,0.6), var(--cyan))",
                    transition: "width 0.1s",
                  }} />
                  <input
                    type="range" min={500} max={3000} step={100} value={fadeDuck}
                    onChange={e => setFadeDuck(Number(e.target.value))}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      opacity: 0, cursor: "pointer", margin: 0,
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>500ms (rápido)</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>3000ms (suave)</span>
                </div>
              </div>

              <button className="btn btn-primary" style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={save}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Salvar Configurações de Áudio
              </button>
            </ExpandCard>

            {/* Pasta local */}
            <ExpandCard
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              }
              label="Pasta Local de Mídias"
              badge={`${cacheInfo?.files ?? 0} arquivo${(cacheInfo?.files ?? 0) !== 1 ? "s" : ""}`}
              badgeColor="var(--muted2)"
              badgeBg="var(--surface3)"
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cyan)", marginBottom: 6 }}>{LOCAL_DIR}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted2)" }}>
                {cacheInfo?.files ?? 0} arquivo(s) · {((cacheInfo?.size || 0) / 1048576).toFixed(1)} MB
              </div>
            </ExpandCard>

            {/* Iniciar com o sistema */}
            <ExpandCard
              icon={<IcoStartup />}
              label="Iniciar com o Sistema"
              badge={startupEnabled ? "ATIVO" : "INATIVO"}
              badgeColor={startupEnabled ? "var(--green)" : "var(--muted)"}
              badgeBg={startupEnabled ? "rgba(52,211,153,0.1)" : "var(--surface3)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                    {startupEnabled
                      ? "PlayAds abrirá automaticamente ao ligar o computador."
                      : "Ative para o PlayAds iniciar automaticamente com o Windows."}
                  </div>
                  {startupMsg && (
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 4,
                      color: isStartupErr ? "var(--danger)" : "var(--green)" }}>{startupMsg}</div>
                  )}
                </div>
                <button
                  onClick={handleStartupToggle}
                  disabled={startupLoading}
                  style={{
                    position: "relative", width: 46, height: 26, borderRadius: 99,
                    border: "none", cursor: startupLoading ? "default" : "pointer",
                    background: startupEnabled ? "var(--green)" : "var(--surface3)",
                    transition: "background 0.2s", flexShrink: 0,
                    opacity: startupLoading ? 0.7 : 1,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3,
                    left: startupEnabled ? "calc(100% - 23px)" : 3,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "white", transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                  }} />
                </button>
              </div>
              <div style={{
                marginTop: 10, padding: "8px 10px", background: "var(--surface3)",
                borderRadius: 7, border: "1px solid var(--border)",
                fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.6,
              }}>
                Windows: <span style={{ color: "var(--cyan)" }}>Shell:startup</span> (PlayAds.bat)
                &nbsp;·&nbsp; macOS: <span style={{ color: "var(--cyan)" }}>~/Library/LaunchAgents/</span>
                &nbsp;·&nbsp; Linux: <span style={{ color: "var(--cyan)" }}>~/.config/autostart/</span>
              </div>
            </ExpandCard>

            {/* Dependências */}
            <ExpandCard
              icon={<IcoDeps />}
              label="Dependências do Sistema"
            >
              <DepsSection call={call} />
            </ExpandCard>

            {/* Painel Web */}
            <ExpandCard
              icon={<IcoWeb />}
              label="Painel Web"
              badge="Externo"
              badgeColor="var(--cyan)"
              badgeBg="rgba(34,211,238,0.1)"
            >
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
                Acesse o painel de controle web para gerenciar playlists, agendamentos e anúncios de qualquer dispositivo.
              </div>
              <a
                href="https://anucio-web.web.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px",
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.25)",
                  borderRadius: 10, textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(34,211,238,0.14)";
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(34,211,238,0.08)";
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.25)";
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IcoWeb />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cyan)" }}>anucio-web.web.app</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                    Painel de controle · Playlists · Agendamentos
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </ExpandCard>

            {/* Atualização */}
            <ExpandCard
              icon={<IcoUpdate />}
              label="Atualização do Software"
              badge="v7.0"
              badgeColor="var(--p1)"
              badgeBg="rgba(139,92,246,0.12)"
            >
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
                Verifique se há uma versão mais recente do PlayAds disponível para download.
              </div>
              <a
                href="https://play-ads-releasse.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px",
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 10, textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(139,92,246,0.14)";
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--p1)",
                }}>
                  <IcoUpdate />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--p1)" }}>play-ads-releasse.vercel.app</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                    Baixar versão mais recente
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p1)" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </ExpandCard>

          </div>

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ACCOUNT PAGE
// ══════════════════════════════════════════════════════════════════

const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const PLATFORMS = [
  {
    id: "spotify", name: "Spotify", wip: false,
    desc: "Pausa o Spotify ao tocar anúncios e retoma depois",
    color: "#1DB954", bg: "rgba(29,185,84,.12)", border: "rgba(29,185,84,.3)",
    note: "Duck via pycaw já funciona. Esta integração adiciona pause/resume preciso via API oficial.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  },
  {
    id: "youtube_music", name: "YouTube Music", wip: true,
    desc: "Reduz volume do YouTube Music durante anúncios",
    color: "#FF0000", bg: "rgba(255,0,0,.1)", border: "rgba(255,0,0,.25)",
    note: "Duck via pycaw já ativo. API direta em desenvolvimento.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    id: "deezer", name: "Deezer", wip: true,
    desc: "Integração com Deezer para controle durante anúncios",
    color: "#FF0090", bg: "rgba(255,0,144,.1)", border: "rgba(255,0,144,.25)",
    note: "Duck via pycaw já ativo. API planejada para versão futura.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0090"><path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.03h5.19V8.38H6.27zm6.27 0v3.03h5.19V8.38h-5.19zm6.27 0v3.03H24V8.38h-5.19zM6.27 12.6v3.03h5.19V12.6H6.27zm6.27 0v3.03h5.19V12.6h-5.19zm6.27 0v3.03H24V12.6h-5.19zM0 16.81v3.03h5.19v-3.03H0zm6.27 0v3.03h5.19v-3.03H6.27zm6.27 0v3.03h5.19v-3.03h-5.19zm6.27 0v3.03H24v-3.03h-5.19z"/></svg>,
  },
  {
    id: "amazon_music", name: "Amazon Music", wip: true,
    desc: "Controle do Amazon Music durante anúncios",
    color: "#00A8E1", bg: "rgba(0,168,225,.1)", border: "rgba(0,168,225,.25)",
    note: "Duck via pycaw já ativo. API da Amazon tem acesso muito restrito.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#00A8E1"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.706c-.209.189-.512.201-.745.076-1.051-.872-1.238-1.276-1.814-2.108-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.642-4.731-4.927 0-2.565 1.391-4.309 3.37-5.161 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.578-1.124-.816-1.776-.816-1.208 0-2.281.618-2.545 1.9-.053.284-.26.564-.547.578l-3.064-.331c-.259-.056-.547-.266-.472-.661C5.97 1.739 9.089.5 11.863.5c1.416 0 3.267.377 4.383 1.452 1.416 1.322 1.28 3.085 1.28 5.007v4.531c0 1.362.564 1.961 1.096 2.698.187.261.228.574-.011.769-.594.495-1.648 1.413-2.229 1.929l-.238-.09z"/></svg>,
  },
];

function IcoInfo() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}

function IntegrationCard({ platform, connected, onConnect, onDisconnect }) {
  const [showNote, setShowNote] = useState(false);
  return (
    <div style={{
      background: "var(--surface2)",
      border: `1px solid ${connected ? platform.border : "var(--border)"}`,
      borderRadius: 10, padding: "12px 14px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 9, flexShrink: 0, marginTop: 2,
        background: connected ? platform.bg : "var(--surface3)",
        border: `1px solid ${connected ? platform.border : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {platform.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{platform.name}</span>
          {platform.wip && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
              background: "rgba(251,191,36,.12)", color: "#f59e0b",
              border: "1px solid rgba(251,191,36,.25)", fontFamily: "var(--font-mono)",
            }}>EM BREVE</span>
          )}
          {connected && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
              background: platform.bg, color: platform.color,
              border: `1px solid ${platform.border}`, fontFamily: "var(--font-mono)",
            }}>● CONECTADO</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{platform.desc}</div>
        {showNote && (
          <div style={{
            marginTop: 7, fontSize: 10, color: "var(--muted2)", lineHeight: 1.5,
            padding: "7px 9px", background: "var(--surface3)",
            borderRadius: 6, border: "1px solid var(--border)",
          }}>
            ℹ️ {platform.note}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center", marginTop: 2 }}>
        <button onClick={() => setShowNote(v => !v)} style={{
          background: "var(--surface3)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "5px 7px", cursor: "pointer",
          color: showNote ? "var(--p1)" : "var(--muted)",
          display: "flex", alignItems: "center",
        }}><IcoInfo /></button>
        {connected ? (
          <button onClick={() => onDisconnect(platform.id)} style={{
            background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.2)",
            borderRadius: 6, padding: "5px 10px", cursor: "pointer",
            color: "#f43f5e", fontSize: 11, fontWeight: 600,
          }}>Desconectar</button>
        ) : (
          <button
            onClick={() => !platform.wip && onConnect(platform.id)}
            disabled={platform.wip}
            style={{
              background: platform.wip ? "var(--surface3)" : platform.bg,
              border: `1px solid ${platform.wip ? "var(--border)" : platform.border}`,
              borderRadius: 6, padding: "5px 10px",
              cursor: platform.wip ? "not-allowed" : "pointer",
              color: platform.wip ? "var(--muted)" : platform.color,
              fontSize: 11, fontWeight: 600, opacity: platform.wip ? 0.55 : 1,
            }}
          >
            {platform.wip ? "Em breve" : "Conectar"}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 9,
      letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)",
    }}>{children}</div>
  );
}

export function AccountPage() {
  const { state, call } = useApp();
  const { account } = state;
  const [connectedPlats, setConnectedPlats] = useState([]);

  const handleConnect    = async (id) => {
    const res = await call("connect_platform", id).catch(() => null);
    if (res?.ok) setConnectedPlats(p => [...p, id]);
    else alert(res?.error || "Não foi possível conectar.");
  };
  const handleDisconnect = async (id) => {
    await call("disconnect_platform", id).catch(() => {});
    setConnectedPlats(p => p.filter(x => x !== id));
  };

  const disconnect = () => {
    if (window.confirm("Isso irá apagar todos os dados locais e remover o início automático. Continuar?"))
      call("cmd_disconnect");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--p1)" }} />
        <span className="page-title">Conta</span>
        <span className="page-sub">Ativação e status</span>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <div className="account-layout">

          <SectionLabel>Conta Ativada</SectionLabel>
          <div className="account-info-grid" style={{ marginBottom: 28 }}>
            {[["E-mail", account?.email||"—"],["Código", account?.codigo||"—"],
              ["Status", account?.connected ? "● Ativo" : "Inativo"],["Versão","7.0"]]
              .map(([l, v]) => (
                <div key={l} className="info-item">
                  <div className="info-item-label">{l}</div>
                  <div className="info-item-value" style={{ color: l==="Status" ? "var(--green)" : undefined }}>{v}</div>
                </div>
              ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <SectionLabel>Integrar Contas de Música</SectionLabel>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 99,
              background: "rgba(139,92,246,.12)", color: "var(--p1)", border: "1px solid rgba(139,92,246,.25)",
            }}>{connectedPlats.length} conectada{connectedPlats.length !== 1 ? "s" : ""}</span>
          </div>

          <div style={{
            marginBottom: 12, padding: "9px 12px",
            background: "rgba(34,211,238,.06)", borderRadius: 9,
            border: "1px solid rgba(34,211,238,.15)",
            fontSize: 11, color: "var(--muted2)", lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--cyan)" }}>Duck automático já ativo:</strong> o PlayAds reduz o
            volume de todos os apps via pycaw ao tocar anúncios. As integrações abaixo adicionam
            pause/resume preciso por plataforma.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {PLATFORMS.map(p => (
              <IntegrationCard key={p.id} platform={p}
                connected={connectedPlats.includes(p.id)}
                onConnect={handleConnect} onDisconnect={handleDisconnect} />
            ))}
          </div>

          <div className="warn-banner" style={{ marginBottom: 14 }}>
            Desconectar apaga activation.json, todos os JSONs, arquivos em local/ e remove o início automático.
          </div>
          <button className="btn btn-danger" onClick={disconnect} style={{ padding: "11px 24px" }}>
            <IcoLogout /> Desconectar e Redefinir
          </button>

        </div>
      </div>
    </div>
  );
}

export default LogsPage;