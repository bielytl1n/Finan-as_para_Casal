
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { FinancialProvider } from './contexts/FinancialContext.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Erro Crítico: Elemento #root não encontrado no HTML.</div>';
  throw new Error("Elemento raiz 'root' não encontrado no HTML.");
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered with scope:', registration.scope);
      })
      .catch((registrationError) => {
        console.warn('SW registration failed:', registrationError);
      });
  });
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <FinancialProvider>
      <App />
    </FinancialProvider>
  </React.StrictMode>
);
