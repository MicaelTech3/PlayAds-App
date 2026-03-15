#!/usr/bin/env python3
"""
PlayAds Player v7.0  —  Backend Python
Interface: React/JSX via pywebview
"""

import os, sys, json, time, threading, platform, logging, queue, hashlib, math
from datetime import datetime
from pathlib import Path

# ─── Deps ────────────────────────────────────────────────────────────────────
try:
    import pygame
    pygame.mixer.pre_init(44100, -16, 2, 4096)
    pygame.mixer.init()
except ImportError:
    print("ERRO: pip install pygame"); sys.exit(1)

try:
    import requests
except ImportError:
    print("ERRO: pip install requests"); sys.exit(1)

try:
    import webview
except ImportError:
    print("ERRO: pip install pywebview"); sys.exit(1)

try:
    from pycaw.pycaw import AudioUtilities
    import comtypes
    HAS_PYCAW = True
except ImportError:
    HAS_PYCAW = False

try:
    import yt_dlp
    HAS_YTDLP = True
except ImportError:
    HAS_YTDLP = False

# ─── Caminhos ────────────────────────────────────────────────────────────────
# Suporte a PyInstaller: quando compilado, __file__ não existe
if getattr(sys, "frozen", False):
    # Rodando como .exe — BASE_DIR é a pasta do executável
    BASE_DIR   = Path(sys.executable).parent
    STATIC_DIR = Path(sys._MEIPASS)   # arquivos empacotados (dist/, etc.)
else:
    BASE_DIR   = Path(__file__).parent
    STATIC_DIR = BASE_DIR

LOCAL_DIR       = BASE_DIR / "local"
LOCAL_DIR.mkdir(exist_ok=True)
CACHE_INDEX     = LOCAL_DIR / ".index.json"
ACTIVATION_FILE = BASE_DIR / "activation.json"
CONFIG_FILE     = BASE_DIR / "playads_config.json"
LOCAL_PL_FILE   = BASE_DIR / "local_playlists.json"
LOCAL_AD_FILE   = BASE_DIR / "local_anuncios.json"
LOCAL_LOG_FILE  = BASE_DIR / "local_logs.json"
SCHEDULES_FILE  = BASE_DIR / "local_schedules.json"

# ─── Firebase ────────────────────────────────────────────────────────────────
FIREBASE_WEB_API_KEY = "AIzaSyBgwB_2syWdyK5Wc0E9rJIlDnXjwTf1OWE"
FIREBASE_DB_URL      = "https://anucio-web-default-rtdb.firebaseio.com"
FIREBASE_AUTH_URL    = "https://identitytoolkit.googleapis.com/v1/accounts"
FIREBASE_REFRESH_URL = "https://securetoken.googleapis.com/v1/token"
WEB_URL              = "https://anucio-web.web.app"

DEFAULT_CONFIG = {
    "player_nome":    "Player Principal",
    "volume_anuncio": 100,
    "volume_outros":  10,
    "duck_fade_ms":   1200,
}

def load_config():
    if not CONFIG_FILE.exists():
        CONFIG_FILE.write_text(json.dumps(DEFAULT_CONFIG, indent=2, ensure_ascii=False))
    raw = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    for k, v in DEFAULT_CONFIG.items():
        raw.setdefault(k, v)
    return raw

def save_config(cfg):
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")

# ─── Auth ────────────────────────────────────────────────────────────────────
class _Auth:
    id_token = refresh_token = ""
    expires_at = 0.0
    lock = threading.Lock()

_AUTH = _Auth()

def auth_sign_in(email, password):
    try:
        r = requests.post(
            f"{FIREBASE_AUTH_URL}:signInWithPassword?key={FIREBASE_WEB_API_KEY}",
            json={"email": email, "password": password, "returnSecureToken": True}, timeout=10)
        if not r.ok: return False
        d = r.json()
        with _AUTH.lock:
            _AUTH.id_token      = d["idToken"]
            _AUTH.refresh_token = d["refreshToken"]
            _AUTH.expires_at    = time.time() + int(d.get("expiresIn", 3600)) - 60
        return True
    except: return False

def auth_refresh():
    if not _AUTH.refresh_token: return False
    try:
        r = requests.post(
            f"{FIREBASE_REFRESH_URL}?key={FIREBASE_WEB_API_KEY}",
            json={"grant_type": "refresh_token", "refresh_token": _AUTH.refresh_token}, timeout=10)
        if not r.ok: return False
        d = r.json()
        with _AUTH.lock:
            _AUTH.id_token      = d["id_token"]
            _AUTH.refresh_token = d["refresh_token"]
            _AUTH.expires_at    = time.time() + int(d.get("expires_in", 3600)) - 60
        return True
    except: return False

def get_token():
    if time.time() >= _AUTH.expires_at: auth_refresh()
    return _AUTH.id_token

def _token_loop():
    while True:
        try:
            rem = _AUTH.expires_at - time.time()
            time.sleep(max(60, rem - 120))
            if _AUTH.refresh_token: auth_refresh()
        except: time.sleep(300)

# ─── Activation ──────────────────────────────────────────────────────────────
def load_activation():
    if ACTIVATION_FILE.exists():
        try: return json.loads(ACTIVATION_FILE.read_text(encoding="utf-8"))
        except: pass
    return None

def save_activation(uid, email, codigo, senha=""):
    ACTIVATION_FILE.write_text(
        json.dumps({"uid": uid, "email": email, "codigo": codigo, "senha": senha}, indent=2),
        encoding="utf-8")

def clear_all_local():
    for f in [ACTIVATION_FILE, LOCAL_PL_FILE, LOCAL_AD_FILE, LOCAL_LOG_FILE,
              CONFIG_FILE, CACHE_INDEX, SCHEDULES_FILE]:
        try:
            if f.exists(): f.unlink()
        except: pass
    for f in LOCAL_DIR.glob("*"):
        try:
            if f.is_file(): f.unlink()
        except: pass

def load_schedules():
    if SCHEDULES_FILE.exists():
        try: return json.loads(SCHEDULES_FILE.read_text(encoding="utf-8"))
        except: pass
    return []

def save_schedules(data):
    SCHEDULES_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

def validate_and_login(codigo, email, senha):
    codigo = codigo.strip().upper()
    try:
        r = requests.get(f"{FIREBASE_DB_URL}/codigos/{codigo}.json", timeout=10)
        if not r.ok: return None, None, "Servidor indisponível."
        data = r.json()
        if not data or not data.get("uid"): return None, None, "Código inválido."
        uid = data["uid"]
    except Exception as e:
        return None, None, f"Erro de conexão: {e}"
    if not auth_sign_in(email, senha): return None, None, "E-mail ou senha incorretos."
    return uid, email, None

# ─── Cache / Local ─────────────────────────────────────────────────────────
def load_cache_index():
    if CACHE_INDEX.exists():
        try: return json.loads(CACHE_INDEX.read_text(encoding="utf-8"))
        except: pass
    return {}

def save_cache_index(idx):
    CACHE_INDEX.write_text(json.dumps(idx, indent=2, ensure_ascii=False), encoding="utf-8")

def url_key(url): return hashlib.md5(url.encode()).hexdigest()

def get_cached(url):
    e = load_cache_index().get(url_key(url))
    if e and Path(e["path"]).exists(): return e["path"]
    return None

def set_cached(url, path, nome="", tipo=""):
    idx = load_cache_index()
    idx[url_key(url)] = {
        "path": str(path), "nome": nome, "tipo": tipo, "ts": int(time.time()),
        "tamanho": Path(path).stat().st_size if Path(path).exists() else 0
    }
    save_cache_index(idx)

def scan_local_files():
    idx = load_cache_index(); files = []
    for entry in sorted(LOCAL_DIR.iterdir(), key=lambda f: f.stat().st_mtime if f.is_file() else 0, reverse=True):
        if not entry.is_file() or entry.name.startswith("."): continue
        if entry.suffix.lower() not in (".mp3", ".wav", ".ogg", ".m4a"): continue
        meta = next((v for v in idx.values() if Path(v["path"]) == entry), None)
        files.append({
            "path":    str(entry),
            "nome":    meta["nome"] if meta else entry.stem,
            "tipo":    meta.get("tipo", entry.suffix.lstrip(".").upper()) if meta else entry.suffix.lstrip(".").upper(),
            "ts":      meta["ts"]   if meta else int(entry.stat().st_mtime),
            "tamanho": entry.stat().st_size,
            "url":     "",
        })
    return files

def get_local_info():
    files = scan_local_files()
    total = sum(f.get("tamanho", 0) for f in files)
    return {"files": files, "count": len(files), "size": total}

# ─── State ────────────────────────────────────────────────────────────────────
class State:
    lock            = threading.Lock()
    playing         = False
    stop_requested  = False
    current_thread  = None
    current_item    = None
    current_pl_name = ""
    current_pl_id   = ""
    play_ts         = 0.0
    local_playlists = {}
    local_anuncios  = {}
    local_schedules = []   # lista de agendamentos do React
    uid = email = codigo = ""

ST  = State()
EVQ = queue.Queue()   # consumed by Bridge.get_events()

def ev(t, **kw): EVQ.put({"t": t, **kw})

# ─── Logger ──────────────────────────────────────────────────────────────────
class _UIH(logging.Handler):
    def emit(self, r):
        try: ev("log", msg=self.format(r), lvl=r.levelname)
        except: pass

_fmt = logging.Formatter("%(asctime)s %(message)s", datefmt="%H:%M:%S")
log  = logging.getLogger("PlayAds")
log.setLevel(logging.INFO); log.handlers.clear()
_sh = logging.StreamHandler(); _sh.setFormatter(_fmt); log.addHandler(_sh)
_uh = _UIH();                  _uh.setFormatter(_fmt); log.addHandler(_uh)

# ─── Volume Duck ─────────────────────────────────────────────────────────────
_saved_vols = {}; _saved_lock = threading.Lock()

def _duck_worker(target_pct, fade_ms, restore):
    if not HAS_PYCAW: return
    try:
        comtypes.CoInitialize()
        sessions = AudioUtilities.GetAllSessions()
        my_pid = os.getpid(); svols = []
        for s in sessions:
            try:
                sav = s.SimpleAudioVolume
                if sav is None: continue
                if s.Process and s.Process.pid == my_pid: continue
                key = str(s.Process.pid) if s.Process else f"sys_{id(s)}"
                cur = sav.GetMasterVolume()
                if restore:
                    with _saved_lock: orig = _saved_vols.get(key, 1.0)
                    svols.append((sav, cur, orig))
                else:
                    with _saved_lock: _saved_vols[key] = cur
                    svols.append((sav, cur, target_pct / 100.0))
            except: continue
        if not svols: return
        steps = max(20, int(fade_ms / 40)); delay = fade_ms / 1000.0 / steps
        for step in range(1, steps + 1):
            t = step / steps; ease = t * t * (3.0 - 2.0 * t)
            for sav, v0, v1 in svols:
                try: sav.SetMasterVolume(max(0.0, min(1.0, v0 + (v1-v0)*ease)), None)
                except: pass
            time.sleep(delay)
    except Exception as ex: log.warning(f"duck: {ex}")
    finally:
        try: comtypes.CoUninitialize()
        except: pass

# ─── Download ─────────────────────────────────────────────────────────────────
def is_yt(url): return "youtube.com" in url or "youtu.be" in url

def download_yt(url, nome):
    if not HAS_YTDLP: log.error("yt-dlp não instalado"); return None
    cached = get_cached(url)
    if cached: return cached
    log.info(f"Baixando YouTube: {nome}")
    try:
        fname = f"yt_{url_key(url)}"
        out   = str(LOCAL_DIR / f"{fname}.%(ext)s")
        with yt_dlp.YoutubeDL({
            "format": "bestaudio/best", "outtmpl": out,
            "quiet": True, "no_warnings": True,
            "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}]
        }) as ydl:
            ydl.download([url])
        mp3 = str(LOCAL_DIR / f"{fname}.mp3")
        if Path(mp3).exists():
            set_cached(url, mp3, nome, "YouTube/MP3"); ev("local_updated"); return mp3
        for f in LOCAL_DIR.glob(f"{fname}.*"):
            set_cached(url, str(f), nome, "YouTube"); ev("local_updated"); return str(f)
    except Exception as e: log.error(f"YT {nome}: {e}")
    return None

def download_audio(url, nome):
    cached = get_cached(url)
    if cached: return cached
    log.info(f"Baixando: {nome}")
    try:
        r = requests.get(url, timeout=30, stream=True); r.raise_for_status()
        ct  = r.headers.get("Content-Type", "")
        ext = ".wav" if ("wav" in ct or url.lower().endswith(".wav")) else ".mp3"
        out = LOCAL_DIR / f"{url_key(url)}{ext}"
        total = int(r.headers.get("Content-Length", 0)); done = 0
        with open(out, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk); done += len(chunk)
                if total: ev("dl_pct", pct=int(done/total*100))
        set_cached(url, str(out), nome, "WAV" if ext == ".wav" else "MP3")
        ev("local_updated"); return str(out)
    except Exception as e: log.error(f"Download {nome}: {e}"); return None

def get_audio(url, nome):
    return download_yt(url, nome) if is_yt(url) else download_audio(url, nome)

# ─── Firebase REST ────────────────────────────────────────────────────────────
def _furl(path):
    return f"{FIREBASE_DB_URL}/users/{ST.uid}{path}.json?auth={get_token()}"

def fb_get(path):
    try:
        r = requests.get(_furl(path), timeout=10)
        if r.status_code == 401: auth_refresh(); r = requests.get(_furl(path), timeout=10)
        return r.json() if r.ok else None
    except: return None

def fb_set(path, data):
    try: requests.put(_furl(path), json=data, timeout=10)
    except: pass

def fb_update(path, data):
    try: requests.patch(_furl(path), json=data, timeout=10)
    except: pass

def fb_push(path, data):
    try: requests.post(_furl(path), json=data, timeout=10)
    except: pass

def fb_delete(path):
    try: requests.delete(_furl(path), timeout=10)
    except: pass

def fb_log(msg, status="info"):
    fb_push("/logs", {"mensagem": msg, "status": status,
                      "timestamp": int(time.time()*1000), "player_id": ST.codigo or "player"})

def fb_status(rep=None):
    cfg = load_config()
    d = {"nome": cfg.get("player_nome", "Player"), "last_seen": int(time.time()*1000),
         "plataforma": platform.system()+" "+platform.release(), "versao": "7.0"}
    if rep is not None: d["reproducao_atual"] = rep
    fb_update("/player_status", d)

def fb_done(path): fb_update(path, {"executado": True})

# ─── Playback ─────────────────────────────────────────────────────────────────
def play_item(item, cfg, loops_override=None):
    nome  = item.get("nome", "?")
    url   = item.get("url", "") or item.get("path", "")
    loops = loops_override if loops_override is not None else max(1, int(item.get("loops", 1)))
    if not url: return

    tmp = item["path"] if (item.get("path") and Path(item["path"]).exists()) else get_audio(url, nome)
    if not tmp: fb_log(f"Falha: {nome}", "error"); return

    fade_ms    = int(cfg.get("duck_fade_ms", 1200))
    vol_outros = float(cfg.get("volume_outros", 10))
    vol_ad     = float(cfg.get("volume_anuncio", 100)) / 100.0

    try:
        _duck_worker(vol_outros, fade_ms, restore=False)
        for n in range(1, loops + 1):
            if ST.stop_requested: break
            log.info(f"▶ Tocando: {nome}  ({n}/{loops})")
            ST.play_ts = time.time()
            fb_status(f"{nome} ({n}/{loops})")
            fb_log(f"▶ {nome} (loop {n}/{loops})", "ok")
            ev("now_playing", nome=nome, loop=n, total=loops, pl=ST.current_pl_name)
            try:
                pygame.mixer.music.stop(); pygame.mixer.quit()
                pygame.mixer.init(44100, -16, 2, 4096)
                pygame.mixer.music.load(tmp)
                pygame.mixer.music.set_volume(vol_ad)
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    if ST.stop_requested: pygame.mixer.music.stop(); break
                    time.sleep(0.1)
            except pygame.error as e:
                log.error(f"Pygame: {e}")
                try: pygame.mixer.quit(); pygame.mixer.init(44100, -16, 2, 4096)
                except: pass
                break
            if n < loops and not ST.stop_requested: time.sleep(0.3)
    finally:
        _duck_worker(100.0, fade_ms, restore=True)
        try: pygame.mixer.music.stop()
        except: pass

def run_playlist(pl, cfg, force=False, loops_override=None):
    nome_pl = pl.get("nome", "Playlist"); itens = pl.get("itens") or []
    if not itens: log.warning(f"Playlist '{nome_pl}' vazia"); ev("stopped"); return
    ST.current_pl_name = nome_pl
    fb_log(f"Iniciando: {nome_pl}", "ok"); ev("pl_start", nome=nome_pl, itens=itens)
    now_t = datetime.now().strftime("%H:%M"); played_any = False
    for i, item in enumerate(itens):
        if ST.stop_requested: break
        h = item.get("horario")
        if h and not force and h != now_t: continue
        ST.current_item = item; played_any = True
        play_item(item, cfg, loops_override=loops_override)
    if not played_any: log.warning(f"Nenhum item tocou em '{nome_pl}'"); ev("stopped")
    with ST.lock: ST.playing = False; ST.current_item = None; ST.current_pl_name = ""
    fb_status(None); fb_log(f"'{nome_pl}' concluída", "ok")
    log.info(f"✓ Playlist '{nome_pl}' concluída"); ev("pl_end", nome=nome_pl)

def stop_all():
    with ST.lock: ST.stop_requested = True
    try: pygame.mixer.music.stop()
    except: pass
    if ST.current_thread and ST.current_thread.is_alive(): ST.current_thread.join(timeout=3)
    with ST.lock: ST.stop_requested = False; ST.playing = False; ST.current_thread = None; ST.current_item = None

def start_playlist(pl, cfg, force=True, loops_override=None):
    stop_all()
    with ST.lock:
        ST.playing = True
        t = threading.Thread(target=run_playlist, args=(pl, cfg, force),
                             kwargs={"loops_override": loops_override}, daemon=True)
        ST.current_thread = t
    t.start()

# ─── SSE ─────────────────────────────────────────────────────────────────────
def _sse_listen(path, callback, label=""):
    while True:
        try:
            tok  = get_token()
            url  = f"{FIREBASE_DB_URL}/users/{ST.uid}{path}.json?auth={tok}"
            resp = requests.get(url, headers={"Accept": "text/event-stream", "Cache-Control": "no-cache"},
                                stream=True, timeout=60)
            if resp.status_code == 401: auth_refresh(); time.sleep(3); continue
            if resp.status_code != 200: time.sleep(10); continue
            log.info(f"SSE ativo: {label}")
            buf = ""; etype = ""; edata = ""
            for chunk in resp.iter_content(chunk_size=1, decode_unicode=True):
                if not chunk: continue
                buf += chunk
                while "\n" in buf:
                    line, buf = buf.split("\n", 1); line = line.rstrip("\r")
                    if   line.startswith("event:"): etype = line[6:].strip()
                    elif line.startswith("data:"):  edata = line[5:].strip()
                    elif line == "":
                        if etype in ("put", "patch") and edata:
                            try:
                                payload = json.loads(edata); raw = payload.get("data"); callback(raw)
                            except Exception as ex: log.warning(f"SSE {label} parse: {ex}")
                        etype = ""; edata = ""
        except requests.exceptions.Timeout: time.sleep(3)
        except Exception as ex: log.warning(f"SSE {label}: {ex} — retry 5s"); time.sleep(5)

def setup_listeners(cfg):
    def on_play(data):
        try:
            if not data or (isinstance(data, dict) and data.get("executado")): return
            plid = data.get("playlist_id") if isinstance(data, dict) else None
            if not plid: return
            snap = fb_get(f"/playlists/{plid}")
            if not snap: return
            fb_done("/comandos/play_now")
            start_playlist(snap, cfg, force=True)
            if isinstance(data, dict) and data.get("temp_playlist_id"):
                time.sleep(0.5); fb_delete(f"/playlists/{plid}")
        except Exception as ex: log.error(f"on_play: {ex}")

    def on_stop(data):
        try:
            if not data or (isinstance(data, dict) and data.get("executado")): return
            fb_done("/comandos/stop"); stop_all(); fb_status(None); ev("stopped")
        except Exception as ex: log.error(f"on_stop: {ex}")

    def on_playlists(data):
        try:
            if not isinstance(data, dict): return
            filtered = {k: v for k, v in data.items() if isinstance(v, dict) and not v.get("temp")}
            ST.local_playlists = filtered
            ev("fb_data", playlists=filtered, anuncios=ST.local_anuncios)
            LOCAL_PL_FILE.write_text(json.dumps(filtered, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception as ex: log.error(f"on_playlists: {ex}")

    def on_anuncios(data):
        try:
            if not isinstance(data, dict): return
            ST.local_anuncios = data
            ev("fb_data", playlists=ST.local_playlists, anuncios=data)
            LOCAL_AD_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception as ex: log.error(f"on_anuncios: {ex}")

    def on_logs(data):
        try:
            if not isinstance(data, dict): return
            ev("fb_logs", logs=data)
            LOCAL_LOG_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception as ex: log.error(f"on_logs: {ex}")

    def _initial():
        time.sleep(1)
        try:
            pls = fb_get("/playlists")
            if pls and isinstance(pls, dict): on_playlists(pls)
            ads = fb_get("/anuncios")
            if ads and isinstance(ads, dict): on_anuncios(ads)
            logs_d = fb_get("/logs")
            if logs_d and isinstance(logs_d, dict): on_logs(logs_d)
        except Exception as ex: log.warning(f"Carga inicial: {ex}")

    threading.Thread(target=_initial, daemon=True).start()
    for path, cb, lbl in [
        ("/comandos/play_now", on_play,      "play_now"),
        ("/comandos/stop",     on_stop,      "stop"),
        ("/playlists",         on_playlists, "playlists"),
        ("/anuncios",          on_anuncios,  "anuncios"),
        ("/logs",              on_logs,      "logs"),
    ]:
        threading.Thread(target=_sse_listen, args=(path, cb), kwargs={"label": lbl}, daemon=True).start()

def check_schedules(cfg):
    """
    Verifica agendamentos a cada 20s.
    Suporta dois formatos:
      1. Novo (React): lista em ST.local_schedules  — {horario, playlist_id, loops, dias, ativo}
      2. Legado (Firebase): itens em ST.local_playlists com campo horario
    """
    DIAS_MAP = {0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab"}
    fired: set = set()

    while True:
        time.sleep(20)
        try:
            if ST.playing: continue
            now       = datetime.now()
            now_t     = now.strftime("%H:%M")
            today_key = DIAS_MAP[now.weekday() % 7]  # Python: 0=seg → ajustamos
            today_key = DIAS_MAP[now.isoweekday() % 7]  # isoweekday: 1=seg, 7=dom
            today_str = now.strftime("%Y-%m-%d")
            fired     = {k for k in fired if k.startswith(today_str)}

            # ── Formato Novo (React) ────────────────────────────────────────
            for sched in ST.local_schedules:
                if not isinstance(sched, dict): continue
                if not sched.get("ativo", True): continue
                if sched.get("horario") != now_t: continue
                dias = sched.get("dias") or []
                if today_key not in dias: continue

                fk = f"{today_str} {now_t} react_{sched.get('id','?')}"
                if fk in fired: continue

                pl_id   = sched.get("playlist_id", "")
                pl_nome = sched.get("playlist_nome", sched.get("label", "?"))
                loops   = int(sched.get("loops", 1))

                # Busca playlist no estado local
                pl = ST.local_playlists.get(pl_id)
                if not pl:
                    # Tenta buscar do Firebase se tiver conexão
                    try: pl = fb_get(f"/playlists/{pl_id}")
                    except: pass

                if not pl:
                    log.warning(f"⏰ Agendamento: playlist '{pl_id}' não encontrada")
                    fired.add(fk)
                    continue

                log.info(f"⏰ {now_t}: {pl_nome} → {pl.get('nome','?')} (×{loops})")
                fired.add(fk)
                sub = {"nome": f"{pl.get('nome','?')} @ {now_t}", "itens": pl.get("itens", [])}
                start_playlist(sub, cfg, force=True, loops_override=loops)
                break

            if ST.playing: continue

            # ── Formato Legado (Firebase playlists com horario nos itens) ───
            for pl_id, pl in list(ST.local_playlists.items()):
                if not isinstance(pl, dict) or not pl.get("ativa"): continue
                for idx, item in enumerate(pl.get("itens") or []):
                    if not isinstance(item, dict): continue
                    h = item.get("horario")
                    if h != now_t: continue
                    fk = f"{today_str} {now_t} {pl_id} {idx}"
                    if fk in fired: continue
                    log.info(f"⏰ {now_t}: {pl.get('nome')} → {item.get('nome','?')}")
                    fired.add(fk)
                    sub = {"nome": f"{pl.get('nome','?')} @ {now_t}", "itens": [item]}
                    start_playlist(sub, cfg, force=True)
                    break
                if ST.playing: break

        except Exception as ex: log.error(f"schedule: {ex}")

def heartbeat(cfg):
    while True:
        try:
            rep = ST.current_item.get("nome") if ST.current_item else None
            fb_status(rep)
        except: pass
        time.sleep(10)

def precache_all():
    log.info("Pre-cache iniciando...")
    count = 0
    for pl in ST.local_playlists.values():
        if not isinstance(pl, dict): continue
        for item in (pl.get("itens") or []):
            url = item.get("url", "")
            if url and not get_cached(url):
                get_audio(url, item.get("nome", "?")); count += 1
    log.info(f"Cache: {count} arquivo(s) baixado(s)")
    ev("cache_done"); ev("local_updated")

def load_local_data():
    for path, attr in [(LOCAL_PL_FILE, "local_playlists"), (LOCAL_AD_FILE, "local_anuncios")]:
        try:
            if path.exists(): setattr(ST, attr, json.loads(path.read_text(encoding="utf-8")))
        except: pass
    # Carrega agendamentos do React
    ST.local_schedules = load_schedules()


# ══════════════════════════════════════════════════════════════════════════════
#  BRIDGE — exposta ao JavaScript via pywebview
# ══════════════════════════════════════════════════════════════════════════════
class Bridge:
    """All public methods are callable from JS as window.pywebview.api.<method>()"""

    # ── Event queue ───────────────────────────────────────────────────────────
    def get_events(self):
        """Drain the event queue — called by React every 150ms."""
        events = []
        try:
            while True:
                events.append(EVQ.get_nowait())
        except queue.Empty:
            pass
        return events

    # ── Init info ─────────────────────────────────────────────────────────────
    def get_init_info(self):
        cfg = load_config()
        return {
            "t":          "init_info",
            "has_pycaw":  HAS_PYCAW,
            "has_ytdlp":  HAS_YTDLP,
            "email":      ST.email,
            "codigo":     ST.codigo,
            "config":     cfg,
            "local_dir":  str(LOCAL_DIR),
            "schedules":  load_schedules(),
        }

    # ── Playback ──────────────────────────────────────────────────────────────
    def play_item_now(self, item_dict):
        cfg = load_config()
        pl = {
            "nome": f"▶ {item_dict.get('nome', '?')}",
            "temp": True,
            "itens": [item_dict],
        }
        loops = int(item_dict.get("loops", 1))
        threading.Thread(target=start_playlist, args=(pl, cfg, True), kwargs={"loops_override": loops}, daemon=True).start()
        return True

    def play_playlist_now(self, data):
        cfg = load_config()
        pl     = data.get("playlist", {})
        loops  = int(data.get("loops", 1))
        threading.Thread(target=start_playlist, args=(pl, cfg, True), kwargs={"loops_override": loops}, daemon=True).start()
        return True

    def cmd_stop(self):
        try:
            fb_set("/comandos/stop", {"timestamp": int(time.time()*1000), "executado": False})
        except: pass
        threading.Thread(target=lambda: (stop_all(), ev("stopped")), daemon=True).start()
        return True

    # ── Cache / local ─────────────────────────────────────────────────────────
    def cmd_precache(self):
        threading.Thread(target=precache_all, daemon=True).start()
        return True

    def refresh_local(self):
        info = get_local_info()
        ev("local_updated")
        return info

    def get_local_info(self):
        return get_local_info()

    # ── Config ────────────────────────────────────────────────────────────────
    def save_config(self, cfg_dict):
        # Coerce numeric fields
        for k in ("volume_anuncio", "volume_outros", "duck_fade_ms"):
            try: cfg_dict[k] = int(cfg_dict[k])
            except: pass
        save_config(cfg_dict)
        return True

    def get_config(self):
        return load_config()

    # ── Account / disconnect ──────────────────────────────────────────────────
    def cmd_disconnect(self):
        def _go():
            stop_all(); clear_all_local()
            # Close window — will restart to activation screen
            import webview
            webview.windows[0].destroy()
        threading.Thread(target=_go, daemon=True).start()
        return True

    # ── Activation ────────────────────────────────────────────────────────────
    def activate(self, codigo, email, senha):
        uid, em, err = validate_and_login(codigo, email, senha)
        if uid:
            save_activation(uid, em or email, codigo, senha)
            return {"ok": True, "uid": uid, "email": em or email, "codigo": codigo}
        return {"ok": False, "error": err or "Credenciais inválidas."}

    def open_web(self):
        import webbrowser; webbrowser.open(WEB_URL); return True

    # ── Schedules ─────────────────────────────────────────────────────────────
    def save_schedules(self, schedules_list):
        """Salva lista de agendamentos vindos do React."""
        try:
            save_schedules(schedules_list)
            # Atualiza estado global
            ST.local_schedules = schedules_list
            ev("schedules_updated", schedules=schedules_list)
            log.info(f"Agendamentos salvos: {len(schedules_list)} item(s)")
            return True
        except Exception as e:
            log.error(f"save_schedules: {e}")
            return False

    def get_schedules(self):
        return load_schedules()


# ─── Backend startup ─────────────────────────────────────────────────────────
def start_backend(senha):
    if not auth_sign_in(ST.email, senha):
        log.error("Firebase: falha no login"); ev("firebase_err"); return False

    threading.Thread(target=_token_loop, daemon=True).start()
    cfg = load_config()
    load_local_data()

    if ST.local_playlists or ST.local_anuncios:
        ev("fb_data", playlists=ST.local_playlists, anuncios=ST.local_anuncios)

    if LOCAL_LOG_FILE.exists():
        try:
            logs = json.loads(LOCAL_LOG_FILE.read_text(encoding="utf-8"))
            if logs: ev("fb_logs", logs=logs)
        except: pass

    fb_status(None); fb_log(f"PlayAds v7.0 iniciado — {ST.email}", "ok")
    ev("firebase_ok"); ev("local_updated")

    # Init info event
    ev("init_info",
       has_pycaw=HAS_PYCAW, has_ytdlp=HAS_YTDLP,
       email=ST.email, codigo=ST.codigo, config=cfg,
       schedules=ST.local_schedules)

    threading.Thread(target=heartbeat,       args=(cfg,), daemon=True).start()
    threading.Thread(target=check_schedules, args=(cfg,), daemon=True).start()
    threading.Thread(target=setup_listeners, args=(cfg,), daemon=True).start()
    threading.Thread(target=precache_all,    daemon=True).start()

    log.info(f"Backend iniciado: {ST.email} · {ST.codigo}")
    log.info(f"pycaw:  {'ativo ✓' if HAS_PYCAW else 'não instalado'}")
    log.info(f"yt-dlp: {'ativo ✓' if HAS_YTDLP else 'não instalado'}")
    return True


# ─── URL da interface ────────────────────────────────────────────────────────
# Modo: "online"  → carrega do site (requer internet, .exe simples)
#       "local"   → carrega do dist/ local (requer npm build)
UI_MODE = "online"
UI_URL  = "https://playads-app.web.app/"   # ← sua URL do Firebase Hosting

def get_ui_url():
    if UI_MODE == "online":
        return UI_URL
    # Modo local: verifica se o build existe
    dist_html = STATIC_DIR / "dist" / "index.html"
    if not dist_html.exists():
        import subprocess
        npm = "npm.cmd" if platform.system() == "Windows" else "npm"
        try:
            subprocess.run([npm, "install"], cwd=str(BASE_DIR), check=True)
            subprocess.run([npm, "run", "build"], cwd=str(BASE_DIR), check=True)
        except Exception as e:
            print(f"Erro no build: {e}"); sys.exit(1)
    return str(dist_html)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    bridge = Bridge()
    act    = load_activation()
    url    = get_ui_url()

    if act and act.get("senha"):
        ST.uid    = act["uid"]
        ST.email  = act["email"]
        ST.codigo = act["codigo"]
        threading.Thread(target=start_backend, args=(act["senha"],), daemon=True).start()
        window = webview.create_window(
            "PlayAds",
            url=url,
            js_api=bridge,
            width=1060,
            height=680,
            min_size=(880, 560),
            background_color="#080612",
        )
    else:
        window = webview.create_window(
            "PlayAds — Ativação",
            url=url,
            js_api=bridge,
            width=520,
            height=620,
            resizable=False,
            background_color="#080612",
        )

    webview.start(debug=False)


if __name__ == "__main__":
    main()
