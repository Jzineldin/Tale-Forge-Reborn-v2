# Simple Auto-Save Setup - Saves every 30 minutes

Write-Host "Setting up auto-save every 30 minutes..." -ForegroundColor Cyan

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"D:\10_Projects\Sista Chansen\Tale-Forge-Reborn-v2\quick-save.ps1`" `"Auto-save`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 9999)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName "TaleForgeAutoSave" -Action $action -Trigger $trigger -Settings $settings -Force

Write-Host "SUCCESS: Auto-save enabled! Your project will save every 30 minutes." -ForegroundColor Green
Write-Host ""
Write-Host "To disable auto-save, run:" -ForegroundColor Yellow
Write-Host "  Unregister-ScheduledTask -TaskName TaleForgeAutoSave -Confirm:`$false" -ForegroundColor White