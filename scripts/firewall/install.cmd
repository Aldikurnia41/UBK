@echo off
:: Pasang aturan firewall port 3000 sekarang + daftarkan task agar dicek ulang setiap login.
:: Cukup dijalankan SEKALI: klik kanan > Run as administrator (atau klik ganda, akan minta izin).

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Meminta hak Administrator...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

set "SCRIPT=%~dp0ensure-port-3000.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"

schtasks /Create /F /TN "Sisfo Belneg UBK - Firewall 3000" /SC ONLOGON /RL HIGHEST ^
  /TR "powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \"%SCRIPT%\"" >nul

if %errorlevel% equ 0 (
  echo Task "Sisfo Belneg UBK - Firewall 3000" terdaftar: aturan dicek ulang setiap login.
) else (
  echo Gagal mendaftarkan task.
)
pause
