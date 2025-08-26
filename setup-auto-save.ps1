# Setup Auto-Save Task Scheduler
# This creates an hourly automatic backup of your project

Write-Host "⏰ Setting up Automatic Saves..." -ForegroundColor Cyan

# Task configuration
$taskName = "TaleForgeAutoSave"
$taskPath = "D:\10_Projects\Sista Chansen\Tale-Forge-Reborn-v2\quick-save.ps1"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task already exists. Updating..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the action (what to run)
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$taskPath`" `"Auto-save`""

# Create the trigger (when to run)
Write-Host ""
Write-Host "How often do you want to auto-save?" -ForegroundColor Yellow
Write-Host "1. Every 30 minutes (Recommended)" -ForegroundColor White
Write-Host "2. Every hour" -ForegroundColor White
Write-Host "3. Every 2 hours" -ForegroundColor White
Write-Host "4. Every 15 minutes (Aggressive)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" { 
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 9999)
        $interval = "30 minutes"
    }
    "2" { 
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 9999)
        $interval = "1 hour"
    }
    "3" { 
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 2) -RepetitionDuration (New-TimeSpan -Days 9999)
        $interval = "2 hours"
    }
    "4" { 
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 9999)
        $interval = "15 minutes"
    }
    default { 
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 9999)
        $interval = "30 minutes"
    }
}

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -DontStopOnIdleEnd

# Create the task
$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings

# Register the task
Register-ScheduledTask `
    -TaskName $taskName `
    -InputObject $task `
    -User $env:USERNAME `
    -Force | Out-Null

Write-Host ""
Write-Host "✅ Auto-save configured!" -ForegroundColor Green
Write-Host "📍 Your project will auto-save every $interval" -ForegroundColor Yellow
Write-Host ""
Write-Host "Task Management Commands:" -ForegroundColor Cyan
Write-Host "  View task status:" -ForegroundColor White
Write-Host "    Get-ScheduledTask -TaskName TaleForgeAutoSave" -ForegroundColor Gray
Write-Host ""
Write-Host "  Disable auto-save:" -ForegroundColor White
Write-Host "    Disable-ScheduledTask -TaskName TaleForgeAutoSave" -ForegroundColor Gray
Write-Host ""
Write-Host "  Enable auto-save:" -ForegroundColor White
Write-Host "    Enable-ScheduledTask -TaskName TaleForgeAutoSave" -ForegroundColor Gray
Write-Host ""
Write-Host "  Remove auto-save:" -ForegroundColor White
Write-Host "    Unregister-ScheduledTask -TaskName TaleForgeAutoSave -Confirm:`$false" -ForegroundColor Gray
Write-Host ""

# Test run
$runNow = Read-Host "Test the auto-save now? (y/n)"
if ($runNow -eq 'y') {
    Write-Host "Running test save..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $taskName
    Start-Sleep -Seconds 3
    Write-Host "✅ Test complete! Check your Git history to confirm." -ForegroundColor Green
}

Write-Host ""
Write-Host "TIP: You can still manually save anytime with:" -ForegroundColor Cyan
Write-Host "  .\quick-save.ps1" -ForegroundColor White
Write-Host "  Ctrl+Alt+S in Cursor" -ForegroundColor White