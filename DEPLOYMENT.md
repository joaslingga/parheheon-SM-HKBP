# Panduan Deployment & Konfigurasi CI/CD VPS

Panduan ini menjelaskan langkah-langkah untuk menyiapkan VPS Ubuntu 22.04, Nginx, PM2, SSH, dan Telegram Bot agar pipa CI/CD otomatis berjalan sukses.

---

## 1. Konfigurasi SSH Keys untuk GitHub Actions
GitHub Actions memerlukan akses SSH ke VPS tanpa kata sandi. 

### Langkah A: Buat SSH Key Baru di Komputer Lokal atau VPS
Jalankan perintah ini di VPS atau terminal lokal:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```
*Tekan [Enter] untuk semua pilihan (kosongkan passphrase).*

### Langkah B: Daftarkan Public Key di VPS
Masukkan isi dari file public key (`~/.ssh/id_ed25519.pub`) ke dalam berkas `authorized_keys` milik pengguna `wmjoas` di VPS:
```bash
mkdir -p /home/wmjoas/.ssh
cat id_ed25519.pub >> /home/wmjoas/.ssh/authorized_keys
chmod 700 /home/wmjoas/.ssh
chmod 600 /home/wmjoas/.ssh/authorized_keys
```

### Langkah C: Masukkan Private Key ke GitHub Secrets
1. Salin isi file private key (`~/.ssh/id_ed25519`).
2. Buka repositori Anda di GitHub.
3. Masuk ke **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
4. Buat secret baru bernama: **`SSH_PRIVATE_KEY`** dan tempelkan isi private key tersebut.

---

## 2. Membuat Telegram Bot & Mendapatkan Chat ID
Agar bot dapat mengirimkan pesan ke Anda, Anda harus membuat bot dan mendapatkan ID obrolan Anda.

### Langkah A: Buat Telegram Bot
1. Cari user **`@BotFather`** di Telegram.
2. Kirim perintah `/newbot`.
3. Ikuti instruksi untuk memberikan nama bot dan username.
4. Simpan **HTTP API Token** yang diberikan (ini adalah `TELEGRAM_TOKEN`).

### Langkah B: Dapatkan Chat ID Anda
1. Buka Telegram dan cari bot Anda yang baru dibuat.
2. Kirim pesan apa saja (misalnya "Halo") ke bot tersebut untuk mengaktifkan obrolan.
3. Cari user **`@userinfobot`** di Telegram.
4. Kirim pesan apa saja ke `@userinfobot`, dan bot tersebut akan membalas dengan **Id** Anda (deretan angka, contoh: `123456789`). Ini adalah `TELEGRAM_TO`.

### Langkah C: Masukkan ke GitHub Secrets
1. Buka kembali halaman **Settings** > **Secrets and variables** > **Actions** di GitHub.
2. Buat secret baru bernama **`TELEGRAM_TOKEN`** dan masukkan HTTP API Token bot Anda.
3. Buat secret baru bernama **`TELEGRAM_TO`** dan masukkan Chat ID Anda.

---

## 3. Konfigurasi Nginx Reverse Proxy di VPS (Ubuntu 22.04)
Untuk mengarahkan domain/IP ke port aplikasi Next.js (port 3000):

1. Instal Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```
2. Buat berkas konfigurasi baru:
   ```bash
   sudo nano /etc/nginx/sites-available/parheheon
   ```
3. Tempelkan konfigurasi berikut:
   ```nginx
   server {
       listen 80;
       server_name 157.10.252.183; # Ganti dengan domain jika ada

       # Konfigurasi unggahan maksimum untuk menangani video/foto besar
       client_max_body_size 100M;

       # Menyajikan file unggahan (video & foto) langsung via Nginx
       # Hal ini wajib agar range requests video (seek/putar) didukung penuh oleh browser
       location /uploads/ {
           alias /home/wmjoas/parheheon-sm-HKBP/public/uploads/;
           access_log off;
           expires max;
           add_header Cache-Control "public, no-transform";
       }

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. Aktifkan konfigurasi dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/parheheon /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 4. Konfigurasi PM2 Process Manager di VPS
PM2 akan menjaga aplikasi Next.js Anda tetap hidup di latar belakang.

1. Instal PM2 secara global:
   ```bash
   sudo npm install pm2 -g
   ```
2. Jalankan aplikasi Next.js dengan nama `parheheon-app`:
   ```bash
   cd /home/wmjoas/parheheon-sm-HKBP
   pm2 start npm --name "parheheon-app" -- start -- -p 3000
   ```
3. Simpan daftar proses PM2 agar otomatis hidup ketika VPS restart:
   ```bash
   pm2 save
   pm2 startup
   ```
   *Salin dan jalankan perintah perintah keluaran `pm2 startup` jika diminta.*

---

## 5. Cara Memulai Deployment Pertama Kali
Setelah semua konfigurasi di atas selesai:
1. Lakukan commit lokal pada perubahan kode Anda:
   ```bash
   git add .
   git commit -m "feat: perbaikan validasi upload dan konfigurasi CI/CD"
   ```
2. Dorong kode ke GitHub:
   ```bash
   git push origin main
   ```
3. GitHub Actions akan mendeteksi push Anda, memvalidasi build, melakukan SSH ke VPS, menarik kode terbaru, membangun proyek, memicu PM2 untuk memuat ulang server tanpa waktu henti (*zero downtime reload*), dan mengirim notifikasi ke Telegram Anda!
4. Anda dapat membaca file log deployment di VPS dengan perintah:
   ```bash
   tail -f /home/wmjoas/deploy.log
   ```
