import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LocalAISettings from './LocalAISettings.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /><LocalAISettings /></React.StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.error('Service worker registration failed:', error));
  });
}
