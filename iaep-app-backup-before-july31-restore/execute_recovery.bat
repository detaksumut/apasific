@echo off
echo ========================================================
echo APASIFIC SYSTEM RECOVERY SCRIPT (Target: July 30, 2026)
echo ========================================================
echo.

echo [1/4] Creating full project backup...
cd /d d:\Users\apasific
xcopy /E /I /H /Y iaep-app iaep-app-backup-before-july31-restore
echo Full backup created at d:\Users\apasific\iaep-app-backup-before-july31-restore
echo.

echo [2/4] Creating dedicated backup for user data...
copy /Y iaep-app\apasific_registered_users.json iaep-app-backup-before-july31-restore\apasific_registered_users_DATA_BACKUP.json
echo User data secured.
echo.

echo [3/4] Resetting project to stable commit e477a726ed7aa5eb4d0c37a5f7323196db965314...
cd iaep-app
git reset --hard e477a726ed7aa5eb4d0c37a5f7323196db965314
echo Git reset complete.
echo.

echo [4/4] Cleaning untracked and corrupted files...
git clean -fd
echo Git clean complete.
echo.

echo ========================================================
echo RECOVERY SUCCESSFUL!
echo ========================================================
echo Please restart your Next.js server (npm run dev) and verify the login.
pause
