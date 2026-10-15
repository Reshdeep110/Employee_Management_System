@echo off
echo Demo mode uses H2, not MySQL. Read START-HERE-WINDOWS.md for first-admin setup.
echo For your MySQL database, close this and use start-backend-mysql.cmd.
cd /d "%~dp0backend"
set SPRING_PROFILES_ACTIVE=demo
call mvnw.cmd spring-boot:run
pause
