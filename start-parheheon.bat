@echo off
title Parheheon SM HKBP Ciputat - Server Launcher
color 0B
echo =====================================================================
echo  PERINGATAN: Pastikan Node.js sudah terinstal di komputer Anda.
echo  Menjalankan Server Aplikasi Parheheon SM HKBP Ciputat 2026...
echo =====================================================================
echo.
echo  [1/2] Membuka web browser ke http://localhost:3000...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo  [2/2] Memulai server Next.js (npm run dev)...
echo.
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Gagal menjalankan server. Pastikan Anda telah menjalankan 
    echo         "npm install" sebelumnya di direktori ini.
    echo.
    pause
)
