// src/pages/AccountPage.jsx
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

// ─── Ícones ───────────────────────────────────────────────────────────────────
const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IcoLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IcoUnlink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

// ─── Plataformas de música ────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "spotify",
    name: "Spotify",
    description: "Pausa o Spotify automaticamente ao tocar anúncios e retoma depois",
    color: "#1DB954",
    bg: "rgba(29,185,84,0.12)",
    border: "rgba(29,185,84,0.3)",
    wip: false,
    note: "O duck automático via pycaw já reduz o volume do Spotify. Esta integração adiciona pause/resume preciso via API oficial do Spotify.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  {
    id: "youtube_music",
    name: "YouTube Music",
    description: "Reduz o volume do YouTube Music durante reprodução de anúncios",
    color: "#FF0000",
    bg: "rgba(255,0,0,0.1)",
    border: "rgba(255,0,0,0.25)",
    wip: true,
    note: "O duck automático via pycaw já funciona com YouTube Music. Integração direta com a API está em desenvolvimento.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: "deezer",
    name: "Deezer",
    description: "Integração com Deezer para controle durante anúncios",
    color: "#FF0090",
    bg: "rgba(255,0,144,0.1)",
    border: "rgba(255,0,144,0.25)",
    wip: true,
    note: "O duck automático via pycaw já funciona com Deezer. Integração via API planejada para versão futura.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0090">
        <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.03h5.19V8.38H6.27zm6.27 0v3.03h5.19V8.38h-5.19zm6.27 0v3.03H24V8.38h-5.19zM6.27 12.6v3.03h5.19V12.6H6.27zm6.27 0v3.03h5.19V12.6h-5.19zm6.27 0v3.03H24V12.6h-5.19zM0 16.81v3.03h5.19v-3.03H0zm6.27 0v3.03h5.19v-3.03H6.27zm6.27 0v3.03h5.19v-3.03h-5.19zm6.27 0v3.03H24v-3.03h-5.19z"/>
      </svg>
    ),
  },
  {
    id: "amazon_music",
    name: "Amazon Music",
    description: "Controle do Amazon Music durante reprodução de anúncios",
    color: "#00A8E1",
    bg: "rgba(0,168,225,0.1)",
    border: "rgba(0,168,225,0.25)",
    wip: true,
    note: "O duck automático via pycaw já funciona com Amazon Music. A API pública da Amazon tem acesso muito restrito, tornando integração direta difícil.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#00A8E1">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.706c-.209.189-.512.201-.745.076-1.051-.872-1.238-1.276-1.814-2.108-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.642-4.731-4.927 0-2.565 1.391-4.309 3.37-5.161 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.578-1.124-.816-1.776-.816-1.208 0-2.281.618-2.545 1.9-.053.284-.26.564-.547.578l-3.064-.331c-.259-.056-.547-.266-.472-.661C5.97 1.739 9.089.5 11.863.5c1.416 0 3.267.377 4.383 1.452 1.416 1.322 1.28 3.085 1.28 5.007v4.531c0 1.362.564 1.961 1.096 2.698.187.261.228.574-.011.769-.594.495-1.648 1.413-2.229 1.929l-.238-.09z"/>
      </svg>
    ),
  },
];

// ─── Card de integração ───────────────────────────────────────────────────────
function IntegrationCard({ platform, connected, onConnect, onDisconnect }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div style={{
      background: "var(--surface2)",
      border: `1px solid ${connected ? platform.border : "var(--border)"}`,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      transition: "border-color 0.2s",
    }}>
      {/* Ícone */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0, marginTop: 2,
        background: connected ? platform.bg : "var(--surface3)",
        border: `1px solid ${connected ? platform.border : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {platform.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            {platform.name}
          </span>
          {platform.wip && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
              background: "rgba(251,191,36,0.12)", color: "#f59e0b",
              border: "1px solid rgba(251,191,36,0.25)", fontFamily: "var(--font-mono)",
            }}>
              EM BREVE
            </span>
          )}
          {connected && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
              background: platform.bg, color: platform.color,
              border: `1px solid ${platform.border}`, fontFamily: "var(--font-mono)",
            }}>
              ● CONECTADO
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>
          {platform.description}
        </div>
        {showNote && (
          <div style={{
            marginTop: 8, fontSize: 11, color: "var(--muted2)", lineHeight: 1.5,
            padding: "8px 10px", background: "var(--surface3)", borderRadius: 7,
            border: "1px solid var(--border)",
          }}>
            ℹ️ {platform.note}
          </div>
        )}
      </div>

      {/* Botões */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center", marginTop: 2 }}>
        <button
          onClick={() => setShowNote(v => !v)}
          title="Mais informações"
          style={{
            background: "var(--surface3)", border: "1px solid var(--border)",
            borderRadius: 7, padding: "6px 8px", cursor: "pointer",
            color: showNote ? "var(--p1)" : "var(--muted)",
            display: "flex", alignItems: "center",
          }}
        >
          <IcoInfo />
        </button>

        {connected ? (
          <button
            onClick={() => onDisconnect(platform.id)}
            style={{
              background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
              borderRadius: 7, padding: "6px 12px", cursor: "pointer",
              color: "#f43f5e", fontSize: 11, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <IcoUnlink /> Desconectar
          </button>
        ) : (
          <button
            onClick={() => !platform.wip && onConnect(platform.id)}
            disabled={platform.wip}
            title={platform.wip ? "Em desenvolvimento" : `Conectar ${platform.name}`}
            style={{
              background: platform.wip ? "var(--surface3)" : platform.bg,
              border: `1px solid ${platform.wip ? "var(--border)" : platform.border}`,
              borderRadius: 7, padding: "6px 12px",
              cursor: platform.wip ? "not-allowed" : "pointer",
              color: platform.wip ? "var(--muted)" : platform.color,
              fontSize: 11, fontWeight: 600, opacity: platform.wip ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <IcoLink /> {platform.wip ? "Em breve" : "Conectar"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── AccountPage ──────────────────────────────────────────────────────────────
export function AccountPage() {
  const { state, call } = useApp();
  const { account, cacheInfo } = state;

  const LOCAL_DIR = window.__playads_local_dir || "local/";

  const [startupEnabled, setStartupEnabled] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);
  const [startupMsg,     setStartupMsg]     = useState("");
  const [connectedPlats, setConnectedPlats] = useState([]);

  useEffect(() => {
    call("get_startup_status")
      .then(res => { if (res != null) setStartupEnabled(!!res); })
      .catch(() => {});
  }, []);

  const handleStartupToggle = async () => {
    setStartupLoading(true);
    setStartupMsg("");
    try {
      const res = await call("toggle_startup", !startupEnabled);
      if (res?.ok) {
        setStartupEnabled(v => !v);
        setStartupMsg(res.msg || "");
      } else {
        setStartupMsg(res?.error || "Não foi possível alterar.");
      }
    } catch (e) {
      setStartupMsg("Erro ao alterar configuração.");
    } finally {
      setStartupLoading(false);
      setTimeout(() => setStartupMsg(""), 5000);
    }
  };

  const handleConnect = async (platformId) => {
    try {
      const res = await call("connect_platform", platformId);
      if (res?.ok) setConnectedPlats(prev => [...prev, platformId]);
      else alert(res?.error || "Não foi possível conectar.");
    } catch (_) { alert("Erro ao conectar plataforma."); }
  };

  const handleDisconnect = async (platformId) => {
    try {
      await call("disconnect_platform", platformId);
      setConnectedPlats(prev => prev.filter(p => p !== platformId));
    } catch (_) {}
  };

  const disconnect = () => {
    if (window.confirm(
      "Isso irá apagar todos os dados locais e remover o início automático.\nDeseja continuar?"
    )) {
      call("cmd_disconnect");
    }
  };

  const isError = startupMsg.toLowerCase().includes("erro") || startupMsg.includes("possível");

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
            ].map(([l, val]) => (
              <div key={l} className="info-item">
                <div className="info-item-label">{l}</div>
                <div className="info-item-value"
                  style={{ color: l === "Status" ? "var(--green)" : undefined }}>
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* ── Pasta Local ───────────────────────────────── */}
          <SectionLabel>Pasta Local</SectionLabel>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cyan)", marginBottom: 6 }}>
                {LOCAL_DIR}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted2)" }}>
                {cacheInfo?.files ?? 0} arquivo(s) · {((cacheInfo?.size || 0) / 1048576).toFixed(1)} MB
              </div>
            </div>
          </div>

          {/* ── Iniciar com o Sistema ─────────────────────── */}
          <SectionLabel>Sistema</SectionLabel>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Ícone */}
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: startupEnabled ? "rgba(52,211,153,0.12)" : "var(--surface3)",
                  border: `1px solid ${startupEnabled ? "rgba(52,211,153,0.3)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.25s",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={startupEnabled ? "var(--green)" : "var(--muted)"}
                    strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15A9 9 0 1 1 5.64 5.64L12 12"/>
                  </svg>
                </div>

                {/* Texto */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                    Iniciar com o Sistema
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>
                    {startupEnabled
                      ? "O PlayAds abrirá automaticamente ao ligar o computador."
                      : "Ative para o PlayAds iniciar automaticamente com o Windows."}
                  </div>
                  {startupMsg && (
                    <div style={{
                      marginTop: 5, fontSize: 11, fontFamily: "var(--font-mono)",
                      color: isError ? "var(--danger)" : "var(--green)",
                    }}>
                      {startupMsg}
                    </div>
                  )}
                </div>

                {/* Toggle */}
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

              {/* Nota técnica */}
              <div style={{
                marginTop: 12, padding: "8px 12px",
                background: "var(--surface3)", borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.6,
              }}>
                💡 Windows: pasta <span style={{ color: "var(--cyan)" }}>Shell:startup</span> (PlayAds.bat)
                &nbsp;·&nbsp;
                macOS: <span style={{ color: "var(--cyan)" }}>~/Library/LaunchAgents/</span>
                &nbsp;·&nbsp;
                Linux: <span style={{ color: "var(--cyan)" }}>~/.config/autostart/</span>
              </div>
            </div>
          </div>

          {/* ── Integrar Contas ────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Integrar Contas de Música</SectionLabel>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 99,
              background: "rgba(139,92,246,0.12)", color: "var(--p1)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}>
              {connectedPlats.length} conectada{connectedPlats.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{
            marginBottom: 14, padding: "10px 14px",
            background: "rgba(34,211,238,0.06)", borderRadius: 10,
            border: "1px solid rgba(34,211,238,0.15)",
            fontSize: 11, color: "var(--muted2)", lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--cyan)" }}>Duck automático já ativo:</strong> o PlayAds
            reduz o volume de todos os apps automaticamente via pycaw ao tocar anúncios.
            As integrações abaixo adicionam controle ainda mais preciso (pause/resume) para cada plataforma.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {PLATFORMS.map(p => (
              <IntegrationCard
                key={p.id}
                platform={p}
                connected={connectedPlats.includes(p.id)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>

          {/* ── Desconectar ────────────────────────────────── */}
          <div className="warn-banner" style={{ marginBottom: 16 }}>
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

function SectionLabel({ children, style }) {
  return (
    <div style={{
      marginBottom: 8,
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "var(--muted)",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default AccountPage;