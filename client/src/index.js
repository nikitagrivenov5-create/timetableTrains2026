import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Стили для всего приложения
import App from './App'; // Главный компонент

// Создаём корень приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);