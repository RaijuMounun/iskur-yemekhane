// frontend/src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components.css'; 
import SurveyForm from '../components/SurveyForm';

function HomePage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        setIsAuthenticated(false);
        setLoading(false); // Yüklemeyi bitir ki kart görünsün
        return;
    }

    setIsAuthenticated(true);

    const fetchSurveys = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/surveys/', {
            headers: { 'Authorization': `Token ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSurveys(data);
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  // GİRİŞ YAPILMAMIŞSA BU KART GÖRÜNMELİ
  if (!isAuthenticated) {
    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '50px'}}>
            <div className="menu-card" style={{textAlign: 'center', maxWidth: '600px', padding: '60px 40px'}}>
                <div style={{fontSize: '4rem', marginBottom: '20px'}}>🔒</div>
                <h2 style={{color: 'var(--heading-color)', marginBottom: '15px'}}>Oturum Açmanız Gerekiyor</h2>
                <p style={{color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.1rem'}}>
                    Etkinlik ve anketleri görüntülemek, oylamalara katılmak için lütfen giriş yapınız.
                </p>
                
                <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <Link to="/login" className="auth-btn" style={{textDecoration:'none', width: 'auto', padding: '15px 40px'}}>
                        Giriş Yap
                    </Link>
                    <Link to="/register" className="auth-btn" style={{textDecoration:'none', width: 'auto', padding: '15px 40px', background: 'transparent', color: 'var(--ozal-orange)', border: '2px solid var(--ozal-orange)'}}>
                        Kayıt Ol
                    </Link>
                </div>
            </div>
        </div>
    );
  }

  // GİRİŞ YAPILMIŞSA ANKETLER
  return (
    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div className="menu-list">
        {surveys.length === 0 ? (
            <div className="menu-card" style={{textAlign: 'center', padding: '60px'}}>
                <h3 style={{color: 'var(--text-muted)'}}>📭 Şu an aktif bir anket bulunmuyor.</h3>
                <p style={{color:'var(--text-muted)'}}>Daha sonra tekrar kontrol ediniz.</p>
            </div>
        ) : (
            surveys.map(survey => (
            <div key={survey.id} className="menu-card">
                <div className="menu-header">
                    <h2>{survey.title}</h2>
                    <p>{survey.description}</p>
                </div>
                <SurveyForm preloadedSurvey={survey} />
            </div>
            ))
        )}
      </div>
    </div>
  );
}

export default HomePage;