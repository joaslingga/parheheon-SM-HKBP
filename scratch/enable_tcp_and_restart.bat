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

echo Mengaktifkan protokol TCP/IP untuk SQL Server...
powershell -Command "Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp' -Name 'Enabled' -Value 1"

echo.
echo Merestart layanan SQL Server (MSSQLSERVER)...
net stop MSSQLSERVER /y
net start MSSQLSERVER

echo.
echo ====================================================================
echo  Sukses! Protokol TCP/IP telah diaktifkan dan SQL Server direstart.
echo  Sekarang Anda bisa mencoba menghubungkan database kembali.
echo ====================================================================
pause
