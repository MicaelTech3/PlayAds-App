import { useState, useEffect } from "react";
import PlayerPage from "./pages/PlayerPage";
import LibraryPage from "./pages/LibraryPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import LogsPage from "./pages/LogsPage";
import ConfigPage from "./pages/ConfigPage";
import AccountPage from "./pages/AccountPage";
import Sidebar from "./components/Sidebar";
import { AppContext } from "./context/AppContext";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("Player");
  const [state, setState] = useState({
    playing: false,
    currentTrack: null,
    currentPlaylist: null,
    status: "idle",
    elapsed: 0,
    progress: 0,
    playlists: {},
    anuncios: {},
    localFiles: [],
    logs: [],
    schedules: [],
    config: {
      player_nome: "Player Principal",
      volume_anuncio: 100,
      volume_outros: 10,
      duck_fade_ms: 1200,
    },
    account: { email: "—", codigo: "—", connected: false },
    hasPycaw: false,
    hasYtdlp: false,
    cacheInfo: { files: 0, size: 0 },
    connStatus: "Inicializando...",
  });

  // Bridge to Python (pywebview)
  const call = (method, ...args) => {
    if (window.pywebview?.api) {
      return window.pywebview.api[method](...args);
    }
    console.log("API call:", method, args);
    return Promise.resolve(null);
  };

  // Poll events from Python
  useEffect(() => {
    const poll = async () => {
      if (!window.pywebview?.api) return;
      try {
        const events = await window.pywebview.api.get_events();
        if (events && events.length) {
          events.forEach((ev) => handleEvent(ev));
        }
      } catch (e) {}
    };
    const timer = setInterval(poll, 150);
    return () => clearInterval(timer);
  }, []);

  // Elapsed timer while playing
  useEffect(() => {
    if (!state.playing) return;
    const t = setInterval(() => {
      setState(s => s.playing ? { ...s, elapsed: s.elapsed + 1 } : s);
    }, 1000);
    return () => clearInterval(t);
  }, [state.playing]);

  const handleEvent = (ev) => {
    setState((prev) => {
      switch (ev.t) {
        case "now_playing":
          return {
            ...prev,
            playing: true,
            status: "playing",
            currentTrack: { nome: ev.nome, loop: ev.loop, total: ev.total },
            currentPlaylist: ev.pl,
            elapsed: 0,
            progress: 0,
            connStatus: "Reproduzindo",
          };
        case "pl_start":
          return { ...prev };
        case "pl_end":
          return { ...prev, playing: false, status: "done", progress: 100, connStatus: "Pronto" };
        case "stopped":
          return { ...prev, playing: false, status: "idle", currentTrack: null, progress: 0, elapsed: 0, connStatus: "Pronto" };
        case "fb_data":
          return { ...prev, playlists: ev.playlists || {}, anuncios: ev.anuncios || {} };
        case "fb_logs":
          return { ...prev, logs: Object.values(ev.logs || {}).sort((a, b) => b.timestamp - a.timestamp).slice(0, 200) };
        case "local_updated":
        case "cache_done":
          call("get_local_info").then((info) => {
            if (info) setState((s) => ({ ...s, localFiles: info.files || [], cacheInfo: { files: info.count, size: info.size } }));
          });
          return prev;
        case "firebase_ok":
          return { ...prev, connStatus: "Conectado" };
        case "firebase_err":
          return { ...prev, connStatus: "Erro Firebase", status: "error" };
        case "sync_done":
          return { ...prev, connStatus: prev.status === "playing" ? "Reproduzindo" : "Pronto" };
        case "init_info":
          return {
            ...prev,
            hasPycaw:  ev.has_pycaw,
            hasYtdlp:  ev.has_ytdlp,
            account:   { email: ev.email, codigo: ev.codigo, connected: true },
            config:    ev.config  || prev.config,
            schedules: ev.schedules || prev.schedules,
          };
        case "schedules_updated":
          return { ...prev, schedules: ev.schedules || [] };
        case "dl_pct":
          return { ...prev, progress: ev.pct * 0.5 };
        default:
          return prev;
      }
    });
  };

  const ctx = { state, setState, call, page, setPage };

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          {page === "Player"    && <PlayerPage />}
          {page === "Library"   && <LibraryPage />}
          {page === "Playlists" && <PlaylistsPage />}
          {page === "Logs"      && <LogsPage />}
          {page === "Config"    && <ConfigPage />}
          {page === "Account"   && <AccountPage />}
        </main>
      </div>
    </AppContext.Provider>
  );
}
