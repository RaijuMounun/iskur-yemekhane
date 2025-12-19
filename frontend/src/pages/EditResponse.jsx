// frontend/src/pages/EditResponse.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditResponse() {
  const { id } = useParams(); // Response ID
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { question_id: "cevap" } formatında

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // 1. Önce Verilen Cevapları Çek (Response)
      const respRes = await fetch(`http://localhost:8000/api/responses/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!respRes.ok) throw new Error("Cevap bulunamadı");
      const respData = await respRes.json();

      // Mevcut cevapları state'e işle
      const initialAnswers = {};
      respData.answers.forEach(a => {
        initialAnswers[a.question] = a.value;
      });
      setAnswers(initialAnswers);

      // 2. Şimdi Bağlı Olduğu Anketi Çek (Sorular için)
      const surveyRes = await fetch(`http://localhost:8000/api/surveys/${respData.survey}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const surveyData = await surveyRes.json();
      
      setSurveyTitle(surveyData.title);
      // Soruları sıraya diz
      setQuestions(surveyData.questions.sort((a, b) => a.order - b.order));
      
    } catch (err) {
      alert("Veri yüklenirken hata oluştu.");
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  // Input Değişikliği
  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Güncelleme İşlemi (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon: Boş cevap var mı?
    const missing = questions.find(q => !answers[q.id]);
    if (missing) {
        alert(`Lütfen "${missing.text}" sorusunu cevaplayınız.`);
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        
        // Backend'in beklediği formata çevir
        const payload = {
            answers: Object.entries(answers).map(([qId, val]) => ({
                question: parseInt(qId),
                value: val.toString()
            }))
        };

        const res = await fetch(`http://localhost:8000/api/responses/${id}/`, {
            method: 'PATCH', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Cevaplarınız güncellendi! ✅");
            navigate('/profile');
        } else {
            alert("Güncelleme başarısız oldu.");
        }
    } catch (err) { alert("Hata oluştu."); }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={{maxWidth:'800px', margin:'0 auto'}}>
        <div className="page-header">
            <h1>Cevabı Düzenle</h1>
            <p>"{surveyTitle}" anketi için verdiğiniz cevapları güncelleyebilirsiniz.</p>
        </div>

        <form onSubmit={handleSubmit} className="survey-form">
            {questions.map(q => (
                <div key={q.id} className="form-group">
                    <label>{q.text}</label>
                    
                    {/* --- TEXT --- */}
                    {q.question_type === 'text' && (
                        <textarea 
                            className="modern-input" rows="3"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                        />
                    )}

                    {/* --- CHOICE --- */}
                    {q.question_type === 'choice' && (
                        <select 
                            className="modern-input"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                        >
                            <option value="">Seçiniz...</option>
                            {q.options.split(',').map((opt, i) => (
                                <option key={i} value={opt.trim()}>{opt.trim()}</option>
                            ))}
                        </select>
                    )}

                    {/* --- STAR --- */}
                    {q.question_type === 'star' && (
                        <div className="star-rating-group">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    className={`star ${parseInt(answers[q.id]) >= star ? 'active' : ''}`}
                                    onClick={() => handleChange(q.id, star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <div style={{display:'flex', gap:'15px', marginTop:'20px'}}>
                <button type="button" onClick={() => navigate('/profile')} className="auth-btn" style={{background:'var(--text-muted)'}}>İptal</button>
                <button type="submit" className="auth-btn">Güncellemeyi Kaydet</button>
            </div>
        </form>
    </div>
  );
}

export default EditResponse;