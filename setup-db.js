const { exec } = require('child_process');
const path = require('path');

console.log('Setting up PostgreSQL database...');

const psqlPath = 'D:\\PostgreSQL\\bin\\psql.exe';

// Функция для выполнения команд
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error: ${error.message}`);
                resolve(false);
                return;
            }
            if (stderr) {
                console.log(`Stderr: ${stderr}`);
            }
            console.log(`Output: ${stdout}`);
            resolve(true);
        });
    });
}

async function setupDatabase() {
    try {
        // Создаем базу данных
        console.log('Creating database...');
        await runCommand(`"${psqlPath}" -U postgres -c "CREATE DATABASE service_platform;"`);
        
        // Проверяем подключение
        console.log('Testing connection...');
        await runCommand(`"${psqlPath}" -U postgres -d service_platform -c "SELECT 'Connected to service_platform' as status;"`);
        
        console.log('Database setup complete!');
    } catch (error) {
        console.error('Setup failed:', error);
    }
}

setupDatabase();

