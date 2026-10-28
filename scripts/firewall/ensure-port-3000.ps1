# Pastikan port 3000 (dev server Next.js) bisa diakses dari perangkat lain di jaringan.
# Idempoten: membuat aturan bila belum ada, mengaktifkan kembali bila dinonaktifkan.
# Dijalankan otomatis saat login oleh task "Sisfo Belneg UBK - Firewall 3000" (lihat install.cmd).

$ruleName = 'Sisfo Belneg UBK (3000)'
$rule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (-not $rule) {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 3000 `
    -Action Allow -Profile Any | Out-Null
  Write-Output "Aturan firewall '$ruleName' dibuat."
} elseif ($rule.Enabled -ne 'True') {
  Enable-NetFirewallRule -DisplayName $ruleName
  Write-Output "Aturan firewall '$ruleName' diaktifkan kembali."
} else {
  Write-Output "Aturan firewall '$ruleName' sudah aktif."
}
