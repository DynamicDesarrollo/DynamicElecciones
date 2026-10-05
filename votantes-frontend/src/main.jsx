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
      {/* Avisos abajo a la derecha (abajo a lo ancho en celular): no tapan el título ni las acciones */}
      <Toaster position="bottom-right" theme="dark" duration={4000} gap={8} offset={24} mobileOffset={16} />
    </AuthProvider>
  </React.StrictMode>
);
