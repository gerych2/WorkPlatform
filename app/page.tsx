import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Service Platform Belarus
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Найдите лучших мастеров в Беларуси или станьте исполнителем и зарабатывайте на своих навыках по всей РБ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-600 text-3xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Я клиент
              </h2>
              <p className="text-gray-600 mb-6">
                Ищу мастера в Беларуси для выполнения задач. Хочу быстро найти проверенного профессионала и забронировать услугу.
              </p>
              <div className="space-y-3">
                <Link href="/auth/register?role=client">
                  <button className="btn-primary w-full">
                    Зарегистрироваться как клиент
                  </button>
                </Link>
                <Link href="/dashboard/client">
                  <button className="btn-secondary w-full">
                    Войти в личный кабинет
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-600 text-3xl">🔧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Я исполнитель
              </h2>
              <p className="text-gray-600 mb-6">
                Предоставляю услуги клиентам в Беларуси. Имею официальную регистрацию (ИП/Юр.лицо/Самозанятый) и хочу развивать свой бизнес.
              </p>
              <div className="space-y-3">
                <Link href="/auth/register?role=executor">
                  <button className="btn-primary w-full">
                    Зарегистрироваться как исполнитель
                  </button>
                </Link>
                <Link href="/dashboard/executor">
                  <button className="btn-secondary w-full">
                    Войти в личный кабинет
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Уже есть аккаунт?
          </p>
          <Link href="/auth/login">
            <button className="btn-outline">
              Войти в систему
            </button>
          </Link>
        </div>

        {/* Демо-ссылки для разработки */}
        <div className="mt-16 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🚀 Демо-версия (для разработки)
          </h3>
          
          <div className="text-center mb-4">
            <a href="/debug" className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
              🔍 Страница отладки
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Клиент */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3 text-center">👤 Клиент</h4>
              <div className="grid grid-cols-1 gap-2">
                <Link href="/dashboard/client">
                  <button className="w-full px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                    Кабинет клиента
                  </button>
                </Link>
                <Link href="/dashboard/client/search">
                  <button className="w-full px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                    Поиск мастеров
                  </button>
                </Link>
                <Link href="/dashboard/client/orders">
                  <button className="w-full px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors">
                    Мои заказы
                  </button>
                </Link>
                <Link href="/dashboard/client/booking">
                  <button className="w-full px-4 py-2 text-sm bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors">
                    Бронирование услуги
                  </button>
                </Link>
              </div>
            </div>

            {/* Исполнитель */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3 text-center">🔧 Исполнитель</h4>
              <div className="grid grid-cols-1 gap-2">
                <Link href="/dashboard/executor">
                  <button className="w-full px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors">
                    Кабинет исполнителя
                  </button>
                </Link>
                <Link href="/dashboard/executor/calendar">
                  <button className="w-full px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors">
                    Календарь и расписание
                  </button>
                </Link>
                <Link href="/dashboard/executor/subscription">
                  <button className="w-full px-4 py-2 text-sm bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors">
                    Управление подпиской
                  </button>
                </Link>
              </div>
            </div>

            {/* Администратор */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3 text-center">👨‍💼 Администратор</h4>
              <div className="grid grid-cols-1 gap-2">
                <Link href="/admin">
                  <button className="w-full px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                    Админ-панель
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 