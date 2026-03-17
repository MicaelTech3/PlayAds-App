# PlayAds — Status do Projeto
**Versão:** 7.0 | **Atualizado:** 2025

---

## Arquitetura

```
Firebase (anucio-web)
    ├── Painel Web  →  playads-app.web.app
    │     src/pages/
    │       ├── Anuncios.jsx     upload MP3/WAV/YouTube
    │       ├── Playlists.jsx    gerenciar + horários + dias
    │       ├── Players.jsx      ★ NOVO: aba única (ativar + status)
    │       └── Logs.jsx
    │
    └── Player Desktop  →  player.py (Python + pywebview)
          Abre: https://playads-app.web.app
```

---

## Banco de Dados

```
users/{email,com}/
  ├── playlists/{id}/
  │     └── itens: [{ nome, url, horarios[], horario, dias[], loops }]
  ├── anuncios/
  ├── player_status/  { nome, plataforma, versao, last_seen, reproducao_atual }
  ├── comandos/       { play_now, stop }
  └── logs/

codigos/{PLAY-XXXX-XXXX}/  { uid, email, emailKey }
```

---

## Status das Funcionalidades

### ✅ Concluído

**Painel Web**
- [x] Auth Firebase (email/senha) + banco por email
- [x] Upload MP3/WAV + URLs/YouTube
- [x] Playlists com toggle, renomear, excluir
- [x] Config de mídia: múltiplos horários + loops
- [x] **Dias da semana** (Dom→Sáb, atalhos: Todos/Úteis/FDS)
- [x] **Players.jsx** — aba única:
  - Inativo → mostra código de ativação + passos
  - Ativo → status, modelo, reprodução, último contato

**Player Desktop (player.py)**
- [x] SSE corrigido para usar email como chave (bug raiz)
- [x] Sync automático a cada 30s
- [x] Botão Refresh manual
- [x] Download automático de mídias novas
- [x] `sync_schedules_to_cache()` — horários do Firebase → arquivos locais
- [x] `check_schedules` lê 2 fontes:
  - Fonte 1: playlists Firebase (preferência)
  - Fonte 2: cache local com horários (fallback)
- [x] Prefere arquivo LOCAL para reprodução
- [x] Dias da semana respeitados

### 🔧 Pendente / Testar
- [ ] Teste end-to-end: salvar horário → tocar no horário certo
- [ ] Integrar Players.jsx no App.jsx do painel web
- [ ] Compilar .exe final

---

## Bug Raiz Resolvido

```python
# ANTES — SSE escutava uid errado, nunca recebia updates
url = f"...users/{ST.uid}{path}.json"

# DEPOIS — usa email como chave (igual ao painel)
key = email_to_key(ST.email)   # "adm@gmail.com" → "adm@gmail,com"
url = f"...users/{key}{path}.json"
```

---

## Fluxo Sync Horários → Local

```
Firebase atualiza playlist
    └── SSE on_playlists() OU auto_sync a cada 30s
        ├── ST.local_playlists = dados novos
        ├── precache_new() → baixa mídias novas
        └── sync_schedules_to_cache()
              └── para cada item com URL cacheada:
                    update_cached_schedules(url, horarios, dias)
                    → .index.json atualizado

check_schedules() a cada 20s
    ├── Fonte 1: ST.local_playlists (Firebase)
    │     └── prefere path local se disponível
    └── Fonte 2: .index.json (arquivos locais)
          └── só toca se não coberto por playlist ativa
```

---

## Como Aplicar

```bash
# Painel web
npm run build && firebase deploy --only hosting

# Player — só substitui player.py e reinicia
```
