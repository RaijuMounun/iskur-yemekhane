// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom'; // <--- 1. YENİ IMPORT: Portal için gerekli

function RegisterPage() {
  // State yapısını değiştirdik: 'email' yerine 'studentNumber' var.
  const [formData, setFormData] = useState({ 
    username: '', 
    studentNumber: '', 
    password: '' 
  });
  
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const navigate = useNavigate();

  // Genel Input Değişimi (Kullanıcı Adı ve Şifre için)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ÖZEL NUMARA INPUT KONTROLÜ ---
  const handleNumberChange = (e) => {
    const val = e.target.value;
    
    // 1. Regex ile sadece sayıları al (Harfleri siler)
    const onlyNums = val.replace(/[^0-9]/g, '');
    
    // 2. 11 Karakter sınırını zorla
    if (onlyNums.length <= 11) {
        setFormData({ ...formData, studentNumber: onlyNums });
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
    setShowModal(true);
  };

  const handleCopyAndUse = () => {
    navigator.clipboard.writeText(generatedPassword)
      .then(() => {
        setFormData({ ...formData, password: generatedPassword });
        setShowModal(false);
      })
      .catch(() => alert('Otomatik kopyalama başarısız.'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // --- Backend'e Gönderilecek Veriyi Hazırla ---
    // Burada numarayı ve uzantıyı birleştirip 'email' alanına koyuyoruz.
    const payload = {
        username: formData.username,
        email: `${formData.studentNumber}@ozal.edu.tr`, // BİRLEŞTİRME İŞLEMİ
        password: formData.password
    };

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // payload gönderiyoruz, formData değil
      });
      
      if (response.ok) {
        alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
        navigate('/login');
      } else {
        const data = await response.json();
        // Hata mesajlarını özelleştir
        if (data.username) setMessage("Bu kullanıcı adı zaten alınmış.");
        else if (data.email) setMessage("Bu öğrenci numarası ile zaten kayıt olunmuş.");
        else setMessage("Kayıt başarısız. Bilgileri kontrol edin.");
      }
    } catch (err) {
      setMessage("Sunucu hatası.");
    }
  };

  return (
    <motion.div
      key="register-form"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="auth-header">
        <h2 style={{color: 'var(--ozal-orange)'}}>Hesap Oluştur</h2>
        <p>Bilgilerinizi girin.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modern-input-group">
            <label>Kullanıcı Adı</label>
            <input 
              type="text" 
              name="username" 
              className="modern-input" 
              value={formData.username} 
              onChange={handleChange} 
              required 
              placeholder="Kullanıcı adınız..."
            />
        </div>

        {/* --- YENİLENMİŞ OKUL NUMARASI ALANI --- */}
        <div className="modern-input-group">
            <label>Okul Numarası</label>
            <div className="email-input-wrapper">
                <input 
                  type="text" 
                  name="studentNumber" 
                  className="modern-input" 
                  value={formData.studentNumber} 
                  onChange={handleNumberChange} // Özel handler
                  required 
                  placeholder="02..." 
                  inputMode="numeric" // Mobilde sayı klavyesi açar
                />
                {/* Sabit Uzantı */}
                <div className="email-suffix">@ozal.edu.tr</div>
            </div>
            {/* Karakter Sayacı (Opsiyonel ama şık durur) */}
            <div style={{textAlign:'right', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px'}}>
                {formData.studentNumber.length} / 11
            </div>
        </div>

        <div className="modern-input-group">
            <label>Şifre</label>
            <div className="password-input-wrapper">
                <input 
                  type="password" 
                  name="password" 
                  className="modern-input" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Güçlü bir şifre"
                />
                <button 
                  type="button" 
                  onClick={generatePassword} 
                  className="generator-btn"
                  title="Güçlü Şifre Oluştur"
                >
                   <svg viewBox="0 0 24 24">
                     <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                   </svg>
                </button>
            </div>
        </div>

        <button type="submit" className="auth-btn" style={{background: 'var(--ozal-orange)'}}>
          KAYIT OL ➔
        </button>
        
        {message && <p className="error-msg" style={{marginTop:'15px', color:'red', textAlign:'center', fontWeight:'bold'}}>{message}</p>}
      </form>

      <div className="auth-link">
        Zaten hesabınız var mı? <Link to="/login" style={{color:'var(--ozal-orange)'}}>Giriş Yapın</Link>
      </div>

      {/* --- 2. DEĞİŞİKLİK: createPortal KULLANIMI --- */}
      {/* Bu sayede Modal, kartın içine hapsolmaz, sayfanın en tepesine (body'ye) ışınlanır */}
      {showModal && createPortal(
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 style={{color: 'var(--ozal-navy)', margin:'0 0 10px 0'}}>Güvenli Şifre Önerisi</h3>
                <p style={{color: 'var(--text-muted)', fontSize:'0.9rem'}}>
                    Aşağıdaki şifreyi kullanabilirsin.
                </p>
                <div className="generated-pass-display">{generatedPassword}</div>
                <div className="modal-actions">
                    <button onClick={handleCopyAndUse} className="modal-btn btn-copy">Kopyala ve Kullan</button>
                    <button onClick={() => setShowModal(false)} className="modal-btn btn-cancel">Vazgeç</button>
                </div>
            </div>
        </div>,
        document.body // Modalı document.body'nin içine render et
      )}
    </motion.div>
  );
}

export default RegisterPage;