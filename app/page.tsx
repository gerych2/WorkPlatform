'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Users, Zap, Shield, Rocket, CheckCircle, Play } from 'lucide-react'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsVisible(true)
  }, [])

  return (
           <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
             {/* Floating elements */}
             <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-20 animate-pulse"></div>
             <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-400 rounded-full opacity-20 animate-bounce"></div>
             <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-full opacity-20 animate-pulse"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <Rocket className="h-5 w-5 text-white mr-2" />
                <span className="text-white/90 text-sm font-medium">Новая эра фриланса в Беларуси</span>
              </div>
              
                     <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
                       <span className="bg-gradient-to-r from-white via-emerald-200 to-primary-200 bg-clip-text text-transparent">
                         ProDo
                       </span>
                       <br />
                       <span className="text-4xl md:text-6xl bg-gradient-to-r from-primary-400 to-primary-400 bg-clip-text text-transparent">
                         Agency
                       </span>
                     </h1>
              
              <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto mb-12 leading-relaxed">
                Найдите лучших мастеров в Беларуси или станьте исполнителем и зарабатывайте на своих навыках по всей РБ
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">1000+</div>
                  <div className="text-white/70">Довольных клиентов</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">500+</div>
                  <div className="text-white/70">Проверенных мастеров</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">98%</div>
                  <div className="text-white/70">Успешных проектов</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Client Card */}
                   <div className="group relative">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                     <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 group-hover:scale-105">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                     <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-6 transition-transform duration-300">
                       <Users className="h-12 w-12 text-white" />
                     </div>
                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-400 rounded-full flex items-center justify-center">
                       <Star className="h-4 w-4 text-white" />
                     </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Я клиент
                  </h2>
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    Ищу мастера в Беларуси для выполнения задач. Хочу быстро найти проверенного профессионала и забронировать услугу.
                  </p>
                  
                  <div className="space-y-4">
                           <Link href="/auth/register?role=client">
                             <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center group">
                               Зарегистрироваться как клиент
                               <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                             </button>
                           </Link>
                    <Link href="/dashboard/client">
                      <button className="w-full bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50">
                        Войти в личный кабинет
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

                   {/* Executor Card */}
                   <div className="group relative">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                     <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 group-hover:scale-105">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                     <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-6 transition-transform duration-300">
                       <Zap className="h-12 w-12 text-white" />
                     </div>
                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                       <Shield className="h-4 w-4 text-white" />
                     </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Я исполнитель
                  </h2>
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    Предоставляю услуги клиентам в Беларуси. Имею официальную регистрацию (ИП/Юр.лицо/Самозанятый) и хочу развивать свой бизнес.
                  </p>
                  
                  <div className="space-y-4">
                           <Link href="/auth/register?role=executor">
                             <button className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center group">
                               Зарегистрироваться как исполнитель
                               <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                             </button>
                           </Link>
                    <Link href="/dashboard/executor">
                      <button className="w-full bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50">
                        Войти в личный кабинет
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Почему выбирают нас?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Мы создали платформу, которая объединяет лучших мастеров и клиентов в Беларуси
            </p>
          </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                   <div className="text-center group">
                     <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                       <Shield className="h-8 w-8 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-4">Безопасность</h3>
                     <p className="text-white/70">Все мастера проходят проверку документов и имеют официальную регистрацию</p>
                   </div>
                   
                   <div className="text-center group">
                     <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                       <Zap className="h-8 w-8 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-4">Быстрота</h3>
                     <p className="text-white/70">Найдите мастера за несколько минут и забронируйте услугу онлайн</p>
                   </div>
                   
                   <div className="text-center group">
                     <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                       <Star className="h-8 w-8 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-4">Качество</h3>
                     <p className="text-white/70">Система отзывов и рейтингов гарантирует высокое качество услуг</p>
                   </div>
                 </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-6">
                Готовы начать?
              </h3>
              <p className="text-white/80 mb-8 text-lg">
                Присоединяйтесь к тысячам довольных клиентов и мастеров
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                       <Link href="/auth/register">
                         <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center group">
                           Начать сейчас
                           <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                         </button>
                       </Link>
                
                {currentUser && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem('currentUser')
                      window.location.reload()
                    }}
                    className="px-6 py-3 text-white/80 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <svg className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Выйти из системы
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section - только для разработки */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
                <Rocket className="h-6 w-6 mr-3 text-secondary-400" />
                Демо-версия (для разработки)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Клиент */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6 text-center flex items-center justify-center">
                    <Users className="h-5 w-5 mr-2 text-primary-400" />
                    Клиент
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/dashboard/client">
                      <button className="w-full px-4 py-3 text-sm bg-primary-500/20 text-primary-200 rounded-xl hover:bg-primary-500/30 transition-all duration-300 border border-primary-400/30 hover:border-primary-400/50">
                        Кабинет клиента
                      </button>
                    </Link>
                    <Link href="/dashboard/client/search">
                      <button className="w-full px-4 py-3 text-sm bg-primary-500/20 text-primary-200 rounded-xl hover:bg-primary-500/30 transition-all duration-300 border border-primary-400/30 hover:border-primary-400/50">
                        Поиск мастеров
                      </button>
                    </Link>
                    <Link href="/dashboard/client/orders">
                      <button className="w-full px-4 py-3 text-sm bg-secondary-500/20 text-secondary-200 rounded-xl hover:bg-secondary-500/30 transition-all duration-300 border border-secondary-400/30 hover:border-secondary-400/50">
                        Мои заказы
                      </button>
                    </Link>
                    <Link href="/startups">
                      <button className="w-full px-4 py-3 text-sm bg-secondary-500/20 text-secondary-200 rounded-xl hover:bg-secondary-500/30 transition-all duration-300 border border-secondary-400/30 hover:border-secondary-400/50 flex items-center justify-center">
                        <Rocket className="h-4 w-4 mr-2" />
                        Стартапы
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Исполнитель */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-6 text-center flex items-center justify-center">
                    <Zap className="h-5 w-5 mr-2 text-primary-400" />
                    Исполнитель
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/dashboard/executor">
                      <button className="w-full px-4 py-3 text-sm bg-primary-500/20 text-primary-200 rounded-xl hover:bg-primary-500/30 transition-all duration-300 border border-primary-400/30 hover:border-primary-400/50">
                        Кабинет исполнителя
                      </button>
                    </Link>
                    <Link href="/dashboard/executor/calendar">
                      <button className="w-full px-4 py-3 text-sm bg-secondary-500/20 text-secondary-200 rounded-xl hover:bg-secondary-500/30 transition-all duration-300 border border-secondary-400/30 hover:border-secondary-400/50">
                        Календарь и расписание
                      </button>
                    </Link>
                    <Link href="/dashboard/executor/subscription">
                      <button className="w-full px-4 py-3 text-sm bg-secondary-500/20 text-secondary-200 rounded-xl hover:bg-secondary-500/30 transition-all duration-300 border border-secondary-400/30 hover:border-secondary-400/50">
                        Управление подпиской
                      </button>
                    </Link>
                    <Link href="/admin">
                      <button className="w-full px-4 py-3 text-sm bg-red-500/20 text-red-200 rounded-xl hover:bg-red-500/30 transition-all duration-300 border border-red-400/30 hover:border-red-400/50">
                        Админ панель
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 