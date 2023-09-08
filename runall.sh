#!/bin/bash
echo Opening to home...
adb shell input keyevent KEYCODE_POWER
adb shell input keyevent KEYCODE_HOME
echo Waiting...
sleep 2
processList=$(adb shell ps)
regexPattern='u0_.+    ([0-9]+).*com\.google\.android\.apps\.authenticator2'
matches=$(echo "$processList" | grep -E "$regexPattern")

if [[ -n "$matches" ]]; then
  while read -r line; do
    pid=$(echo "$line" | awk '{print $2}')

    echo "Killing GA with PID $_pid"
    adb shell su -c "kill $pid"
  done <<< "$matches"
fi

echo "Pulling database from Google Authenticator..."
adb pull /data/data/com.google.android.apps.authenticator2/databases/databases
echo "Running script..."
node index.js
echo "Pushing database back to device..."
adb push ./databases /data/data/com.google.android.apps.authenticator2/databases/databases

