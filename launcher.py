#!/usr/bin/env python3
"""
PlayAds Launcher v7.0
Verifica dependências, instala se necessário, depois lança player.py
Usa apenas tkinter (built-in) — não precisa de nada instalado.
"""

import sys, os, subprocess, threading, importlib
from pathlib import Path

# ─── Dependências necessárias ─────────────────────────────────────────────────
# formato: (pacote_pip, modulo_python, nome_amigavel, obrigatório)
DEPS = [
    ("pywebview",  "webview",         "pyWebView",        True),
    ("pygame",     "pygame",          "Pygame",           True),
    ("requests",   "requests",        "Requests",         True),
    ("pycaw",      "pycaw",           "PyCaw (volume)",   False),
    ("yt-dlp",     "yt_dlp",          "yt-dlp (YouTube)", False),
    ("pythonnet",  "clr",             "PythonNet (.NET)", True),
]

BASE_DIR   = Path(__file__).parent
PLAYER_PY  = BASE_DIR / "player.py"

# ─── Verificação ──────────────────────────────────────────────────────────────
def check_deps():
    missing_required = []
    missing_optional = []
    for pip_name, mod_name, friendly, required in DEPS:
        try:
            importlib.import_module(mod_name)
        except ImportError:
            if required:
                missing_required.append((pip_name, friendly))
            else:
                missing_optional.append((pip_name, friendly))
    return missing_required, missing_optional

# ─── Instalação via pip ───────────────────────────────────────────────────────
def install_deps(packages, log_fn):
    for pip_name, friendly in packages:
        log_fn(f"Instalando {friendly}...")
        try:
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", pip_name, "--upgrade", "-q"],
                capture_output=True, text=True, timeout=120
            )
            if result.returncode == 0:
                log_fn(f"✓ {friendly} instalado!")
            else:
                log_fn(f"✗ Erro em {friendly}: {result.stderr[-200:] if result.stderr else 'desconhecido'}")
        except subprocess.TimeoutExpired:
            log_fn(f"✗ Timeout instalando {friendly}")
        except Exception as e:
            log_fn(f"✗ Erro: {e}")

# ─── Interface Tkinter ────────────────────────────────────────────────────────
def show_ui(missing_required, missing_optional):
    try:
        import tkinter as tk
        from tkinter import ttk, font as tkfont
    except ImportError:
        # tkinter não disponível — instala silenciosamente e lança
        print("tkinter não disponível. Instalando dependências...")
        install_deps(missing_required + missing_optional, print)
        launch_player()
        return

    BG       = "#0d0b1a"
    SURFACE  = "#16132a"
    SURFACE2 = "#1e1b33"
    BORDER   = "#2d2a45"
    PURPLE   = "#8b5cf6"
    GREEN    = "#34d399"
    RED      = "#f43f5e"
    YELLOW   = "#f59e0b"
    TEXT     = "#f0eeff"
    MUTED    = "#6b6690"
    CYAN     = "#22d3ee"

    root = tk.Tk()
    root.title("PlayAds — Verificação de Dependências")
    root.configure(bg=BG)
    root.geometry("520x580")
    root.resizable(False, False)
    try: root.iconbitmap(str(BASE_DIR / "icon.ico"))
    except: pass

    # Centraliza a janela
    root.update_idletasks()
    x = (root.winfo_screenwidth()  - 520) // 2
    y = (root.winfo_screenheight() - 580) // 2
    root.geometry(f"520x580+{x}+{y}")

    # ── Header ────────────────────────────────────────────────────────────────
    header = tk.Frame(root, bg=BG)
    header.pack(fill="x", padx=28, pady=(28, 0))

    logo_frame = tk.Frame(header, bg=PURPLE, width=48, height=48)
    logo_frame.pack_propagate(False)
    logo_frame.pack(side="left")
    tk.Label(logo_frame, text="▶", fg="white", bg=PURPLE,
             font=("Arial", 18, "bold")).place(relx=.5, rely=.5, anchor="center")

    title_frame = tk.Frame(header, bg=BG)
    title_frame.pack(side="left", padx=14)
    tk.Label(title_frame, text="PlayAds", fg=TEXT, bg=BG,
             font=("Arial", 18, "bold")).pack(anchor="w")
    tk.Label(title_frame, text="v7.0 — Verificação de Dependências", fg=MUTED, bg=BG,
             font=("Arial", 10)).pack(anchor="w")

    # ── Separador ─────────────────────────────────────────────────────────────
    tk.Frame(root, bg=BORDER, height=1).pack(fill="x", padx=28, pady=16)

    # ── Lista de dependências ─────────────────────────────────────────────────
    tk.Label(root, text="Status das Dependências", fg=TEXT, bg=BG,
             font=("Arial", 11, "bold")).pack(anchor="w", padx=28)
    tk.Label(root, text="Componentes necessários para o PlayAds funcionar", fg=MUTED, bg=BG,
             font=("Arial", 9)).pack(anchor="w", padx=28, pady=(2, 10))

    list_frame = tk.Frame(root, bg=SURFACE, bd=0, highlightbackground=BORDER,
                          highlightthickness=1)
    list_frame.pack(fill="x", padx=28, pady=(0, 12))

    status_labels = {}
    for i, (pip_name, mod_name, friendly, required) in enumerate(DEPS):
        try:
            importlib.import_module(mod_name)
            installed = True
        except ImportError:
            installed = False

        is_missing = not installed
        row = tk.Frame(list_frame, bg=SURFACE)
        row.pack(fill="x", padx=14, pady=6)

        # Ícone de status
        ico = "●" if installed else ("✗" if required else "○")
        ico_color = GREEN if installed else (RED if required else YELLOW)
        tk.Label(row, text=ico, fg=ico_color, bg=SURFACE,
                 font=("Arial", 10)).pack(side="left", padx=(0, 8))

        # Nome
        tk.Label(row, text=friendly, fg=TEXT if installed else (RED if required else YELLOW),
                 bg=SURFACE, font=("Arial", 10, "bold" if is_missing else "normal"),
                 width=20, anchor="w").pack(side="left")

        # Tag obrigatório/opcional
        tag = "OBRIGATÓRIO" if required else "OPCIONAL"
        tag_col = "#3b1d2d" if required and is_missing else SURFACE2
        tag_fg  = RED if required and is_missing else MUTED
        tk.Label(row, text=tag, fg=tag_fg, bg=tag_col,
                 font=("Courier", 7, "bold"), padx=5, pady=1).pack(side="left", padx=6)

        # Status
        status_text = "Instalado" if installed else "Não instalado"
        lbl = tk.Label(row, text=status_text,
                       fg=GREEN if installed else MUTED,
                       bg=SURFACE, font=("Arial", 9))
        lbl.pack(side="right")
        status_labels[pip_name] = lbl

    # Separador
    tk.Frame(root, bg=BORDER, height=1).pack(fill="x", padx=28, pady=8)

    # ── Log de instalação ─────────────────────────────────────────────────────
    log_frame = tk.Frame(root, bg=SURFACE, bd=0, highlightbackground=BORDER,
                         highlightthickness=1)
    log_frame.pack(fill="both", expand=True, padx=28, pady=(0, 12))

    log_text = tk.Text(log_frame, bg=SURFACE, fg=CYAN, font=("Courier New", 9),
                       bd=0, highlightthickness=0, state="disabled",
                       height=6, wrap="word")
    log_text.pack(fill="both", expand=True, padx=10, pady=8)

    scroll = tk.Scrollbar(log_frame, command=log_text.yview)
    log_text.configure(yscrollcommand=scroll.set)

    def log(msg):
        def _upd():
            log_text.configure(state="normal")
            log_text.insert("end", msg + "\n")
            log_text.see("end")
            log_text.configure(state="disabled")
        root.after(0, _upd)

    # ── Barra de progresso ────────────────────────────────────────────────────
    prog_var = tk.DoubleVar(value=0)
    style = ttk.Style()
    style.theme_use("clam")
    style.configure("PlayAds.Horizontal.TProgressbar",
                    troughcolor=SURFACE2, background=PURPLE,
                    bordercolor=BORDER, lightcolor=PURPLE, darkcolor=PURPLE)
    prog_bar = ttk.Progressbar(root, variable=prog_var, maximum=100,
                                style="PlayAds.Horizontal.TProgressbar",
                                mode="indeterminate")
    prog_bar.pack(fill="x", padx=28, pady=(0, 6))
    prog_bar_visible = [False]

    # ── Botões ────────────────────────────────────────────────────────────────
    btn_frame = tk.Frame(root, bg=BG)
    btn_frame.pack(fill="x", padx=28, pady=(0, 24))

    has_required_missing = len(missing_required) > 0
    has_optional_missing = len(missing_optional) > 0
    all_missing = missing_required + missing_optional

    install_btn = None
    launch_btn  = None

    def do_install(packages):
        if install_btn: install_btn.configure(state="disabled", text="Instalando...")
        if launch_btn:  launch_btn.configure(state="disabled")
        prog_bar.configure(mode="indeterminate")
        prog_bar.start(12)
        prog_bar_visible[0] = True
        log("Iniciando instalação...")

        def run():
            total = len(packages)
            for i, (pip_name, friendly) in enumerate(packages):
                log(f"[{i+1}/{total}] Instalando {friendly}...")
                try:
                    proc = subprocess.run(
                        [sys.executable, "-m", "pip", "install", pip_name, "--upgrade", "-q"],
                        capture_output=True, text=True, timeout=180
                    )
                    if proc.returncode == 0:
                        log(f"  ✓ {friendly} instalado com sucesso!")
                        root.after(0, lambda p=pip_name: status_labels[p].configure(
                            text="Instalado ✓", fg=GREEN))
                    else:
                        err = (proc.stderr or proc.stdout or "erro desconhecido")[-120:]
                        log(f"  ✗ Falha em {friendly}: {err}")
                except Exception as e:
                    log(f"  ✗ Erro: {e}")

            log("")
            # Verifica novamente
            mr, mo = check_deps()
            if not mr:
                log("✅ Todas as dependências obrigatórias instaladas!")
                log("Iniciando PlayAds...")
                root.after(1500, lambda: (root.destroy(), launch_player()))
            else:
                log("⚠️  Algumas dependências não foram instaladas.")
                log("Tente rodar como Administrador ou instale manualmente:")
                for pip_name, friendly in mr:
                    log(f"   pip install {pip_name}")
                root.after(0, lambda: (
                    prog_bar.stop(),
                    install_btn and install_btn.configure(
                        state="normal", text="Tentar Novamente"),
                    launch_btn and launch_btn.configure(state="normal"),
                ))

        threading.Thread(target=run, daemon=True).start()

    # Monta botões conforme o estado
    if has_required_missing:
        install_btn = tk.Button(
            btn_frame,
            text=f"Instalar Dependências ({len(all_missing)} pacote{'s' if len(all_missing)>1 else ''})",
            bg=PURPLE, fg="white", activebackground="#7c3aed", activeforeground="white",
            font=("Arial", 10, "bold"), bd=0, padx=20, pady=10, cursor="hand2",
            command=lambda: do_install(all_missing)
        )
        install_btn.pack(side="left", fill="x", expand=True)

        if not has_required_missing and PLAYER_PY.exists():
            launch_btn = tk.Button(
                btn_frame, text="Abrir PlayAds →",
                bg=GREEN, fg=BG, activebackground="#059669", activeforeground=BG,
                font=("Arial", 10, "bold"), bd=0, padx=20, pady=10, cursor="hand2",
                command=lambda: (root.destroy(), launch_player())
            )
            launch_btn.pack(side="right", padx=(8, 0))

    elif has_optional_missing:
        install_btn = tk.Button(
            btn_frame,
            text=f"Instalar Opcionais ({len(missing_optional)} pacote{'s' if len(missing_optional)>1 else ''})",
            bg=SURFACE2, fg=YELLOW, activebackground=BORDER, activeforeground=YELLOW,
            font=("Arial", 10, "bold"), bd=0, padx=20, pady=10, cursor="hand2",
            command=lambda: do_install(missing_optional)
        )
        install_btn.pack(side="left")

        launch_btn = tk.Button(
            btn_frame, text="Abrir PlayAds →",
            bg=PURPLE, fg="white", activebackground="#7c3aed", activeforeground="white",
            font=("Arial", 10, "bold"), bd=0, padx=20, pady=10, cursor="hand2",
            command=lambda: (root.destroy(), launch_player())
        )
        launch_btn.pack(side="right", fill="x", expand=True, padx=(8, 0))

    else:
        # Tudo instalado — vai direto
        log("✅ Todas as dependências estão instaladas!")
        log("Abrindo PlayAds...")
        root.after(600, lambda: (root.destroy(), launch_player()))
        launch_btn = tk.Button(
            btn_frame, text="Abrir PlayAds →",
            bg=GREEN, fg=BG, activebackground="#059669", activeforeground=BG,
            font=("Arial", 10, "bold"), bd=0, padx=20, pady=10, cursor="hand2",
            command=lambda: (root.destroy(), launch_player())
        )
        launch_btn.pack(fill="x", expand=True)

    # Mensagem sobre UAC se faltar algo obrigatório
    if has_required_missing:
        tk.Label(root,
                 text="💡 Se a instalação falhar, execute o launcher como Administrador",
                 fg=MUTED, bg=BG, font=("Arial", 8)).pack(pady=(0, 8))

    root.mainloop()

# ─── Lança o player ───────────────────────────────────────────────────────────
def launch_player():
    if not PLAYER_PY.exists():
        print(f"Erro: player.py não encontrado em {BASE_DIR}")
        return
    os.execv(sys.executable, [sys.executable, str(PLAYER_PY)] + sys.argv[1:])

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    missing_required, missing_optional = check_deps()

    if not missing_required and not missing_optional:
        # Tudo instalado — lança direto sem UI
        launch_player()
        return

    if not missing_required and missing_optional:
        # Só faltam opcionais — pergunta se quer instalar, mas pode abrir mesmo assim
        show_ui(missing_required, missing_optional)
        return

    # Faltam obrigatórios — mostra a UI obrigatoriamente
    show_ui(missing_required, missing_optional)

if __name__ == "__main__":
    main()