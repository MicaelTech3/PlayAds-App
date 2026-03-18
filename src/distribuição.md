# PlayAds — Guia de Distribuição

## Estrutura do instalador

```
Usuário baixa → PlayAds_Setup.exe (2MB)
                     ↓
         Baixa do GitHub Releases:
           • Python 3.12 (se não tiver)
           • player.py
           • PlayAds.exe
                     ↓
         Instala dependências pip automaticamente
                     ↓
         Cria atalhos e abre o PlayAds
```

---

## Passo a passo para publicar

### 1. Instalar o Inno Setup
Baixe gratuitamente em: https://jrsoftware.org/isdl.php  
Instale normalmente.

### 2. Criar o repositório no GitHub
1. Acesse https://github.com/new
2. Nome: `playads`
3. Pode ser público ou privado
4. Clique em **Create repository**

### 3. Atualizar o script .iss
Abra o `PlayAds_Setup.iss` e troque:
```
#define GitHubUser   "SEU_USUARIO_GITHUB"
```
pelo seu usuário real do GitHub, ex:
```
#define GitHubUser   "techsolution"
```

### 4. Preparar os arquivos de release

Execute no terminal (dentro da pasta do projeto):
```cmd
prepare_release.bat
```

Isso vai gerar:
- `release\player.py`
- `release\PlayAds.exe`  
- `dist_installer\PlayAds_Setup.exe`

### 5. Criar o GitHub Release

1. Acesse `https://github.com/SEU_USUARIO/playads/releases/new`
2. Tag: `v7.0`
3. Title: `PlayAds v7.0`
4. Faça upload dos arquivos:
   - `release\player.py`
   - `release\PlayAds.exe`
5. Clique em **Publish release**

### 6. Compilar o instalador final

1. Abra o **Inno Setup Compiler**
2. File → Open → selecione `PlayAds_Setup.iss`
3. Clique em **Build → Compile** (ou F9)
4. O instalador será gerado em `dist_installer\PlayAds_Setup.exe`

### 7. Distribuir

Compartilhe apenas o arquivo:
```
dist_installer\PlayAds_Setup.exe  (~2MB)
```

O usuário baixa, abre, e o instalador faz todo o resto automaticamente.

---

## O que o instalador faz automaticamente

1. ✅ Verifica se Python 3.12 está instalado
2. ✅ Se não tiver, baixa e instala o Python silenciosamente
3. ✅ Baixa `player.py` e `PlayAds.exe` do GitHub Releases
4. ✅ Instala: `pywebview pygame requests pycaw yt-dlp`
5. ✅ Cria atalho na Área de Trabalho
6. ✅ Cria atalho no Menu Iniciar
7. ✅ Aparece em Adicionar/Remover Programas
8. ✅ Abre o PlayAds automaticamente

---

## Atualizar versão futura

1. Atualize o `player.py`
2. Crie novo GitHub Release (ex: `v7.1`)
3. Atualize `#define GitHubRelease "v7.1"` no `.iss`
4. Recompile o instalador
5. Distribua o novo `PlayAds_Setup.exe`