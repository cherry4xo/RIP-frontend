import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Регистрация Service Worker для PWA (только для веб-версии, не для Tauri)
if ('serviceWorker' in navigator && !window.__TAURI__) {
  registerSW()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
