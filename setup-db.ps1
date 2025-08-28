Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green

# Путь к PostgreSQL
$psqlPath = "D:\PostgreSQL\bin\psql.exe"

# Создаем базу данных
Write-Host "Creating database..." -ForegroundColor Yellow
& $psqlPath -U postgres -c "CREATE DATABASE service_platform;" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully" -ForegroundColor Green
} else {
    Write-Host "Database already exists or error occurred" -ForegroundColor Yellow
}

# Проверяем подключение
Write-Host "Testing connection..." -ForegroundColor Yellow
& $psqlPath -U postgres -d service_platform -c "SELECT 'Connected to service_platform' as status;"

Write-Host "Database setup complete!" -ForegroundColor Green
Read-Host "Press Enter to continue"

