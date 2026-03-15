// LogsPage.jsx
import { useApp } from "../context/AppContext";

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
              ? new Date(l.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
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

// ConfigPage.jsx
export function ConfigPage() {
  const { state, setState, call } = useApp();
  const { config } = state;

  const fields = [
    { key: "player_nome",    label: "Nome do Player",     hint: "Identificação deste player" },
    { key: "volume_anuncio", label: "Volume anúncio (%)", hint: "0 – 100  (volume dos anúncios)" },
    { key: "volume_outros",  label: "Volume outros (%)",  hint: "0 – 100  (outras apps ao tocar)" },
    { key: "duck_fade_ms",   label: "Fade duck (ms)",     hint: "500 – 3000  (duração do fade)" },
  ];

  const update = (key, val) => {
    setState((s) => ({ ...s, config: { ...s.config, [key]: val } }));
  };

  const save = () => {
    call("save_config", config).then(() => {
      // simple toast
      const el = document.createElement("div");
      el.textContent = "✓  Configurações salvas";
      Object.assign(el.style, {
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        background: "var(--green)", color: "#000", padding: "10px 20px",
        borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "12px",
        fontWeight: 700, animation: "fade-in 0.2s ease",
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--muted2)" }} />
        <span className="page-title">Configurações</span>
      </div>

      <div className="config-layout">
        <div className="config-section">
          <div className="config-section-title">Player</div>
          {fields.map(({ key, label, hint }) => (
            <div key={key} className="field-row">
              <div>
                <div className="field-label">{label}</div>
                <div className="field-hint">{hint}</div>
              </div>
              <input
                className="field-input"
                value={config?.[key] ?? ""}
                onChange={(e) => update(key, e.target.value)}
              />
              <div />
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={save}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}

// AccountPage.jsx
export function AccountPage() {
  const { state, call } = useApp();
  const { account, cacheInfo } = state;

  const LOCAL_DIR = window.__playads_local_dir || "local/";

  const disconnect = () => {
    if (window.confirm("Isso irá apagar todos os dados locais. Deseja continuar?")) {
      call("cmd_disconnect");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--p1)" }} />
        <span className="page-title">Conta</span>
        <span className="page-sub">Ativação e credenciais</span>
      </div>

      <div className="account-layout">
        {/* Account info */}
        <div style={{ marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)" }}>
          Conta Ativada
        </div>
        <div className="account-info-grid">
          {[
            ["E-mail", account?.email || "—"],
            ["Código", account?.codigo || "—"],
            ["Status", account?.connected ? "● Ativo" : "Inativo"],
            ["Versão", "6.1"],
          ].map(([label, val]) => (
            <div key={label} className="info-item">
              <div className="info-item-label">{label}</div>
              <div className="info-item-value" style={{ color: label === "Status" ? "var(--green)" : undefined }}>
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Local storage */}
        <div style={{ marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)" }}>
          Pasta Local
        </div>
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

        <div className="warn-banner" style={{ marginBottom: 20 }}>
          Desconectar apaga activation.json, todos os JSONs e arquivos em local/
        </div>

        <button className="btn btn-danger" onClick={disconnect} style={{ padding: "11px 24px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Desconectar e Redefinir
        </button>
      </div>
    </div>
  );
}

export default LogsPage;
