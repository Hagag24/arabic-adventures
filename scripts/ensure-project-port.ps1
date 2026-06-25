param (
    [int]$Port = 3000
)

# Find the process ID listening on the specified port
$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
    Write-Host "No process listening on port $Port."
    exit 0
}

# Use a non-reserved variable name instead of the read-only $pid
$targetPid = $connections[0].OwningProcess
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $targetPid" -ErrorAction SilentlyContinue
if (-not $process) {
    Write-Host "Could not retrieve process info for PID $targetPid."
    exit 0
}

$commandLine = $process.CommandLine
$name = $process.Name

Write-Host "Found process $name (PID $targetPid) listening on port $Port."
Write-Host "Command line: $commandLine"

# Confirm that the command belongs to D:\arabic-adventures
if ($commandLine -like "*D:\arabic-adventures*" -or $process.ExecutablePath -like "*D:\arabic-adventures*") {
    Write-Host "This process belongs to D:\arabic-adventures. Terminating process $targetPid..."
    Stop-Process -Id $targetPid -Force
    # Wait for connection to clear
    Start-Sleep -Seconds 2
    Write-Host "Process terminated successfully."
} else {
    Write-Warning "ABORTED: Port $Port is owned by an external application: $name (PID $targetPid)."
    Write-Warning "We will not terminate this process because it does not belong to D:\arabic-adventures."
    exit 1
}
