import { useState, useRef, useEffect } from "react"

// ─── Loading Page exibida enquanto o player reinicia ─────────────────────────
function RestartingPage() {
  const [dots, setDots]         = useState("")
  const [phase, setPhase]       = useState(0)
  const [progress, setProgress] = useState(0)

  const phases = [
    "Salvando ativação",
    "Reiniciando o player",
    "Abrindo PlayAds",
  ]

  useEffect(() => {
    const dotsTimer = setInterval(() =>
      setDots(d => d.length >= 3 ? "" : d + "."), 400)

    const t1 = setTimeout(() => setPhase(1), 1200)
    const t2 = setTimeout(() => setPhase(2), 2800)

    let prog = 0
    const progTimer = setInterval(() => {
      prog += Math.random() * 3.5 + 0.5
      if (prog > 95) prog = 95
      setProgress(Math.round(prog))
    }, 100)

    return () => {
      clearInterval(dotsTimer); clearInterval(progTimer)
      clearTimeout(t1); clearTimeout(t2)
    }
  }, [])

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg, #080612)", gap: 32,
    }}>
      {/* Logo + anel giratório */}
      <div style={{ position: "relative", width: 92, height: 92,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "linear-gradient(135deg, var(--p1, #8b5cf6), #6d28d9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "pulseGlow 1.5s ease-in-out infinite",
        }}>
          <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </div>
        <svg style={{ position: "absolute", inset: 0, animation: "spinRing 2s linear infinite" }}
          width="92" height="92" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r="42" fill="none"
            stroke="rgba(139,92,246,0.35)" strokeWidth="2.5"
            strokeDasharray="55 210" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Título + fase */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700,
          color: "var(--text, white)", marginBottom: 6 }}>PlayAds</div>
        <div style={{
          fontSize: 12, color: "var(--p1, #8b5cf6)",
          fontFamily: "var(--font-mono, monospace)",
          minWidth: 220, textAlign: "center", letterSpacing: ".5px",
        }}>
          {phases[phase]}{dots}
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{
        width: 240, height: 3, borderRadius: 99,
        background: "rgba(255,255,255,0.06)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg, var(--p1,#8b5cf6), var(--cyan,#22d3ee))",
          width: `${progress}%`, transition: "width 0.12s ease",
          boxShadow: "0 0 8px rgba(139,92,246,0.8)",
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            opacity: phase >= i ? 1 : 0.3, transition: "opacity 0.4s",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: phase > i ? "var(--green,#34d399)"
                        : phase === i ? "var(--p1,#8b5cf6)"
                        : "rgba(255,255,255,0.08)",
              transition: "background 0.3s",
            }}>
              {phase > i ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : phase === i ? (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white",
                  animation: "pulseDot 1s ease-in-out infinite" }} />
              ) : (
                <div style={{ width: 5, height: 5, borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)" }} />
              )}
            </div>
            <span style={{
              fontSize: 11,
              color: phase >= i ? "var(--text,white)" : "var(--muted,#555)",
              fontFamily: "var(--font-mono, monospace)",
              transition: "color 0.3s",
            }}>{p}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 30px rgba(139,92,246,.4); }
          50%      { box-shadow: 0 0 55px rgba(139,92,246,.75); }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.65); }
        }
      `}</style>
    </div>
  )
}

// ─── ActivationScreen principal ───────────────────────────────────────────────
export default function ActivationScreen({ onActivated }) {
  const [codigo,     setCodigo]     = useState("")
  const [email,      setEmail]      = useState("")
  const [senha,      setSenha]      = useState("")
  const [status,     setStatus]     = useState({ msg: "", type: "" })
  const [loading,    setLoading]    = useState(false)
  const [restarting, setRestarting] = useState(false)
  const emailRef = useRef(null)
  const senhaRef = useRef(null)

  const fmtCode = (v) => {
    const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "")
    let out = "PLAY"
    if (raw.startsWith("PLAY")) {
      const rest = raw.slice(4).slice(0, 8)
      if (rest.length > 4)      out += `-${rest.slice(0, 4)}-${rest.slice(4)}`
      else if (rest.length > 0) out += `-${rest}`
    } else {
      const rest = raw.slice(0, 8)
      if (rest.length > 4)      out += `-${rest.slice(0, 4)}-${rest.slice(4)}`
      else if (rest.length > 0) out += `-${rest}`
    }
    return out
  }

  const handleActivate = async () => {
    if (codigo.length < 12) {
      setStatus({ msg: "Digite o código completo (PLAY-XXXX-XXXX)", type: "warn" }); return
    }
    if (!email.includes("@")) {
      setStatus({ msg: "E-mail inválido", type: "warn" }); return
    }
    if (senha.length < 6) {
      setStatus({ msg: "Senha mínima de 6 caracteres", type: "warn" }); return
    }

    setLoading(true)
    setStatus({ msg: "Verificando no servidor...", type: "info" })

    try {
      if (window.pywebview?.api) {
        const res = await window.pywebview.api.activate(codigo, email, senha)
        if (res?.ok) {
          // 1. Mostra loading page imediatamente
          setRestarting(true)

          // 2. Após 1s dispara o restart no backend
          setTimeout(async () => {
            try {
              await window.pywebview.api.cmd_restart()
              // cmd_restart normalmente mata o processo antes de responder.
              // Se responder mesmo assim, aguarda mais e usa fallback:
              setTimeout(() => onActivated(), 4000)
            } catch (_) {
              // Normal — processo encerrou antes de retornar
              // A loading page fica visível até a janela fechar
            }
          }, 1000)
        } else {
          setStatus({ msg: res?.error || "Credenciais inválidas.", type: "err" })
          setLoading(false)
        }
      } else {
        // Dev mode sem pywebview
        setRestarting(true)
        setTimeout(() => onActivated(), 3500)
      }
    } catch (e) {
      setStatus({ msg: `Erro: ${e.message}`, type: "err" })
      setLoading(false)
    }
  }

  // Enquanto reinicia, mostra só a loading page
  if (restarting) return <RestartingPage />

  const statusColor = {
    ok:   "var(--green)",
    err:  "var(--danger)",
    warn: "var(--warn)",
    info: "var(--muted2)",
  }[status.type] || "transparent"

  return (
    <div className="activation-screen">
      <div className="activation-card">
        <div className="activation-logo">
          <div className="logo-big">
            <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </div>
          <div>
            <h1>PlayAds</h1>
            <p>v7.0 — Player de Anúncios</p>
          </div>
        </div>

        <div className="activation-title">Ativar Player</div>
        <div className="activation-sub">
          Digite o código do painel web, seu e-mail e senha para ativar este player.
        </div>

        <div className="field-group">
          <label>Código de Ativação</label>
          <input
            className="act-input code"
            placeholder="PLAY-XXXX-XXXX"
            value={codigo}
            onChange={(e) => setCodigo(fmtCode(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && emailRef.current?.focus()}
            maxLength={14}
            autoFocus
          />
        </div>

        <div className="field-group">
          <label>E-mail</label>
          <input
            ref={emailRef}
            className="act-input"
            placeholder="seu@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && senhaRef.current?.focus()}
          />
        </div>

        <div className="field-group">
          <label>Senha</label>
          <input
            ref={senhaRef}
            className="act-input"
            placeholder="••••••••"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleActivate()}
          />
        </div>

        {status.msg && (
          <div className="act-status" style={{ color: statusColor }}>
            {status.msg}
          </div>
        )}

        <button className="act-btn" onClick={handleActivate} disabled={loading}>
          {loading ? "Validando..." : "Ativar Agora →"}
        </button>

        <a
          className="act-link"
          onClick={() => window.pywebview?.api?.open_web()}
          style={{ cursor: "pointer" }}
        >
          Abrir painel web →
        </a>
      </div>
    </div>
  )
}