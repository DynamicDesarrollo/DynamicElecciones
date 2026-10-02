import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ConfirmarProvider } from './ui/Confirmar';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ConfirmarProvider>
        <App />
      </ConfirmarProvider>
      <Toaster position="top-center" richColors closeButton duration={3500} />
    </AuthProvider>
  </React.StrictMode>
);
