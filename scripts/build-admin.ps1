param(
  [string]$IconPath = "assets/vetwraps.ico"
)

Write-Host "Building VetWraps Admin EXE..." -ForegroundColor Cyan
if (Test-Path $IconPath) {
  pyinstaller --noconsole --onefile --name VetWrapsAdmin --icon $IconPath vetwraps_admin.py
} else {
  Write-Host "Icon not found at $IconPath. Building without icon..." -ForegroundColor Yellow
  pyinstaller --noconsole --onefile --name VetWrapsAdmin vetwraps_admin.py
}

New-Item -ItemType Directory -Force -Path admin_dist | Out-Null
if (Test-Path dist/VetWrapsAdmin.exe) { Move-Item -Force dist/VetWrapsAdmin.exe admin_dist/ }
Write-Host "Output: admin_dist/VetWrapsAdmin.exe" -ForegroundColor Green

