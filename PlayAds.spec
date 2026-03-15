# -*- mode: python ; coding: utf-8 -*-
# PlayAds.spec — Modo ONLINE (interface carrega do site)
# Uso: pyinstaller PlayAds.spec

block_cipher = None

a = Analysis(
    ['player.py'],
    pathex=[],
    binaries=[],
    datas=[],        # Sem dist/ — interface vem da internet
    hiddenimports=[
        'webview',
        'webview.platforms.winforms',
        'clr',
        'pygame',
        'pygame.mixer',
        'requests',
        'certifi',
        'charset_normalizer',
        'urllib3',
        'idna',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='PlayAds',
    debug=False,
    strip=False,
    upx=True,
    console=False,   # Sem terminal — app GUI
    icon='icon.ico' if __import__('os').path.exists('icon.ico') else None,
)
