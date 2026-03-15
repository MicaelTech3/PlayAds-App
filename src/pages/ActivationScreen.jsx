import { useState, useRef } from "react"

export default function ActivationScreen({ onActivated }) {
  const [codigo, setCodigo] = useState("")
  const [email,  setEmail]  = useState("")
  const [senha,  setSenha]  = useState("")
  const [status, setStatus] = useState({ msg: "", type: "" })
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)
  const senhaRef = useRef(null)

  const fmtCode = (v) => {
    const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "")
    let out = "PLAY"
    if (raw.startsWith("PLAY")) {
      const rest = raw.slice(4).slice(0, 8)
      if (rest.length > 4) out += `-${rest.slice(0, 4)}-${rest.slice(4)}`
      else if (rest.length > 0) out += `-${rest}`
    } else {
      const rest = raw.slice(0, 8)
      if (rest.length > 4) out += `-${rest.slice(0, 4)}-${rest.slice(4)}`
      else if (rest.length > 0) out += `-${rest}`
    }
    return out
  }

  const handleActivate = async () => {
    if (codigo.length < 12) { setStatus({ msg: "Digite o código completo (PLAY-XXXX-XXXX)", type: "warn" }); return }
    if (!email.includes("@")) { setStatus({ msg: "E-mail inválido", type: "warn" }); return }
    if (senha.length < 6)    { setStatus({ msg: "Senha mínima de 6 caracteres", type: "warn" }); return }

    setLoading(true)
    setStatus({ msg: "Verificando no servidor...", type: "info" })

    try {
      if (window.pywebview?.api) {
        const res = await window.pywebview.api.activate(codigo, email, senha)
        if (res?.ok) {
          setStatus({ msg: `✓ Ativado! Conta: ${res.email}`, type: "ok" })
          setTimeout(() => onActivated(), 1200)
        } else {
          setStatus({ msg: res?.error || "Credenciais inválidas.", type: "err" })
          setLoading(false)
        }
      } else {
        // Dev mock
        setStatus({ msg: "✓ Dev mode — ativado", type: "ok" })
        setTimeout(() => onActivated(), 800)
      }
    } catch (e) {
      setStatus({ msg: `Erro: ${e.message}`, type: "err" })
      setLoading(false)
    }
  }

  const statusColor = {
    ok: "var(--green)", err: "var(--danger)", warn: "var(--warn)", info: "var(--muted2)",
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
