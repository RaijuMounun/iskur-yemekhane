// frontend/src/pages/admin/NewSurvey.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewSurvey() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Anket Bilgileri
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: ''
  });

  // Sorular Listesi (Başlangıçta 1 boş soru olsun)
  const [questions, setQuestions] = useState([
    { text: '', question_type: 'text', options: '', order: 1 }
  ]);

  // --- HANDLERS ---

  const handleSurveyChange = (e) => {
    setSurveyData({ ...surveyData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', question_type: 'text', options: '', order: questions.length + 1 }
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // --- KAYIT İŞLEMİ (ZİNCİRLEME API ÇAĞRISI) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Anketi yayınlamak istiyor musunuz?")) return;
    
    setLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      // 1. ADIM: Anketi Oluştur
      const surveyRes = await fetch('http://localhost:8000/api/surveys/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify(surveyData)
      });

      if (!surveyRes.ok) throw new Error("Anket oluşturulamadı.");
      const createdSurvey = await surveyRes.json();
      const surveyId = createdSurvey.id;

      // 2. ADIM: Soruları Tek Tek Oluştur ve Ankete Bağla
      // Promise.all ile hepsini paralel gönderiyoruz, daha hızlı olur.
      const questionPromises = questions.map((q, index) => {
        return fetch('http://localhost:8000/api/questions/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                survey: surveyId, // <--- İşte burası önemli, ankete bağlıyoruz
                text: q.text,
                question_type: q.question_type,
                options: q.question_type === 'choice' ? q.options : null, // Sadece seçmeliyse options gitsin
                order: index + 1
            })
        });
      });

      await Promise.all(questionPromises);

      alert("Anket başarıyla oluşturuldu! 🎉");
      navigate('/admin/surveys'); // Listeye geri dön

    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      
      <div className="dashboard-header">
        <h1>Yeni Anket Oluştur</h1>
        <p>Anket başlığını girin ve soruları ekleyin.</p>
      </div>

      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'30px'}}>
        
        {/* --- 1. ANKET KARTI --- */}
        <div style={{background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)'}}>
            <h3 style={{color:'var(--heading-color)', marginTop:0}}>Anket Detayları</h3>
            
            <div className="modern-input-group">
                <label>Anket Başlığı</label>
                <input 
                    type="text" name="title" className="modern-input" required 
                    placeholder="Örn: 2024 Bahar Şenliği Memnuniyet Anketi"
                    value={surveyData.title} onChange={handleSurveyChange}
                />
            </div>

            <div className="modern-input-group">
                <label>Açıklama (Opsiyonel)</label>
                <textarea 
                    name="description" className="modern-input" rows="3"
                    placeholder="Örn: Bu anket etkinlik kalitesini ölçmek için..."
                    value={surveyData.description} onChange={handleSurveyChange}
                />
            </div>
        </div>

        {/* --- 2. SORULAR KARTI --- */}
        <div style={{background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h3 style={{color:'var(--heading-color)', margin:0}}>Sorular ({questions.length})</h3>
                <button type="button" onClick={addQuestion} className="auth-btn" style={{width:'auto', padding:'10px 20px', fontSize:'0.9rem', background:'var(--ozal-cyan)'}}>
                    + Soru Ekle
                </button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                {questions.map((q, index) => (
                    <div key={index} style={{background:'var(--bg-body)', padding:'20px', borderRadius:'12px', border:'1px solid var(--card-border)', position:'relative'}}>
                        
                        {/* Soru Silme Butonu (X) */}
                        {questions.length > 1 && (
                            <button type="button" onClick={() => removeQuestion(index)} style={{position:'absolute', top:'10px', right:'10px', background:'transparent', border:'none', color:'red', cursor:'pointer', fontSize:'1.2rem'}}>
                                ✖
                            </button>
                        )}

                        <div style={{display:'flex', gap:'15px', marginBottom:'15px'}}>
                            <div style={{flex:1}}>
                                <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'var(--text-muted)'}}>Soru Metni</label>
                                <input 
                                    type="text" className="modern-input" required
                                    value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                    placeholder="Soru nedir?"
                                />
                            </div>
                            <div style={{width:'200px'}}>
                                <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'var(--text-muted)'}}>Cevap Tipi</label>
                                <select 
                                    className="modern-input" 
                                    value={q.question_type} onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                                >
                                    <option value="text">Metin Cevap</option>
                                    <option value="star">Yıldız Puanlama (1-5)</option>
                                    <option value="choice">Çoktan Seçmeli</option>
                                </select>
                            </div>
                        </div>

                        {/* Seçenekler (Sadece 'choice' seçilirse görünür) */}
                        {q.question_type === 'choice' && (
                            <div style={{background:'rgba(239, 127, 26, 0.1)', padding:'15px', borderRadius:'8px'}}>
                                <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'var(--ozal-orange)', fontWeight:'bold'}}>Seçenekler</label>
                                <input 
                                    type="text" className="modern-input"
                                    placeholder="Evet, Hayır, Belki (Virgülle ayırın)"
                                    value={q.options} onChange={(e) => handleQuestionChange(index, 'options', e.target.value)}
                                />
                                <small style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>Seçenekleri virgül (,) ile ayırarak yazınız.</small>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* KAYDET BUTONU */}
        <div style={{textAlign:'right'}}>
            <button type="submit" className="auth-btn" style={{padding:'20px 40px', fontSize:'1.2rem'}} disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'ANKETİ YAYINLA ✅'}
            </button>
        </div>

      </form>
    </div>
  );
}

export default NewSurvey;