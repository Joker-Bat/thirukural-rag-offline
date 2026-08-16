import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { ServiceProvider } from './context/service-context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ServiceProvider>
      <App />
    </ServiceProvider>
  </React.StrictMode>
);
