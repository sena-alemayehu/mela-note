# Mela Note - Windows PowerShell MySQL Restore Script
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$TargetDatabase = "mela_note"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $BackupFile)) {
    Write-Error "[ERROR] Backup file not found: $BackupFile"
    exit 1
}

Write-Host "[INFO] Restoring $BackupFile to $TargetDatabase..."
Get-Content $BackupFile | & mysql -u root -p $TargetDatabase
Write-Host "[SUCCESS] Restoration completed successfully!"
