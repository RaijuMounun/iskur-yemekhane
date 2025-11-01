// 1. Gerekli kancaları (hooks) import ediyoruz
// useState: Form verilerini ve hata/yüklenme durumlarını tutmak için
// useNavigate: Başarılı kayıttan sonra kullanıcıyı yönlendirmek için
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  
  // 2. "Controlled Component" (Kontrollü Bileşen) Best Practice'i
  // Formdaki *tüm* veriler, React state'i tarafından kontrol edilir.
  // Bu, React'i "Tek Gerçek Kaynağı" (Single Source of Truth) yapar.
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: ''
  });

  // 3. Kullanıcı deneyimi (UX) için yüklenme ve hata state'leri
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4. Yönlendirme fonksiyonunu hazırlıyoruz
  const navigate = useNavigate();

  // 5. Formdaki herhangi bir input değiştikçe state'i güncelleyen fonksiyon
  const handleChange = (e) => {
    // e.target'dan 'name' (örn: "email") ve 'value' (örn: "test@") alır
    const { name, value } = e.target;
    
    // Önceki state'i (...prevState) kopyala,
    // sadece değişen alanı ([name]) yeni değeriyle (value) güncelle.
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // 6. Form "Submit" (Gönder) butonuna basıldığında çalışacak ana fonksiyon
  const handleSubmit = async (e) => {
    // Tarayıcının varsayılan olarak sayfayı yenilemesini engelle
    e.preventDefault(); 

    // --- İstemci Tarafı Doğrulama (Client-Side Validation) ---
    // Sunucuyu (Django) boşuna yormamak için bir "Best Practice"tir.
    // Kuralımızı (Django'da da vardı) burada da kontrol edelim.
    if (!formData.email.endsWith('@ozal.edu.tr')) {
        setError("Hata: Sadece okul e-posta adresleri (@ozal.edu.tr) ile kayıt olunabilir.");
        return; // Fonksiyonu burada durdur, API'ye istek atma.
    }

    setLoading(true); // Yükleme başladı
    setError(null);   // Eski hataları temizle

    try {
      // 7. Backend'imize (Django) POST isteği atıyoruz
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          // Backend'e "Sana JSON formatında veri yolluyorum" diyoruz
          'Content-Type': 'application/json',
        },
        // React state'imizi (formData) bir JSON string'ine çevirip yolluyoruz
        body: JSON.stringify(formData), 
      });

      // 8. Backend'den gelen cevabı işliyoruz
      if (response.ok) {
        // BAŞARILI (HTTP 201 Created)
        alert('Kayıt başarılı! Şimdi giriş sayfasına yönlendiriliyorsunuz.');
        navigate('/login'); // Kullanıcıyı "Giriş Yap" sayfasına yönlendir
      } else {
        // BAŞARISIZ (HTTP 400 Bad Request vb.)
        // Django'dan gelen hata mesajını (örn: "email already exists") yakala
        const errorData = await response.json();
        
        // Hata mesajını state'e yaz ve kullanıcıya göster
        // Gelen hata bir obje olabilir (örn: {"email": ["bu e-posta zaten var"]})
        // Şimdilik bunu basitçe JSON'a çevirip basalım.
        setError(JSON.stringify(errorData));
      }
    } catch (err) {
      // Ağ hatası (örn: Backend çalışmıyor)
      setError("Kayıt sırasında bir ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      // Her halükarda (başarı veya hata) yüklemeyi durdur
      setLoading(false);
    }
  };

  // 9. Ekrana çizilecek JSX (HTML'e benzer)
  return (
    <div>
      <h1>Kayıt Ol</h1>
      
      {/* Formu 'handleSubmit' fonksiyonumuza bağlıyoruz */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Okul E-postası:</label>
          <input
            type="email"
            name="email"
            value={formData.email}    // State'den oku
            onChange={handleChange}   // Değişince state'i güncelle
            required
          />
        </div>
        <div>
          <label>Kullanıcı Adı:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Ad Soyad:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
          />
        </div>
        
        {/* Kullanıcıya hata mesajlarını gösterdiğimiz yer */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {/* Yüklenme durumuna göre butonu devre dışı bırak (iyi UX) */}
        <button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;