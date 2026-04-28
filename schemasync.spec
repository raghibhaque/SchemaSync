# -*- mode: python ; coding: utf-8 -*-
#
# PyInstaller spec for SchemaSync.
#
# Build steps:
#   1. cd frontend && npm run build && cd ..
#   2. pip install pyinstaller
#   3. pyinstaller schemasync.spec --clean
#
# Output: dist/SchemaSync.exe

block_cipher = None

datas = [
    # Demo SQL schemas bundled alongside the app
    ("backend/demo", "backend/demo"),
    # Built React frontend (run `npm run build` first)
    ("frontend/dist", "frontend/dist"),
]

hidden_imports = [
    # uvicorn uses __import__ strings internally
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.auto",
    "uvicorn.loops.asyncio",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.http.h11_impl",
    "uvicorn.protocols.websockets",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    "uvicorn.lifespan.off",
    # starlette static files
    "starlette.staticfiles",
    "fastapi.staticfiles",
    # scipy internals often missed by the hook
    "scipy.special._cdflib",
    "scipy._lib.array_api_compat",
    "scipy._lib.array_api_compat.numpy",
    "scipy._lib.array_api_compat.numpy.fft",
    "scipy.optimize",
    "scipy.spatial",
]

a = Analysis(
    ["app.py"],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["tkinter", "matplotlib", "PIL", "IPython", "jupyter"],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="SchemaSync",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    # console=True shows a terminal window with startup logs.
    # Change to False for a silent app once you've confirmed it works.
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
