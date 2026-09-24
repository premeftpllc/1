# Regenerate ~/.continue/.env from the SOPS-encrypted shared secrets (Windows).
# Requires: sops + age (winget install FiloSottile.age SecretsOPerationS.SOPS)
# and your age PRIVATE key at %USERPROFILE%\.config\sops\age\keys.txt
$ErrorActionPreference = 'Stop'
$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")

$repo = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $repo 'secrets\premeos.env'
$dest = Join-Path $env:USERPROFILE '.continue\.env'
if (-not $env:SOPS_AGE_KEY_FILE) { $env:SOPS_AGE_KEY_FILE = Join-Path $env:USERPROFILE '.config\sops\age\keys.txt' }

if (-not (Get-Command sops -ErrorAction SilentlyContinue)) { throw "sops not installed" }
if (-not (Test-Path $env:SOPS_AGE_KEY_FILE)) { throw "age private key missing at $env:SOPS_AGE_KEY_FILE" }
if (-not (Test-Path $src)) { throw "encrypted secrets not found at $src - run: git pull" }

New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
sops --decrypt $src | Set-Content -Path $dest -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw "sops decrypt failed" }

icacls $dest /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
$n = (Get-Content $dest | Select-String '^[A-Za-z_][A-Za-z0-9_]*=').Count
Write-Output "wrote $dest"
Write-Output "variables: $n"
Write-Output "(values not shown by design)"
Write-Output ""
Write-Output "Next: reload the VS Code window so Continue re-reads it."
