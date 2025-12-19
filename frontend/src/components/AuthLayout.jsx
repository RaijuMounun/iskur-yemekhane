// frontend/src/components/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        
        {/* SOL TARAFI BURADA SABİT TUTUYORUZ */}
        <div className="auth-visual-side" style={{background: 'linear-gradient(135deg, var(--ozal-navy) 0%, #1a2342 100%)'}}>
            <img src="/logo.png" alt="Logo" className="visual-logo" />
            <div className="visual-content">
                <h1 className="visual-title">HOŞ GELDİNİZ</h1>
                <p className="visual-text">Malatya Turgut Özal Üniversitesi Dijital Dönüşüm Ofisi Etkinlik ve Anket Sistemi</p>
            </div>
        </div>

        {/* SAĞ TARAF (DEĞİŞKEN KISIM) */}
        <div className="auth-form-side">
            {/* LoginPage veya RegisterPage BURAYA Gelecek */}
            <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;