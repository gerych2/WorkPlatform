// Скрипт для очистки данных бронирования из localStorage
// Запустите этот код в консоли браузера (F12 -> Console)

console.log('Очистка данных бронирования...')

// Очищаем все данные прямого бронирования
localStorage.removeItem('selectedDateTime')
localStorage.removeItem('selectedExecutor')
localStorage.removeItem('orderFormData')
localStorage.removeItem('selectedCategory')
localStorage.removeItem('serviceDescription')

console.log('✅ Данные бронирования очищены!')
console.log('Теперь перезагрузите страницу (F5)')

// Перезагружаем страницу
window.location.reload()


