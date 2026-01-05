import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Erro Crítico: Elemento #root não encontrado no HTML.</div>';
  throw new Error("Elemento raiz 'root' não encontrado no HTML.");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);