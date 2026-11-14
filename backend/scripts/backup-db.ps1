# Mela Note - Windows PowerShell MySQL Backup Script
param(
    [string]$BackupDir = ".\backups"
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = Join-Path $BackupDir "mela_note_$Timestamp.sql"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "[INFO] Starting database backup..."
& mysqldump -u root -p --single-transaction --quick --routines --triggers mela_note > $BackupPath

if (Test-Path $BackupPath) {
    Write-Host "[SUCCESS] Backup written to $BackupPath"
} else {
    Write-Error "[ERROR] Backup failed."
}
