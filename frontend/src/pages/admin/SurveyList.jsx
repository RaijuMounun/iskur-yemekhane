// frontend/src/pages/admin/SurveyList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verileri Çek
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/surveys/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!response.ok) throw new Error("Veri çekilemedi");
      const data = await response.json();
      setSurveys(data);
    } catch (err) {
      setError("Anketler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Anket Silme Fonksiyonu
  const handleDelete = async (id) => {
    if (!window.confirm("Bu anketi silmek istediğine emin misin?")) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/surveys/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        // Listeden silineni çıkar (Sayfa yenilenmeden)
        setSurveys(surveys.filter(survey => survey.id !== id));
      } else {
        alert("Silme işlemi başarısız.");
      }
    } catch (err) {
      alert("Sunucu hatası.");
    }
  };

  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>Yükleniyor...</div>;
  if (error) return <div style={{padding:'40px', textAlign:'center', color:'red'}}>{error}</div>;

  return (
    <div>
      {/* ÜST BAŞLIK VE EKLE BUTONU */}
      <div className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <h1>Anket Yönetimi</h1>
            <p>Sistemdeki tüm anketleri buradan yönetebilirsiniz.</p>
        </div>
        <Link to="/admin/surveys/new" className="auth-btn" style={{width:'auto', padding:'12px 25px', textDecoration:'none', fontSize:'0.9rem'}}>
            + Yeni Anket
        </Link>
      </div>
      
      {/* TABLO KARTI */}
      <div style={{background: 'var(--card-bg)', borderRadius: '16px', boxShadow: 'var(--card-shadow)', overflow: 'hidden', border: '1px solid var(--card-border)'}}>
          
          {surveys.length === 0 ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
                  Henüz hiç anket eklenmemiş.
              </div>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead>
                    <tr style={{background: 'var(--input-bg)', borderBottom: '1px solid var(--card-border)'}}>
                        <th style={{padding: '15px 20px', color: 'var(--heading-color)'}}>Başlık</th>
                        <th style={{padding: '15px 20px', color: 'var(--heading-color)'}}>Durum</th>
                        <th style={{padding: '15px 20px', color: 'var(--heading-color)'}}>Tarih</th>
                        <th style={{padding: '15px 20px', color: 'var(--heading-color)', textAlign:'right'}}>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {surveys.map(survey => (
                        <tr key={survey.id} style={{borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s'}}>
                            <td style={{padding: '15px 20px', fontWeight:'600', color:'var(--text-main)'}}>
                                {survey.title}
                                <div style={{fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:'normal'}}>{survey.description}</div>
                            </td>
                            <td style={{padding: '15px 20px'}}>
                                <span style={{
                                    padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                    background: survey.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: survey.is_active ? '#10B981' : '#EF4444'
                                }}>
                                    {survey.is_active ? 'Aktif' : 'Pasif'}
                                </span>
                            </td>
                            <td style={{padding: '15px 20px', color:'var(--text-muted)', fontSize:'0.9rem'}}>
                                {new Date(survey.created_at).toLocaleDateString('tr-TR')}
                            </td>
                            <td style={{padding: '15px 20px', textAlign:'right'}}>
                                {/* YENİ: DÜZENLE BUTONU */}
                                <Link to={`/admin/surveys/${survey.id}`} 
                                  style={{
                                    textDecoration:'none',
                                    background:'transparent', border:'1px solid var(--ozal-cyan)', color:'var(--ozal-cyan)', 
                                    padding:'6px 12px', borderRadius:'6px', fontSize:'0.8rem', fontWeight:'bold'
                                  }}>
                                    Detay & Düzenle
                                </Link>
                              
                                <button 
                                    onClick={() => handleDelete(survey.id)}
                                    style={{
                                        background:'transparent', border:'1px solid #EF4444', color:'#EF4444', 
                                        padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem', fontWeight:'bold'
                                    }}
                                >
                                    Sil
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

export default SurveyList;