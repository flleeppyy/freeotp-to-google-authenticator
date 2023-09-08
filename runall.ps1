Write-Output "Opening to home..."
adb shell input keyevent KEYCODE_POWER
adb shell input keyevent KEYCODE_HOME
Write-Output "Waiting..."
Start-Sleep -Milliseconds 2000
Write-Output "Attempting to kill Google Authenticator..."
$processList = adb shell ps
$regexPattern = 'u0_.+    (\d+).*com\.google\.android\.apps\.authenticator2'
$_matches = $processList | Select-String -Pattern $regexPattern
if ($_matches -and $_matches.Matches.Count -gt 0) {
  foreach ($match in $_matches) {
    $_pid = $match.Matches[0].Groups[1].Value
    Write-Output "Killing GA with PID $_pid"
    adb shell su -c "kill $_pid"
  }
}

Write-Output "Pulling database from Google Authenticator..."
adb pull /data/data/com.google.android.apps.authenticator2/databases/databases
Write-Output "Running script..."
node index.js
Write-Output "Pushing database back to device..."
adb push ./databases /data/data/com.google.android.apps.authenticator2/databases/databases
Write-Output "Done!"