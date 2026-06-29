# setup-google-audio.ps1
# Configure Google Gemini TTS credentials for local developer generation only.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Arabic Adventures - Google Audio Setup  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFilePath = Join-Path $ProjectRoot ".env"
$GitIgnorePath = Join-Path $ProjectRoot ".gitignore"

if (-not (Test-Path $EnvFilePath)) {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    Set-Content -Path $EnvFilePath -Value 'DATABASE_URL="file:./data/arabic-adventures.db"'
}

if (Test-Path $GitIgnorePath) {
    $gitIgnore = Get-Content $GitIgnorePath -Raw
    if ($gitIgnore -notmatch "(?m)^\.env$") {
        Add-Content -Path $GitIgnorePath -Value "`n.env"
        Write-Host "Added .env to .gitignore" -ForegroundColor Yellow
    }
} else {
    Write-Warning ".gitignore not found. Ensure .env is never committed."
}

$EnvContent = @(Get-Content $EnvFilePath | Where-Object { $_ -ne "" })

function Remove-EnvKey {
    param([string[]]$Lines, [string]$KeyPattern)
    return @($Lines | Where-Object { $_ -notmatch $KeyPattern })
}

Write-Host "Choose Google Audio authentication mode:"
Write-Host "1) Gemini Developer API Key (Recommended)"
Write-Host "2) Google Cloud Vertex AI"
$choice = Read-Host "Enter choice [1 or 2]"

if ($choice -eq "1") {
    Write-Host ""
    $apiKey = Read-Host "Enter your GEMINI_API_KEY" -AsSecureString
    $apiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
    )
    if ([string]::IsNullOrWhiteSpace($apiKeyPlain)) {
        Write-Host "Error: API Key cannot be empty." -ForegroundColor Red
        exit 1
    }

    $EnvContent = Remove-EnvKey $EnvContent "^GEMINI_API_KEY="
    $EnvContent = Remove-EnvKey $EnvContent "^GOOGLE_CLOUD_PROJECT="
    $EnvContent = Remove-EnvKey $EnvContent "^GOOGLE_CLOUD_LOCATION="
    $EnvContent = Remove-EnvKey $EnvContent "^GOOGLE_APPLICATION_CREDENTIALS="
    $EnvContent += 'GEMINI_API_KEY="' + $apiKeyPlain + '"'
    $EnvContent += 'GEMINI_TTS_MODEL="gemini-2.5-flash-preview-tts"'
    $EnvContent += 'GEMINI_TTS_FALLBACK_MODEL="gemini-2.5-flash-preview-tts"'

    Set-Content -Path $EnvFilePath -Value $EnvContent
    Write-Host "Saved Gemini API key mode to .env (value not displayed)." -ForegroundColor Green
}
elseif ($choice -eq "2") {
    Write-Host ""
    $project = Read-Host "Enter Google Cloud Project ID"
    $location = Read-Host "Enter Google Cloud Region (e.g. us-central1)"
    $credentialsPath = Read-Host "Enter path to service account JSON (GOOGLE_APPLICATION_CREDENTIALS)"

    if ([string]::IsNullOrWhiteSpace($project) -or [string]::IsNullOrWhiteSpace($location)) {
        Write-Host "Error: Project ID and Location cannot be empty." -ForegroundColor Red
        exit 1
    }
    if (-not (Test-Path $credentialsPath)) {
        Write-Host "Error: Credentials file not found at the provided path." -ForegroundColor Red
        exit 1
    }

    $EnvContent = Remove-EnvKey $EnvContent "^GEMINI_API_KEY="
    $EnvContent = Remove-EnvKey $EnvContent "^GOOGLE_CLOUD_PROJECT="
    $EnvContent = Remove-EnvKey $EnvContent "^GOOGLE_CLOUD_LOCATION="
    $EnvContent = Remove-EnvKey $EnvContent "^GOOGLE_APPLICATION_CREDENTIALS="
    $EnvContent += 'GOOGLE_CLOUD_PROJECT="' + $project + '"'
    $EnvContent += 'GOOGLE_CLOUD_LOCATION="' + $location + '"'
    $EnvContent += 'GOOGLE_APPLICATION_CREDENTIALS="' + $credentialsPath + '"'
    $EnvContent += 'GEMINI_TTS_MODEL="gemini-2.5-flash-preview-tts"'
    $EnvContent += 'GEMINI_TTS_FALLBACK_MODEL="gemini-2.5-flash-preview-tts"'

    Set-Content -Path $EnvFilePath -Value $EnvContent
    Write-Host "Saved Vertex AI configuration to .env (secrets not displayed)." -ForegroundColor Green
    Write-Host "Before generation, obtain an access token in this shell, for example:" -ForegroundColor Yellow
    Write-Host '  $env:GCLOUD_ACCESS_TOKEN = (gcloud auth print-access-token)' -ForegroundColor Yellow
}
else {
    Write-Host "Invalid choice." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Validating that generation scripts can read configuration..." -ForegroundColor Cyan
Push-Location $ProjectRoot
node --input-type=module -e @"
import dotenv from 'dotenv';
dotenv.config();
const hasKey = !!process.env.GEMINI_API_KEY;
const hasVertex = !!(process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION);
if (!hasKey && !hasVertex) {
  console.error('Validation failed: no readable Google credentials in .env');
  process.exit(1);
}
console.log('Validation passed. Mode:', hasKey ? 'gemini_api_key' : 'vertex_ai');
"@ 
$validationExit = $LASTEXITCODE
Pop-Location

if ($validationExit -ne 0) {
    Write-Host "Configuration validation failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setup complete. Next safe command:" -ForegroundColor Green
Write-Host "  pnpm.cmd audio:audition:google --canary" -ForegroundColor Green
Write-Host ""
Write-Host "Do not commit .env. Runtime student pages never use these credentials." -ForegroundColor Yellow
