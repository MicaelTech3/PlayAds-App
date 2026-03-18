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
//  DEPS MODAL
// ══════════════════════════════════════════════════════════════════
const DEP_INFO = {
  pywebview:  { name: "pyWebView",        desc: "Interface gráfica",         required: true  },
  pygame:     { name: "Pygame",           desc: "Reprodução de áudio",       required: true  },
  requests:   { name: "Requests",         desc: "Comunicação Firebase",      required: true  },
  pythonnet:  { name: "PythonNet (.NET)", desc: "Renderização da janela",    required: true  },
  pycaw:      { name: "PyCaw",            desc: "Duck de volume automático", required: false },
  yt_dlp:     { name: "yt-dlp",           desc: "Download YouTube",          required: false },
};
const PIP_MAP = {
  pywebview: "pywebview", pygame: "pygame", requests: "requests",
  pythonnet: "pythonnet", pycaw: "pycaw",   yt_dlp: "yt-dlp",
};

function DepsModal({ call, onClose }) {
  const [deps,       setDeps]       = useState(null);
  const [installing, setInstalling] = useState(false);
  const [log,        setLog]        = useState([]);
  const [showLog,    setShowLog]    = useState(false);

  const loadDeps = () =>
    call("get_deps_status").then(r => { if (r) setDeps(r); }).catch(() => {});

  useEffect(() => { loadDeps(); }, []);

  const addLog = (msg) => setLog(prev => [...prev.slice(-40), msg]);

  const installPkgs = async (keys) => {
    setInstalling(true); setLog([]); setShowLog(true);
    for (const key of keys) {
      addLog(`Instalando ${DEP_INFO[key]?.name || key}...`);
      try {
        const res = await call("install_dep", PIP_MAP[key] || key);
        addLog(res?.ok ? "  ✓ OK" : `  ✗ ${res?.error || "erro"}`);
      } catch (e) { addLog(`  ✗ ${e.message}`); }
    }
    addLog("Concluído — reiniciando...");
    setInstalling(false);
    loadDeps();
    setTimeout(() => call("cmd_restart"), 1800);
  };

  const miss_req = !deps ? [] : Object.keys(DEP_INFO).filter(k => !deps[k] &&  DEP_INFO[k].required);
  const miss_opt = !deps ? [] : Object.keys(DEP_INFO).filter(k => !deps[k] && !DEP_INFO[k].required);
  const all_ok   = deps && miss_req.length === 0 && miss_opt.length === 0;

  return (
    /* overlay */
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface1)", border: "1px solid var(--border)",
        borderRadius: 14, padding: 20, width: 380, maxWidth: "90vw",
        maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "1.5px",
            textTransform: "uppercase", color: "var(--muted)", flex: 1 }}>
            Dependências
          </span>
          <button onClick={loadDeps} title="Recarregar" style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 16, padding: "0 8px",
          }}>↻</button>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 18, padding: "0 4px", lineHeight: 1,
          }}>✕</button>
        </div>

        {!deps ? (
          <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", padding: 20 }}>
            Verificando...
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {Object.entries(DEP_INFO).map(([key, info]) => {
                const ok = !!deps[key];
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8,
                    background: "var(--surface2)", border: "1px solid var(--border)",
                  }}>
                    <span style={{ fontSize: 12, color: ok ? "var(--green)" : info.required ? "var(--danger)" : "#f59e0b" }}>
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
            </div>

            {miss_req.length > 0 && (
              <button onClick={() => installPkgs([...miss_req, ...miss_opt])} disabled={installing} style={{
                background: "var(--danger)", color: "white", border: "none",
                borderRadius: 8, padding: "10px 18px", cursor: installing ? "default" : "pointer",
                fontSize: 12, fontWeight: 700, opacity: installing ? 0.7 : 1,
                width: "100%", marginBottom: 8,
              }}>
                {installing ? "Instalando..." : `⬇  Instalar (${miss_req.length + miss_opt.length} pacotes)`}
              </button>
            )}

            {miss_req.length === 0 && miss_opt.length > 0 && (
              <button onClick={() => installPkgs(miss_opt)} disabled={installing} style={{
                background: "rgba(245,158,11,.1)", color: "#f59e0b",
                border: "1px solid rgba(245,158,11,.25)",
                borderRadius: 8, padding: "10px 18px", cursor: installing ? "default" : "pointer",
                fontSize: 12, fontWeight: 700, opacity: installing ? 0.7 : 1,
                width: "100%", marginBottom: 8,
              }}>
                {installing ? "Instalando..." : `⬇  Instalar Opcionais (${miss_opt.length})`}
              </button>
            )}

            {all_ok && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)",
                borderRadius: 8, fontSize: 11, color: "var(--green)",
              }}>✓ Todas as dependências instaladas</div>
            )}

            {log.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setShowLog(v => !v)} style={{
                  background: "none", border: "none", color: "var(--muted)",
                  cursor: "pointer", fontSize: 10, fontFamily: "var(--font-mono)", padding: 0, marginBottom: 4,
                }}>{showLog ? "▼" : "▶"} Log</button>
                {showLog && (
                  <div style={{
                    background: "var(--surface3)", borderRadius: 8, padding: "10px 12px",
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cyan)",
                    maxHeight: 120, overflowY: "auto", lineHeight: 1.7,
                    border: "1px solid var(--border)",
                  }}>
                    {log.map((l, i) => (
                      <div key={i} style={{
                        color: l.startsWith("  ✓") ? "var(--green)" : l.startsWith("  ✗") ? "var(--danger)" : "var(--cyan)",
                      }}>{l}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CONFIG PAGE
// ══════════════════════════════════════════════════════════════════
function SLabel({ children }) {
  return (
    <div style={{
      marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 9,
      letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)",
    }}>{children}</div>
  );
}

// Slider de volume com ícone de alto-falante
function VolumeRow({ label, hint, value, onChange }) {
  const pct = Number(value) || 0;

  const IcoSpk = () => {
    if (pct === 0) return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    );
    if (pct < 50) return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 9,
      background: "var(--surface2)", border: "1px solid var(--border)",
      marginBottom: 8,
    }}>
      <div style={{ color: "var(--muted)", flexShrink: 0 }}><IcoSpk /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{label}</div>
        <input
          type="range" min="0" max="100" value={pct}
          onChange={e => onChange(e.target.value)}
          style={{ width: "100%", accentColor: "var(--p1)", cursor: "pointer" }}
        />
        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{hint}</div>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
        color: "var(--p1)", minWidth: 36, textAlign: "right",
      }}>{pct}%</div>
    </div>
  );
}

export function ConfigPage() {
  const { state, setState, call } = useApp();
  const { config } = state;

  const [showDeps,       setShowDeps]       = useState(false);
  const [startupEnabled, setStartupEnabled] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);
  const [startupMsg,     setStartupMsg]     = useState("");
  const [playerNome,     setPlayerNome]     = useState(config?.player_nome || "");
  const [editingNome,    setEditingNome]    = useState(false);
  const nomeRef = useRef(null);

  useEffect(() => {
    call("get_startup_status").then(r => { if (r != null) setStartupEnabled(!!r); }).catch(() => {});
  }, []);

  useEffect(() => {
    setPlayerNome(config?.player_nome || "");
  }, [config?.player_nome]);

  useEffect(() => {
    if (editingNome && nomeRef.current) nomeRef.current.focus();
  }, [editingNome]);

  const update = (key, val) =>
    setState(s => ({ ...s, config: { ...s.config, [key]: val } }));

  const saveAll = () => {
    const cfg = { ...config, player_nome: playerNome };
    call("save_config", cfg).then(() => {
      setState(s => ({ ...s, config: cfg }));
      const el = document.createElement("div");
      el.textContent = "✓  Configurações salvas";
      Object.assign(el.style, {
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        background: "var(--green)", color: "#000", padding: "10px 20px",
        borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700,
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    });
  };

  const handleStartupToggle = async () => {
    setStartupLoading(true); setStartupMsg("");
    try {
      const res = await call("toggle_startup", !startupEnabled);
      if (res?.ok) { setStartupEnabled(v => !v); setStartupMsg(res.msg || ""); }
      else setStartupMsg(res?.error || "Não foi possível alterar.");
    } catch { setStartupMsg("Erro ao alterar."); }
    finally {
      setStartupLoading(false);
      setTimeout(() => setStartupMsg(""), 4000);
    }
  };

  const isError = startupMsg.toLowerCase().includes("erro") || startupMsg.includes("possível");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {showDeps && <DepsModal call={call} onClose={() => setShowDeps(false)} />}

      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--muted2)" }} />
        <span className="page-title">Configurações</span>
      </div>

      <div className="config-layout">

        {/* ── Nome do Player ── */}
        <SLabel>Player</SLabel>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 9,
          background: "var(--surface2)", border: "1px solid var(--border)",
          marginBottom: 20,
        }}>
          {/* ícone player */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8" fill="var(--muted)" stroke="none"/>
          </svg>
          {editingNome ? (
            <input
              ref={nomeRef}
              value={playerNome}
              onChange={e => setPlayerNome(e.target.value)}
              onBlur={() => setEditingNome(false)}
              onKeyDown={e => { if (e.key === "Enter") setEditingNome(false); }}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                color: "var(--text)",
              }}
            />
          ) : (
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {playerNome || "Player Principal"}
            </span>
          )}
          <button onClick={() => setEditingNome(v => !v)} title="Editar nome" style={{
            background: "none", border: "none", cursor: "pointer",
            color: editingNome ? "var(--p1)" : "var(--muted)", padding: "2px 4px",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        {/* ── Volume ── */}
        <SLabel>Volume</SLabel>
        <VolumeRow
          label="Volume Anúncio"
          hint="Volume dos anúncios (0–100%)"
          value={config?.volume_anuncio ?? 100}
          onChange={v => update("volume_anuncio", v)}
        />
        <VolumeRow
          label="Volume Outros Apps"
          hint="Volume dos outros apps ao tocar (0–100%)"
          value={config?.volume_outros ?? 10}
          onChange={v => update("volume_outros", v)}
        />

        {/* Fade duck */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 9,
          background: "var(--surface2)", border: "1px solid var(--border)",
          marginBottom: 20,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <path d="M2 12h4M18 12h4M12 2v4M12 18v4"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              Fade Duck
            </div>
            <input
              type="range" min="200" max="3000" step="100"
              value={config?.duck_fade_ms ?? 1200}
              onChange={e => update("duck_fade_ms", e.target.value)}
              style={{ width: "100%", accentColor: "var(--p1)", cursor: "pointer" }}
            />
            <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
              Duração do fade de volume (200–3000 ms)
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
            color: "var(--p1)", minWidth: 50, textAlign: "right",
          }}>{config?.duck_fade_ms ?? 1200}ms</div>
        </div>

        {/* ── Sistema ── */}
        <SLabel>Sistema</SLabel>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 9,
          background: "var(--surface2)", border: "1px solid var(--border)",
          marginBottom: 8,
        }}>
          {/* ícone */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={startupEnabled ? "var(--green)" : "var(--muted)"} strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15A9 9 0 1 1 5.64 5.64L12 12"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
              Iniciar com o Sistema
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
              {startupEnabled ? "PlayAds abre automaticamente com o Windows." : "Desativado."}
            </div>
            {startupMsg && (
              <div style={{ marginTop: 3, fontSize: 9, fontFamily: "var(--font-mono)",
                color: isError ? "var(--danger)" : "var(--green)" }}>{startupMsg}</div>
            )}
          </div>
          {/* Toggle */}
          <button onClick={handleStartupToggle} disabled={startupLoading} style={{
            position: "relative", width: 44, height: 24, borderRadius: 99, flexShrink: 0,
            border: "none", cursor: startupLoading ? "default" : "pointer",
            background: startupEnabled ? "var(--green)" : "var(--surface3)",
            transition: "background .2s", opacity: startupLoading ? 0.7 : 1,
          }}>
            <span style={{
              position: "absolute", top: 2,
              left: startupEnabled ? "calc(100% - 21px)" : 2,
              width: 20, height: 20, borderRadius: "50%",
              background: "white", transition: "left .2s",
              boxShadow: "0 1px 4px rgba(0,0,0,.35)",
            }} />
          </button>
        </div>

        {/* Dependências — botão com ícone */}
        <button onClick={() => setShowDeps(true)} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 9, width: "100%", textAlign: "left",
          background: "var(--surface2)", border: "1px solid var(--border)",
          cursor: "pointer", marginBottom: 20,
          transition: "border-color .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--p1)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Dependências</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
              Verificar e instalar pacotes do sistema
            </div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Salvar */}
        <button className="btn btn-primary" onClick={saveAll} style={{ marginBottom: 28 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Salvar Configurações
        </button>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ACCOUNT PAGE
// ══════════════════════════════════════════════════════════════════
const PLATFORMS = [
  {
    id: "spotify", name: "Spotify", url: "https://open.spotify.com",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  },
  {
    id: "youtube_music", name: "YouTube Music", url: "https://music.youtube.com",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    id: "deezer", name: "Deezer", url: "https://www.deezer.com",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0090"><path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.03h5.19V8.38H6.27zm6.27 0v3.03h5.19V8.38h-5.19zm6.27 0v3.03H24V8.38h-5.19zM6.27 12.6v3.03h5.19V12.6H6.27zm6.27 0v3.03h5.19V12.6h-5.19zm6.27 0v3.03H24V12.6h-5.19zM0 16.81v3.03h5.19v-3.03H0zm6.27 0v3.03h5.19v-3.03H6.27zm6.27 0v3.03h5.19v-3.03h-5.19zm6.27 0v3.03H24v-3.03h-5.19z"/></svg>,
  },
  {
    id: "amazon_music", name: "Amazon Music", url: "https://music.amazon.com",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#00A8E1"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.706c-.209.189-.512.201-.745.076-1.051-.872-1.238-1.276-1.814-2.108-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.642-4.731-4.927 0-2.565 1.391-4.309 3.37-5.161 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.578-1.124-.816-1.776-.816-1.208 0-2.281.618-2.545 1.9-.053.284-.26.564-.547.578l-3.064-.331c-.259-.056-.547-.266-.472-.661C5.97 1.739 9.089.5 11.863.5c1.416 0 3.267.377 4.383 1.452 1.416 1.322 1.28 3.085 1.28 5.007v4.531c0 1.362.564 1.961 1.096 2.698.187.261.228.574-.011.769-.594.495-1.648 1.413-2.229 1.929l-.238-.09z"/></svg>,
  },
];

const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function SectionLabel({ children, style }) {
  return (
    <div style={{
      marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 9,
      letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)",
      ...style,
    }}>{children}</div>
  );
}

export function AccountPage() {
  const { state, call } = useApp();
  const { account, cacheInfo } = state;

  const disconnect = () => {
    if (window.confirm("Isso irá apagar todos os dados locais e remover o início automático. Continuar?"))
      call("cmd_disconnect");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--p1)" }} />
        <span className="page-title">Conta</span>
        <span className="page-sub">Ativação e configurações</span>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <div className="account-layout">

          {/* ── Conta Ativada ─────────────────────────────── */}
          <SectionLabel>Conta Ativada</SectionLabel>
          <div className="account-info-grid" style={{ marginBottom: 24 }}>
            {[
              ["E-mail",  account?.email  || "—"],
              ["Código",  account?.codigo || "—"],
              ["Status",  account?.connected ? "● Ativo" : "Inativo"],
              ["Versão",  "7.0"],
            ].map(([l, v]) => (
              <div key={l} className="info-item">
                <div className="info-item-label">{l}</div>
                <div className="info-item-value"
                  style={{ color: l === "Status" ? "var(--green)" : undefined }}>{v}</div>
              </div>
            ))}
          </div>

          {/* ── Players de Música ─────────────────────────── */}
          <SectionLabel>Players de Música</SectionLabel>
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            {PLATFORMS.map(p => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                title={p.name}
                style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: "var(--surface3)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", transition: "border-color .15s, background .15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--surface2)";
                  e.currentTarget.style.borderColor = "var(--border-2, #444)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--surface3)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                {p.icon}
              </a>
            ))}
          </div>

          {/* ── Desconectar ────────────────────────────────── */}
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