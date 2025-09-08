# 📧 Настройка Gmail SMTP для рассылки

## 🔧 Пошаговая инструкция:

### 1. Создайте пароль приложения:
1. Перейдите в [Google Account Security](https://myaccount.google.com/security)
2. Включите **2-Step Verification** (если не включена)
3. Перейдите в [App Passwords](https://myaccount.google.com/apppasswords)
4. Выберите **Mail** и **Other (Custom name)**
5. Введите название: "Service Platform"
6. Скопируйте сгенерированный пароль (16 символов)

### 2. Обновите .env файл:
```env
# Database
DATABASE_URL="postgresql://postgres:German2006@localhost:5432/service_platform?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Gmail SMTP (замените на ваши данные)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="ваш-email@gmail.com"
EMAIL_PASS="ваш-пароль-приложения-16-символов"

# Formspree (резервный вариант)
FORMSPREE_ENDPOINT="https://formspree.io/f/mrbarkjl"
```

### 3. Протестируйте:
```bash
npx tsx scripts/test-email-system.ts
```

## ✅ Что работает:
- **500 emails/день** бесплатно
- **Надежная доставляемость** Gmail
- **Все типы уведомлений** (заказы, уровни, рассылки)
- **Красивые HTML шаблоны**

## 🚨 Важно:
- Используйте **пароль приложения**, не обычный пароль
- Включите **2-Step Verification** обязательно
- Пароль приложения: 16 символов без пробелов
