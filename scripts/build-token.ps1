Write-Host "Building VetWraps Token Issuer EXE..." -ForegroundColor Cyan
if (-not (Get-Command pyinstaller -ErrorAction SilentlyContinue)) {
  Write-Host "PyInstaller not found. Installing..." -ForegroundColor Yellow
  python -m pip install pyinstaller > $null
}
pyinstaller --noconsole --onefile --name TokenIssuer vetwraps_token_gen.py
New-Item -ItemType Directory -Force -Path admin_dist | Out-Null
if (Test-Path dist/TokenIssuer.exe) { Move-Item -Force dist/TokenIssuer.exe admin_dist/ }
Write-Host "Output: admin_dist/TokenIssuer.exe" -ForegroundColor Green

