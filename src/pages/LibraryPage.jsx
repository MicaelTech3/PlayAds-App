import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

function MediaModal({ item, onClose, playlists }) {
  const { call } = useApp();
  const [loops, setLoops] = useState(1);

  const schedules = useMemo(() => {
    const results = [];
    const url = item?.url || "";
    if (!url) return results;
    Object.values(playlists || {}).forEach((pl) => {
      if (!pl || typeof pl !== "object") return;
      (pl.itens || []).forEach((it) => {
        if (it?.url === url && it?.horario) {
          results.push({ horario: it.horario, playlist: pl.nome || "?", loops: it.loops || 1 });
        }
      });
    });
    return results.sort((a, b) => a.horario.localeCompare(b.horario));
  }, [item, playlists]);

  const play = () => {
    call("play_item_now", {
      nome: item.nome,
      url: item.url || "",
      path: item.path || "",
      tipo: item.tipo || "",
      loops,
    });
    onClose();
  };

  if (!item) return null;

  const now = new Date().toTimeString().slice(0, 5);
  const tam = item.tamanho ? `${(item.tamanho / 1048576).toFixed(1)} MB` : "—";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "var(--surface3)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.nome}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              {item.tipo} · {tam}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "var(--muted)", fontSize: 11 }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Loops */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
              Repetições
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="loops-control">
                <button className="loops-btn" onClick={() => setLoops((l) => Math.max(1, l - 1))}>−</button>
                <div className="loops-val">{loops}</div>
                <button className="loops-btn" onClick={() => setLoops((l) => Math.min(99, l + 1))}>+</button>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>vez{loops !== 1 ? "es" : ""}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Schedules */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
              Horários Agendados
            </div>
            {schedules.length > 0 ? (
              schedules.map((s, i) => (
                <div key={i} className="sched-item">
                  <div className="sched-time">{s.horario}</div>
                  <div style={{ flex: 1 }}>
                    <div className="sched-pl">{s.playlist}</div>
                  </div>
                  <div className="sched-loops">{s.loops}× loop</div>
                  {s.horario > now && (
                    <span style={{ fontSize: 9, padding: "2px 7px", background: "rgba(52,211,153,0.1)", color: "var(--green)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 99, fontFamily: "var(--font-mono)" }}>
                      próx
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                Nenhum horário agendado.
              </div>
            )}
          </div>

          {/* Local path */}
          {item.path && (
            <>
              <div className="divider" />
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                  Arquivo Local
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cyan)", wordBreak: "break-all", lineHeight: 1.6 }}>
                  {item.path.split(/[\\/]/).pop()}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={play}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            Tocar Agora
          </button>
          <button
            onClick={onClose}
            style={{ width: "100%", marginTop: 8, padding: "9px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--muted)", fontSize: 12 }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackRow({ item, index, onOpen, onQuickPlay }) {
  const yt = (item.url || "").toLowerCase().includes("youtube") || (item.url || "").includes("youtu.be");
  const tipo = (item.tipo || "").toUpperCase() || "—";
  const tam = item.tamanho ? `${(item.tamanho / 1048576).toFixed(1)} MB` : "—";
  const schedCount = item._schedCount || 0;

  return (
    <div className="track-row" onClick={() => onOpen(item)}>
      <div className="track-num">{String(index + 1).padStart(2, "0")}</div>

      <div className="track-icon-wrap">
        <svg className="track-icon" viewBox="0 0 24 24" fill="none"
          stroke={yt ? "#ff4444" : "var(--p1)"} strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      <div className="track-info">
        <div className="track-title">{item.nome || "—"}</div>
        <div className={`track-sched ${schedCount > 0 ? "has-sched" : ""}`}>
          {item.path ? "✓ local" : ""}
          {schedCount > 0 ? `  ⏰ ${schedCount} agendamento${schedCount !== 1 ? "s" : ""}` : (!item.path ? "sem agendamentos" : "")}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <span className={`type-badge ${yt ? "yt" : ""}`}>{yt ? "YT" : tipo.slice(0, 4)}</span>
      </div>

      <div className="track-size">{tam}</div>

      <div className="sched-count">
        {schedCount > 0 && (
          <span className="sched-pill">{schedCount}×</span>
        )}
      </div>

      <div className="quick-play">
        <button
          className="btn btn-primary btn-sm"
          onClick={(e) => { e.stopPropagation(); onQuickPlay(item); }}
          style={{ padding: "5px 10px" }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { state, call, setPage } = useApp();
  const { localFiles, anuncios, playlists } = state;

  const [tab, setTab] = useState("local");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);

  // Enrich items with schedule counts
  const enriched = useMemo(() => {
    const source = tab === "local"
      ? localFiles
      : Object.values(anuncios || {}).filter((a) => typeof a === "object");

    const q = query.toLowerCase();

    return source
      .filter((item) => !q || (item.nome || "").toLowerCase().includes(q))
      .map((item) => {
        const url = item.url || item.path || "";
        let sc = 0;
        Object.values(playlists || {}).forEach((pl) => {
          if (!pl?.itens) return;
          pl.itens.forEach((it) => { if (it?.url === url) sc++; });
        });
        return { ...item, _schedCount: sc };
      });
  }, [tab, localFiles, anuncios, playlists, query]);

  const quickPlay = (item) => {
    call("play_item_now", { nome: item.nome, url: item.url || "", path: item.path || "", tipo: item.tipo || "", loops: 1 });
    setPage("Player");
  };

  return (
    <div className="library-layout">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-accent" style={{ background: "var(--cyan)" }} />
        <span className="page-title">Biblioteca</span>
        <span className="page-sub">Mídias na pasta local/</span>
        <div className="page-header-right">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
            {enriched.length} faixa{enriched.length !== 1 ? "s" : ""}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => call("refresh_local")}
            style={{ padding: "5px 10px" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="search-row">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            placeholder="Buscar mídia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="tab-strip">
          {[
            { id: "local", label: "💾 Local" },
            { id: "firebase", label: "☁ Firebase" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="track-list-header">
        <div className="th">#</div>
        <div className="th"></div>
        <div className="th left">Nome</div>
        <div className="th">Tipo</div>
        <div className="th">Tamanho</div>
        <div className="th">Agend.</div>
        <div className="th"></div>
      </div>

      <div className="track-list">
        {enriched.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
            <p>{tab === "local" ? "Pasta local/ vazia." : "Nenhuma mídia no Firebase."}</p>
            <small>{tab === "local" ? "Clique em Sincronizar para baixar mídias." : "Adicione mídias no painel web."}</small>
          </div>
        ) : (
          enriched.map((item, i) => (
            <TrackRow
              key={item.path || item.url || i}
              item={item}
              index={i}
              onOpen={setModal}
              onQuickPlay={quickPlay}
            />
          ))
        )}
      </div>

      {modal && (
        <MediaModal
          item={modal}
          playlists={playlists}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
