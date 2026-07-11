# Build the custom Photos for Proton installer (a self-contained setup.exe that
# carries the whole app as an embedded zip). Output: Photos-for-Proton-Setup.exe
$repo      = $PSScriptRoot
$app       = "$repo\app"
$appTauri  = "$app\src-tauri"
$sidecar   = "$repo\sidecar"
$setup     = "$repo\setup"
$setupTauri= "$setup\src-tauri"
$binexe    = "$appTauri\binaries\sidecar-x86_64-pc-windows-msvc.exe"
$stage     = "$setupTauri\target\payload-stage"
$payloadZip= "$setupTauri\payload\payload.zip"

function Step($m){ Write-Host "`n==== $m ====" }
function Check($w){ if ($LASTEXITCODE -ne 0){ Write-Host "FAILED: $w (exit $LASTEXITCODE)"; exit 1 } }

# 1. Build the main app (embedded prod frontend). MUST be `tauri build`, never
#    plain cargo (which ships the dev-URL blank page).
Step "1/4 build main app (tauri build --no-bundle)"
Set-Location $app
npm run tauri build -- --no-bundle
Check "main app build"

# 2. Assemble the payload: app.exe + sidecar.exe + sidecar/.
Step "2/4 assemble payload"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$stage\resources\sidecar" | Out-Null
Copy-Item "$appTauri\target\release\app.exe" "$stage\app.exe" -Force
Copy-Item $binexe "$stage\resources\sidecar.exe" -Force
Copy-Item "$sidecar\build\*" "$stage\resources\sidecar\" -Recurse -Force

# 3. Zip it (deflate; the installer reads it with the `zip` crate).
Step "3/4 zip payload"
New-Item -ItemType Directory -Force -Path "$setupTauri\payload" | Out-Null
if (Test-Path $payloadZip) { Remove-Item $payloadZip -Force }
Compress-Archive -Path "$stage\*" -DestinationPath $payloadZip -Force
"payload.zip: {0:N1} MB" -f ((Get-Item $payloadZip).Length/1MB)

# 4. Build the installer (embeds payload.zip via include_bytes!).
Step "4/4 build installer (tauri build --no-bundle)"
Set-Location $setup
npm run tauri build -- --no-bundle
Check "installer build"

$out   = "$setupTauri\target\release\setup.exe"
$final = "$repo\Photos-for-Proton-Setup.exe"
Copy-Item $out $final -Force
Step "DONE"
"installer -> $final  ({0:N1} MB)" -f ((Get-Item $final).Length/1MB)
Write-Host "SUCCESS"
