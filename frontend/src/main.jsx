import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ IMPORT THIS
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    {/* ✅ WRAP YOUR APP HERE */}
    <GoogleOAuthProvider clientId="XXXXXXXXXXXXXXXXXXXXXXXXX">
      <App />
    </GoogleOAuthProvider>

  </React.StrictMode>
);
