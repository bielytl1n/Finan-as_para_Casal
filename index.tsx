import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { API_KEY } from './api.ts';

// Polyfill para garantir que process.env.API_KEY esteja disponível para o SDK do Google GenAI
// Isso permite que o código dos componentes siga o padrão seguro process.env.API_KEY
if (typeof process === 'undefined') {
  (window as any).process = { env: { API_KEY } };
} else {
  // Garante que env exista caso process esteja definido mas vazio
  if (!process.env) {
     (process as any).env = {};
  }
  // Se não houver chave definida no ambiente, usa a do arquivo api.ts
  if (!process.env.API_KEY) {
    process.env.API_KEY = API_KEY;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Erro Crítico: Elemento #root não encontrado no HTML.</div>';
  throw new Error("Elemento raiz 'root' não encontrado no HTML.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);