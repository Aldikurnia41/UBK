@echo off
:: Hapus task & aturan firewall port 3000 yang dipasang install.cmd.

net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

schtasks /Delete /F /TN "Sisfo Belneg UBK - Firewall 3000" >nul 2>&1
powershell -NoProfile -Command "Remove-NetFirewallRule -DisplayName 'Sisfo Belneg UBK (3000)' -ErrorAction SilentlyContinue"
echo Task dan aturan firewall port 3000 dihapus.
pause
