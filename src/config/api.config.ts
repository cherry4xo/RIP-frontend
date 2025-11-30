// src/config/api.config.ts

// Для Tauri приложения используйте IP адрес компьютера в локальной сети
// Например: 'http://192.168.1.100:8080'
// Для веб-версии используйте прокси через '/api' или прямой адрес сервера

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Для локальной разработки с Tauri:
// 1. Узнайте IP адрес вашего компьютера: ipconfig (Windows) или ifconfig (Mac/Linux)
// 2. Замените API_BASE_URL на: 'http://YOUR_LOCAL_IP:8080/api'
// Например: export const API_BASE_URL = 'http://192.168.1.100:8080/api';

// Для продакшена можно использовать переменную окружения:
// VITE_API_BASE_URL=http://your-api-server.com/api npm run build
