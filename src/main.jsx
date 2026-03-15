import { StrictMode, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import ActivationScreen from "./pages/ActivationScreen.jsx"
import "./App.css"

function Root() {
  const [ready, setReady]         = useState(false)
  const [activated, setActivated] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Tenta detectar pywebview por até 2s
    let attempts = 0
    const check = () => {
      attempts++
      if (window.pywebview?.api) {
        // Modo desktop — pywebview presente
        setIsDesktop(true)
        window.pywebview.api.get_init_info().then((info) => {
          const hasAccount = info?.email && info.email !== "" && info.email !== "—"
          setActivated(hasAccount)
          setReady(true)
        }).catch(() => { setActivated(false); setReady(true) })
      } else if (attempts < 10) {
        // Ainda aguardando pywebview injetar a api
        setTimeout(check, 200)
      } else {
        // Modo browser — sem pywebview
        setIsDesktop(false)
        setActivated(false)
        setReady(true)
      }
    }
    setTimeout(check, 150)
  }, [])

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#080612",
        color: "#7a6fa0", fontFamily: "Consolas, monospace", fontSize: 12, gap: 12,
      }}>
        <span style={{
          display: "inline-block", width: 16, height: 16,
          border: "2px solid #2a2347", borderTopColor: "#8b5cf6",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        Iniciando PlayAds...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Modo browser — mostra aviso ou tela de ativação demo
  if (!isDesktop) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080612",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Consolas, monospace", padding: 24,
      }}>
        <div style={{
          background: "#110e20", border: "1px solid #332c57",
          borderRadius: 16, padding: "40px 36px", maxWidth: 400, width: "100%",
          textAlign: "center",
        }}>
          {/* Logo */}
          <div style={{
            width: 56, height: 56, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </div>
          <div style={{ fontFamily: "Segoe UI", fontSize: 22, fontWeight: 800, color: "#f0eaff", marginBottom: 8 }}>
            PlayAds
          </div>
          <div style={{ fontSize: 12, color: "#7a6fa0", marginBottom: 24, lineHeight: 1.6 }}>
            Este app precisa ser aberto pelo<br />
            <strong style={{ color: "#b48eff" }}>PlayAds.exe</strong> no computador do player.
          </div>
          <div style={{
            background: "#1d1833", border: "1px solid #2a2347",
            borderRadius: 8, padding: "12px 16px",
            fontSize: 11, color: "#9d92bf", lineHeight: 1.7,
          }}>
            <div>✓ Baixe o <strong style={{color:"#f0eaff"}}>PlayAds.exe</strong></div>
            <div>✓ Execute no PC do player</div>
            <div>✓ Gerencie pelo painel web</div>
          </div>
        </div>
      </div>
    )
  }

  return activated
    ? <App />
    : <ActivationScreen onActivated={() => setActivated(true)} />
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
