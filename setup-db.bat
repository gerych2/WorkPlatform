@echo off
echo Setting up PostgreSQL database...

REM Создаем базу данных
D:\PostgreSQL\bin\psql.exe -U postgres -c "CREATE DATABASE service_platform;" 2>nul
if %errorlevel% equ 0 (
    echo Database created successfully
) else (
    echo Database already exists or error occurred
)

REM Проверяем подключение
D:\PostgreSQL\bin\psql.exe -U postgres -d service_platform -c "SELECT 'Connected to service_platform' as status;"

echo Database setup complete!
pause

