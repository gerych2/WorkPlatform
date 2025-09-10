# Настройка NextAuth

Для работы системы стартапов необходимо добавить следующие переменные в ваш `.env` файл:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Database (если еще не добавлено)
DATABASE_URL="postgresql://postgres:password@localhost:5432/service_platform"

# Email Configuration (если еще не добавлено)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=skodagrodno2006@gmail.com
EMAIL_PASS=your-app-password-here
```

## Генерация NEXTAUTH_SECRET

Для генерации безопасного секретного ключа выполните:

```bash
openssl rand -base64 32
```

Или используйте онлайн генератор: https://generate-secret.vercel.app/32

## После добавления переменных

1. Перезапустите сервер разработки:
   ```bash
   npm run dev
   ```

2. Система стартапов будет доступна по адресу: http://localhost:3000/startups

## Возможные проблемы

- Убедитесь, что база данных запущена
- Проверьте, что все переменные окружения загружены
- Убедитесь, что NextAuth API route доступен по адресу: http://localhost:3000/api/auth/signin

