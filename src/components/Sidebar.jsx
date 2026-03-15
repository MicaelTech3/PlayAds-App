import { useApp } from "../context/AppContext";

const NAV = [
  {
    id: "Player",
    label: "Player",
    accent: "var(--p1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "Library",
    label: "Biblioteca",
    accent: "var(--cyan)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
  },
  {
    id: "Playlists",
    label: "Playlists",
    accent: "var(--warn)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "Logs",
    label: "Logs",
    accent: "var(--green)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "Config",
    label: "Config",
    accent: "var(--muted2)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
  {
    id: "Account",
    label: "Conta",
    accent: "var(--p1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function statusClass(s) {
  const { connStatus, state: { status } } = s;
  if (status === "playing") return "playing";
  if (connStatus === "Conectado" || connStatus === "Pronto") return "connected";
  if (connStatus?.includes("Erro")) return "error";
  return "";
}

export default function Sidebar() {
  const { page, setPage, state } = useApp();
  const { connStatus, account } = state;

  const sc = statusClass({ connStatus, state });
  const connLabel =
    state.status === "playing" ? "Reproduzindo" :
    connStatus === "Conectado" ? "Online" :
    connStatus?.includes("Erro") ? "Erro" :
    connStatus || "Aguardando";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="white">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </div>
        <div className="logo-text">
          <h1>PlayAds</h1>
          <span>v6.1</span>
        </div>
      </div>

      {/* Status */}
      <div className={`status-pill ${sc}`}>
        <span className="dot" />
        <span>{connLabel}</span>
      </div>

      {/* Nav */}
      <nav className="nav-section">
        <div className="nav-group-label">Menu</div>
        {NAV.map((item) => (
          <div
            key={item.id}
            className={`nav-item${page === item.id ? " active" : ""}`}
            style={{ "--accent": item.accent }}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon" style={{ color: page === item.id ? item.accent : undefined }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">
            {(account?.email || "?")[0].toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-email">{account?.email || "—"}</div>
            <div className="user-code">{account?.codigo || "—"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
