@echo off
echo =======================================
echo     APASIFIC GIT PUSH AUTOMATION
echo =======================================
echo.
echo 1. Staging all modified files...
git add .

echo 2. Committing changes...
git commit -m "Update metrics real calculation and recover articles mapping"

echo 3. Pushing to GitHub...
git push origin

echo.
echo =======================================
echo     GIT PUSH COMPLETED SUCCESSFULLY!
echo =======================================
pause
