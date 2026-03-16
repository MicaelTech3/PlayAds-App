import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

function EqBars({ playing }) {
  const [heights, setHeights] = useState([4, 4, 4, 4]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      const tick = () => {
        setHeights([
          4 + Math.random() * 10,
          4 + Math.random() * 12,
          4 + Math.random() * 8,
          4 + Math.random() * 11,
        ]);
      };
      timerRef.current = setInterval(tick, 110);
    } else {
      clearInterval(timerRef.current);
      setHeights([4, 4, 4, 4]);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  return (
    <div className="eq-bars">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`eq-bar${playing ? "" : " idle"}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function Artwork({ playing }) {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (playing) {
      const tick = () => {
        setPhase((p) => p + 0.03);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  return (
    <div className={`artwork ${playing ? "playing" : ""}`}>
      {playing ? (
        <div className="artwork-rings">
          {[0, 1, 2].map((i) => (
            <div key={i} className="ring" />
          ))}
          <div className="play-orb">
            <svg viewBox="0 0 24 24" fill="white">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </div>
        </div>
      ) : (
        <svg className="artwork-idle-icon" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </div>
  );
}

export default function PlayerPage() {
  const { state, call } = useApp();
  const { playing, currentTrack, currentPlaylist, status, elapsed, progress, config, cacheInfo, hasPycaw, hasYtdlp, connStatus } = state;

  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Subscribe to internal log events via polling
  }, []);

  const handleStop     = () => call("cmd_stop");
  const handlePrecache = () => call("cmd_precache");
  const handleRefresh  = () => {
    setRefreshing(true);
    call("cmd_refresh");
    setTimeout(() => setRefreshing(false), 2000);
  };

  const statusLabel =
    status === "playing" ? "▶ REPRODUZINDO" :
    status === "done"    ? "✓ CONCLUÍDO" :
    "AGUARDANDO";

  const statusBadgeClass =
    status === "playing" ? "playing" :
    status === "done"    ? "done" :
    "";

  const elapsedStr = `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--p2)" }} />
        <span className="page-title" style={{ color: "var(--p1)" }}>Player</span>
        <span className="page-sub">Central de Reprodução</span>
        <div className="page-header-right">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "99px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: refreshing ? "var(--p1)" : "var(--muted2)",
              cursor: refreshing ? "default" : "pointer",
              transition: "all 0.2s",
            }}
            title="Sincronizar dados do Firebase"
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}
            >
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>

          {/* Status chip */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "99px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: connStatus === "Conectado" || connStatus === "Pronto" ? "var(--green)" :
                     connStatus === "Reproduzindo" ? "var(--warn)" :
                     connStatus?.includes("Erro") ? "var(--danger)" : "var(--muted)",
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%", display: "inline-block",
              background: connStatus === "Conectado" || connStatus === "Pronto" ? "var(--green)" :
                          connStatus === "Reproduzindo" ? "var(--warn)" :
                          connStatus?.includes("Erro") ? "var(--danger)" : "var(--muted)",
              boxShadow: connStatus === "Reproduzindo" ? "0 0 8px var(--warn-glow)" : "none",
            }} />
            {connStatus || "Aguardando..."}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="player-layout">
        {/* Left */}
        <div className="player-left">
          <div className="artwork-wrap">
            <Artwork playing={playing} />
          </div>

          <div>
            <div className="track-status">
              <EqBars playing={playing} />
              <span className={`status-badge ${statusBadgeClass}`}>{statusLabel}</span>
            </div>

            <div className="track-name" style={{ marginTop: 10 }}>
              {currentTrack?.nome || "Nenhuma mídia"}
            </div>
            <div className="track-meta" style={{ marginTop: 4 }}>
              {currentPlaylist
                ? `${currentPlaylist}${currentTrack?.total > 1 ? ` · Loop ${currentTrack?.loop}/${currentTrack?.total}` : ""}`
                : "—"
              }
            </div>
          </div>

          <div className="progress-wrap">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-time">{elapsedStr}</div>
          </div>

          <button className="stop-btn" onClick={handleStop}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            PARAR REPRODUÇÃO
          </button>
        </div>

        {/* Right */}
        <div className="player-right">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Playlist</div>
              <div className="stat-value" style={{ fontSize: 13 }}>
                {currentPlaylist || "—"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{
                color: status === "playing" ? "var(--warn)" :
                       status === "done"    ? "var(--green)" : "var(--green)",
                fontSize: 14,
              }}>
                {status === "playing" ? "Tocando" : status === "done" ? "Pronto" : "Pronto"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Loop</div>
              <div className="stat-value" style={{ color: "var(--p1)" }}>
                {currentTrack?.total > 1 ? `${currentTrack?.loop}/${currentTrack?.total}` : "—"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Progresso</div>
              <div className="stat-value" style={{ color: "var(--cyan)" }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Volume card */}
          <div className="card">
            <div className="card-header">
              <span className="card-label">Volume · Duck de Volume</span>
            </div>
            <div className="card-body" style={{ padding: "8px 16px" }}>
              <div className="vol-row">
                <span className="vol-label">Anúncio</span>
                <span className="vol-pct" style={{ color: "var(--p1)" }}>
                  {config?.volume_anuncio ?? "—"}%
                </span>
              </div>
              <div className="vol-row">
                <span className="vol-label">Outros apps</span>
                <span className="vol-pct" style={{ color: "var(--warn)" }}>
                  {config?.volume_outros ?? "—"}%
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(!hasPycaw || !hasYtdlp) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {!hasPycaw && (
                <div className="warn-banner">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  pycaw não instalado — duck de volume desativado
                </div>
              )}
              {!hasYtdlp && (
                <div className="warn-banner">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  yt-dlp não instalado — YouTube indisponível
                </div>
              )}
            </div>
          )}

          {/* Local storage */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: "space-between" }}>
              <span className="card-label">Armazenamento Local · pasta local/</span>
              <button className="btn btn-ghost btn-sm" onClick={handlePrecache}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Sincronizar
              </button>
            </div>
            <div className="card-body" style={{ padding: "10px 16px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted2)" }}>
                {cacheInfo?.files ?? 0} arquivo(s) · {((cacheInfo?.size || 0) / 1048576).toFixed(1)} MB
              </span>
            </div>
          </div>

          {/* Console */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", color: "var(--muted)", textTransform: "uppercase" }}>
                Console
              </span>
            </div>
            <ConsoleLog />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsoleLog() {
  const { state } = useApp();
  const ref = useRef(null);
  const [lines, setLines] = useState([]);

  // Listen to log events from state changes
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.t === "log") {
        setLines((prev) => {
          const next = [...prev, { msg: e.detail.msg, lvl: e.detail.lvl }];
          return next.slice(-300);
        });
      }
    };
    window.addEventListener("playads-event", handler);
    return () => window.removeEventListener("playads-event", handler);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  const classify = (msg, lvl) => {
    if (lvl === "ERROR") return "log-err";
    if (lvl === "WARNING") return "log-warn";
    if (msg.includes("▶") || msg.includes("✓") || msg.includes("Playlist")) return "log-pl";
    if (msg.includes("Firebase") || msg.includes("SSE") || msg.includes("conectado")) return "log-ok";
    if (msg.includes("Tocando")) return "log-cy";
    return "log-info";
  };

  return (
    <div className="console-box" ref={ref} style={{ flex: 1 }}>
      {lines.length === 0 ? (
        <span className="log-info">Aguardando eventos...</span>
      ) : (
        lines.map((l, i) => (
          <div key={i} className={`log-line ${classify(l.msg, l.lvl)}`}>
            {l.msg}
          </div>
        ))
      )}
    </div>
  );
}