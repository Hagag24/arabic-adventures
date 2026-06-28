# This script registers a one-time Windows scheduled task to automatically resume audio generation.
# It uses the calculated next safe retry time.
# WARNING: Do not run this script unless you explicitly want to register a background scheduled task.

$StatePath = "D:\arabic-adventures\development\audio\state\gemini-quota-status.json"
if (-Not (Test-Path $StatePath)) {
    Write-Error "Quota status file not found."
    exit 1
}

$Status = Get-Content $StatePath | ConvertFrom-Json

# Attempt to determine time from the JSON
$Delay = 60 # Default 1 min
if ($Status.quotaId -match "PerDay" -or $Status.quotaId -match "RPD") {
    # 8 AM UTC the next day
    $ReqTime = [datetime]$Status.requestTimestamp
    $NextDay = $ReqTime.AddDays(1)
    $TargetUtc = [datetime]::new($NextDay.Year, $NextDay.Month, $NextDay.Day, 7, 5, 0, [System.DateTimeKind]::Utc)
    $TargetLocal = $TargetUtc.ToLocalTime()
} else {
    $TargetLocal = [datetime]::Now.AddMinutes(1)
}

$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d D:\arabic-adventures && pnpm.cmd audio:generate:resume >> development\audio\logs\auto-resume.log 2>&1"
$Trigger = New-ScheduledTaskTrigger -Once -At $TargetLocal.ToString("HH:mm")
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$TaskName = "ArabicAdventuresAudioResume"

# Register the scheduled task
Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName $TaskName -Description "Resumes Gemini TTS audio generation when quota is reset" -Force

Write-Host "Scheduled task '$TaskName' registered to run at $TargetLocal"
