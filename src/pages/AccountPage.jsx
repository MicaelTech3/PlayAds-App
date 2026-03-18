// src/pages/AccountPage.jsx
import { useApp } from "../context/AppContext";

const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const PLATFORMS = [
  {
    id: "spotify",
    name: "Spotify",
    url: "https://open.spotify.com",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
  },
  {
    id: "youtube_music",
    name: "YouTube Music",
    url: "https://music.youtube.com",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: "deezer",
    name: "Deezer",
    url: "https://www.deezer.com",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0090">
        <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.03h5.19V8.38H6.27zm6.27 0v3.03h5.19V8.38h-5.19zm6.27 0v3.03H24V8.38h-5.19zM6.27 12.6v3.03h5.19V12.6H6.27zm6.27 0v3.03h5.19V12.6h-5.19zm6.27 0v3.03H24V12.6h-5.19zM0 16.81v3.03h5.19v-3.03H0zm6.27 0v3.03h5.19v-3.03H6.27zm6.27 0v3.03h5.19v-3.03h-5.19zm6.27 0v3.03H24v-3.03h-5.19z"/>
      </svg>
    ),
  },
  {
    id: "amazon_music",
    name: "Amazon Music",
    url: "https://music.amazon.com",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#00A8E1">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.706c-.209.189-.512.201-.745.076-1.051-.872-1.238-1.276-1.814-2.108-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.642-4.731-4.927 0-2.565 1.391-4.309 3.37-5.161 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.578-1.124-.816-1.776-.816-1.208 0-2.281.618-2.545 1.9-.053.284-.26.564-.547.578l-3.064-.331c-.259-.056-.547-.266-.472-.661C5.97 1.739 9.089.5 11.863.5c1.416 0 3.267.377 4.383 1.452 1.416 1.322 1.28 3.085 1.28 5.007v4.531c0 1.362.564 1.961 1.096 2.698.187.261.228.574-.011.769-.594.495-1.648 1.413-2.229 1.929l-.238-.09z"/>
      </svg>
    ),
  },
];

function SectionLabel({ children }) {
  return (
    <div style={{
      marginBottom: 8,
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "var(--muted)",
    }}>
      {children}
    </div>
  );
}

export function AccountPage() {
  const { state, call } = useApp();
  const { account } = state;

  const disconnect = () => {
    if (window.confirm(
      "Isso irá apagar todos os dados locais e remover o início automático.\nDeseja continuar?"
    )) call("cmd_disconnect");
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

          {/* ── Conta Ativada ─────────────────────────────── */}
          <SectionLabel>Conta Ativada</SectionLabel>
          <div className="account-info-grid" style={{ marginBottom: 28 }}>
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

          {/* ── Players de Música ─────────────────────────── */}
          <SectionLabel>Players de Música</SectionLabel>
          <div style={{ display: "flex", gap: 10, marginBottom: 36 }}>
            {PLATFORMS.map(p => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={p.name}
                style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: "var(--surface3)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.15s, background 0.15s",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--surface2)";
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
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

export default AccountPage;