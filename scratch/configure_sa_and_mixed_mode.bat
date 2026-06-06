@echo off
:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ====================================================================
    echo  PERINGATAN: File ini harus dijalankan sebagai ADMINISTRATOR!
    echo  Silakan klik kanan file ini dan pilih "Run as administrator".
    echo ====================================================================
    pause
    exit /b
)

echo 1. Mengubah pengaturan LoginMode ke Mixed Mode (2) di Registry...
powershell -Command "Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer' -Name 'LoginMode' -Value 2"

echo.
echo 2. Merestart layanan SQL Server (MSSQLSERVER) agar pengaturan baru aktif...
net stop MSSQLSERVER /y
net start MSSQLSERVER

echo.
echo 3. Mengatur ulang password 'sa' menjadi 'YourStrongPassword123' dan mengaktifkan akun sa...
"C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\180\Tools\Binn\SQLCMD.EXE" -E -S localhost -Q "ALTER LOGIN sa WITH PASSWORD = 'YourStrongPassword123'; ALTER LOGIN sa ENABLE;"

echo.
echo ====================================================================
echo  Sukses! Mixed Mode diaktifkan, password 'sa' diset, dan akun aktif.
echo  Silakan coba sambungkan kembali database.
echo ====================================================================
pause
