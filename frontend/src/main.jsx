import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

import './index.css';              // 1. Reset
import './styles/variables.css';   // 2. Renkler
import './styles/main.css';        // 3. İskelet
import './styles/components.css';  // 4. Elementler
import './styles/auth.css';        // 5. Giriş/Kayıt Özelleri
import './styles/admin.css';       // 6. Admin Panel

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);