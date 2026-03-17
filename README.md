# PlayAds v7.0

Player de anúncios com interface React + backend Python.

---

## Pré-requisitos

- Python 3.10+
- Node.js 18+ (https://nodejs.org)

---

## Instalação (primeira vez)

### 1. Dependências Python

```bash
pip install pywebview requests pygame pycaw yt-dlp
```

> `pycaw` é opcional (duck de volume Windows)  
> `yt-dlp` é opcional (suporte YouTube)

### 2. Build da interface React

```bash
npm install
npm run build
```

Isso cria a pasta `dist/` que o pywebview carrega.

### 3. Rodar

```bash
python player.py
```

> Se `dist/` não existir, o `player.py` tenta fazer o build automaticamente.

---

## Estrutura

```
playads-ui/
├── player.py              # Backend Python (lógica + Bridge pywebview)
├── serviceAccountKey.json # Chave Firebase (não commitar!)
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── context/AppContext.jsx
│   ├── components/Sidebar.jsx
│   └── pages/
│       ├── ActivationScreen.jsx
│       ├── PlayerPage.jsx
│       ├── LibraryPage.jsx
│       ├── PlaylistsPage.jsx
│       └── pages.jsx   (Logs, Config, Account)
└── dist/                  # Gerado pelo: npm run build
```
