// src/components/DepsSection.jsx
// Seção de dependências para usar dentro do ConfigPage
import { useState, useEffect } from "react"

const DEP_INFO = {
  pywebview:  { name: "pyWebView",        desc: "Interface gráfica do player",    required: true  },
  pygame:     { name: "Pygame",           desc: "Reprodução de áudio",            required: true  },
  requests:   { name: "Requests",         desc: "Comunicação com Firebase",       required: true  },
  pythonnet:  { name: "PythonNet (.NET)", desc: "Renderização da interface",      required: true  },
  pycaw:      { name: "PyCaw",            desc: "Duck de volume automático",      required: false },
  yt_dlp:     { name: "yt-dlp",           desc: "Download de áudio do YouTube",   required: false },
}

const PIP_MAP = {
  pywebview: "pywebview",
  pygame:    "pygame",
  requests:  "requests",
  pythonnet: "pythonnet",
  pycaw:     "pycaw",
  yt_dlp:    "yt-dlp",
}

export function DepsSection({ call }) {
  const [deps,       setDeps]       = useState(null)
  const [installing, setInstalling] = useState(false)
  const [log,        setLog]        = useState([])
  const [expanded,   setExpanded]   = useState(false)

  const loadDeps = async () => {
    try {
      const res = await call("get_deps_status")
      if (res) setDeps(res)
    } catch (_) {}
  }

  useEffect(() => { loadDeps() }, [])

  const addLog = (msg) => setLog(prev => [...prev.slice(-30), msg])

  const installAll = async (packages) => {
    setInstalling(true)
    setLog([])
    setExpanded(true)
    try {
      for (const pkg of packages) {
        addLog(`Instalando ${DEP_INFO[pkg]?.name || pkg}...`)
        const res = await call("install_dep", PIP_MAP[pkg] || pkg)
        if (res?.ok) addLog(`  ✓ ${DEP_INFO[pkg]?.name || pkg} instalado!`)
        else         addLog(`  ✗ Falha: ${res?.error || "erro desconhecido"}`)
      }
      addLog("Concluído. Reiniciando player para aplicar...")
      setTimeout(() => call("cmd_restart"), 1500)
    } catch (e) {
      addLog(`Erro: ${e.message}`)
    } finally {
      setInstalling(false)
      loadDeps()
    }
  }

  if (!deps) return (
    <div style={{ padding: "14px 0", color: "var(--muted)", fontSize: 12 }}>
      Carregando status das dependências...
    </div>
  )

  const missing_required = Object.entries(deps)
    .filter(([k, v]) => !v && DEP_INFO[k]?.required)
    .map(([k]) => k)

  const missing_optional = Object.entries(deps)
    .filter(([k, v]) => !v && !DEP_INFO[k]?.required)
    .map(([k]) => k)

  const all_ok = missing_required.length === 0 && missing_optional.length === 0

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header da seção */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px",
          textTransform: "uppercase", color: "var(--muted)",
        }}>
          Dependências do Sistema
        </div>
        {!all_ok && (
          <span style={{
            fontSize: 9, padding: "2px 7px", borderRadius: 99,
            background: missing_required.length > 0 ? "rgba(244,63,94,0.12)" : "rgba(245,158,11,0.12)",
            color: missing_required.length > 0 ? "var(--danger)" : "#f59e0b",
            border: `1px solid ${missing_required.length > 0 ? "rgba(244,63,94,0.25)" : "rgba(245,158,11,0.25)"}`,
            fontFamily: "var(--font-mono)", fontWeight: 700,
          }}>
            {missing_required.length > 0 ? "FALTANDO" : "OPCIONAL"}
          </span>
        )}
      </div>

      {/* Lista de deps */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-body" style={{ padding: "10px 14px" }}>
          {Object.entries(DEP_INFO).map(([key, info]) => {
            const installed = deps[key]
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "6px 0",
                borderBottom: "1px solid var(--border)",
                opacity: installed ? 1 : 0.85,
              }}>
                <span style={{
                  fontSize: 12,
                  color: installed ? "var(--green)" : info.required ? "var(--danger)" : "#f59e0b",
                }}>
                  {installed ? "●" : "○"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                    {info.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{info.desc}</div>
                </div>
                <span style={{
                  fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 6px",
                  borderRadius: 99,
                  background: installed ? "rgba(52,211,153,0.1)"
                    : info.required ? "rgba(244,63,94,0.1)" : "rgba(245,158,11,0.1)",
                  color: installed ? "var(--green)"
                    : info.required ? "var(--danger)" : "#f59e0b",
                  border: `1px solid ${installed ? "rgba(52,211,153,0.2)"
                    : info.required ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                }}>
                  {installed ? "OK" : info.required ? "FALTA" : "OPCIONAL"}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botões de instalar */}
      {missing_required.length > 0 && (
        <button
          onClick={() => installAll([...missing_required, ...missing_optional])}
          disabled={installing}
          style={{
            background: "var(--danger)", color: "white", border: "none",
            borderRadius: 8, padding: "10px 18px", cursor: installing ? "default" : "pointer",
            fontSize: 12, fontWeight: 700, opacity: installing ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
          }}
        >
          {installing ? "Instalando..." : `⬇ Instalar Dependências Obrigatórias (${missing_required.length})`}
        </button>
      )}

      {missing_required.length === 0 && missing_optional.length > 0 && (
        <button
          onClick={() => installAll(missing_optional)}
          disabled={installing}
          style={{
            background: "rgba(245,158,11,0.1)", color: "#f59e0b",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 8, padding: "10px 18px", cursor: installing ? "default" : "pointer",
            fontSize: 12, fontWeight: 700, opacity: installing ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
          }}
        >
          {installing ? "Instalando..." : `⬇ Instalar Opcionais (${missing_optional.length})`}
        </button>
      )}

      {all_ok && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: 8, fontSize: 11, color: "var(--green)",
        }}>
          ✓ Todas as dependências estão instaladas
        </div>
      )}

      {/* Log de instalação */}
      {log.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setExpanded(v => !v)} style={{
            background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
            fontSize: 10, fontFamily: "var(--font-mono)", padding: 0, marginBottom: 4,
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
  )
}