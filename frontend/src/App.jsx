// frontend/src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  // Artık App.jsx'in TEK SORUMLULUĞU:
  // URL'ye bakmak ve doğru sayfayı (component) ekrana basmaktır.
  return (
    <div className="App">
      <nav>
        {/* LOGO KISMI (Buraya tıklayınca Ana Sayfaya gitsin) */}
        <Link to="/">
            <img src="/logo.png" alt="Turgut Özal Üniversitesi" className="nav-logo" />
        </Link>
        
        {/* LİNKLERİ SAĞA YASLADIK */}
        <div className="nav-links">
          <Link to="/">Ana Sayfa</Link>
          <Link to="/login">Giriş Yap</Link>
          <Link to="/register">Kayıt Ol</Link>
        </div>
      </nav>
      
      {/* İnce bir ayırıcı çizgi (Opaklığı azalttık) */}
      <hr style={{width: '100%', borderColor: 'var(--border-color)', marginBottom: '40px', opacity: 0.2}} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}

export default App;