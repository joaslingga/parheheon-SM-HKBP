#!/bin/bash
# Parheheon SM HKBP Ciputat - Server Launcher for Linux/Ubuntu

echo "====================================================================="
echo " Menjalankan Server Aplikasi Parheheon SM HKBP Ciputat 2026..."
echo "====================================================================="
echo ""

# Mencoba membuka browser jika ada GUI (X11/Wayland)
if [ -n "$DISPLAY" ] || [ -n "$WAYLAND_DISPLAY" ]; then
    echo " [1/2] Membuka web browser ke http://localhost:3000..."
    sleep 2
    xdg-open http://localhost:3000 &> /dev/null &
else
    echo " Running in headless mode (no GUI). Silakan buka http://localhost:3000 secara manual."
fi

echo ""
echo " [2/2] Memulai server Next.js (npm run dev)..."
echo ""
npm run dev

if [ $? -ne 0 ]; then
    echo ""
    echo " ERROR: Gagal menjalankan server. Pastikan Anda telah menjalankan"
    echo "        'npm install' sebelumnya di direktori ini."
    echo ""
    read -p "Tekan [Enter] untuk keluar..."
fi