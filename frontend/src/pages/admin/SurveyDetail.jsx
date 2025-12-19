// frontend/src/pages/admin/SurveyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SurveyDetail() {
  const { id } = useParams(); // URL'den ID'yi al
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' veya 'responses'
  const [stats, setStats] = useState(null); // Analiz verileri için

  // Verileri Çek
  useEffect(() => {
    fetchSurveyDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'responses') {
        fetchStats();
    }
}, [activeTab]);

  const fetchSurveyDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // Anketi ve içindeki soruları çeker
      const res = await fetch(`http://localhost:8000/api/surveys/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurvey(data);
        // Soruları sıraya göre dizelim (order)
        setQuestions(data.questions.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Analiz Verilerini Çek
const fetchStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:8000/api/surveys/${id}/results/`, {
        headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) {
        const data = await res.json();
        setStats(data);
    }
  } catch (err) { console.error(err); }
};

  // --- SORU GÜNCELLEME İŞLEMLERİ ---

  // 1. Soru Metnini Değiştirme (Anlık State Güncellemesi)
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // 2. Soruyu Kaydet (Backend'e PUT isteği)
  const saveQuestion = async (question) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8000/api/questions/${question.id}/`, {
        method: 'PATCH', // Sadece değişen alanları güncelle
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
            text: question.text,
            question_type: question.question_type,
            options: question.options
        })
      });
      if(res.ok) alert("Soru güncellendi!");
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  // 3. Soruyu Sil
  const deleteQuestion = async (qId) => {
    if(!window.confirm("Soruyu silmek istediğine emin misin?")) return;
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`http://localhost:8000/api/questions/${qId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        // Listeden çıkar
        setQuestions(questions.filter(q => q.id !== qId));
    } catch(err) { alert("Silinemedi."); }
  };

  // 4. Yeni Soru Ekle
  const addNewQuestion = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8000/api/questions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
            body: JSON.stringify({
                survey: id, // Mevcut ankete bağlıyoruz
                text: "Yeni Soru",
                question_type: "text",
                order: questions.length + 1
            })
        });
        if(res.ok) {
            const newQ = await res.json();
            setQuestions([...questions, newQ]);
        }
    } catch(err) { alert("Eklenemedi."); }
  };

  // 5. Anket Başlığını Güncelle
  const updateSurveyInfo = async () => {
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`http://localhost:8000/api/surveys/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
            body: JSON.stringify({ title: survey.title, description: survey.description, is_active: survey.is_active })
        });
        alert("Anket bilgileri güncellendi.");
    } catch(err) { alert("Hata."); }
  };


  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>Yükleniyor...</div>;
  if (!survey) return <div>Anket bulunamadı.</div>;

  return (
    <div>
      {/* BAŞLIK ALANI */}
      <div className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <input 
                type="text" 
                value={survey.title} 
                onChange={(e) => setSurvey({...survey, title: e.target.value})}
                style={{fontSize:'2rem', fontWeight:'800', border:'none', background:'transparent', color:'var(--text-main)', width:'100%'}}
            />
            <input 
                 type="text" 
                 value={survey.description} 
                 onChange={(e) => setSurvey({...survey, description: e.target.value})}
                 style={{fontSize:'1rem', border:'none', background:'transparent', color:'var(--text-muted)', width:'100%'}}
            />
        </div>
        <div style={{display:'flex', gap:'10px'}}>
             <button onClick={updateSurveyInfo} className="auth-btn" style={{width:'auto', padding:'10px 20px', fontSize:'0.9rem', background:'var(--ozal-navy)'}}>
                Bilgileri Kaydet
             </button>
        </div>
      </div>

      {/* SEKMELER (TABS) */}
      <div style={{display:'flex', gap:'20px', borderBottom:'1px solid var(--card-border)', marginBottom:'30px'}}>
        <button 
            onClick={() => setActiveTab('questions')}
            style={{
                padding:'10px 20px', background:'transparent', border:'none', cursor:'pointer', fontSize:'1rem', fontWeight:'bold',
                color: activeTab === 'questions' ? 'var(--ozal-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'questions' ? '3px solid var(--ozal-cyan)' : 'none'
            }}>
            Sorular ({questions.length})
        </button>
        <button 
            onClick={() => setActiveTab('responses')}
            style={{
                padding:'10px 20px', background:'transparent', border:'none', cursor:'pointer', fontSize:'1rem', fontWeight:'bold',
                color: activeTab === 'responses' ? 'var(--ozal-cyan)' : 'var(--text-muted)',
                borderBottom: activeTab === 'responses' ? '3px solid var(--ozal-cyan)' : 'none'
            }}>
            Cevaplar & Analiz
        </button>
      </div>

      {/* --- SORULAR SEKMESİ --- */}
      {activeTab === 'questions' && (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            
            <button onClick={addNewQuestion} className="auth-btn" style={{width:'auto', alignSelf:'flex-end', padding:'10px 20px', fontSize:'0.9rem'}}>+ Yeni Soru Ekle</button>

            {questions.map((q, index) => (
                <div key={q.id} style={{background:'var(--card-bg)', padding:'25px', borderRadius:'12px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', display:'flex', gap:'20px', alignItems:'start'}}>
                    
                    <div style={{flex:1}}>
                        <div style={{display:'flex', gap:'15px', marginBottom:'15px'}}>
                            <div style={{flex:1}}>
                                <label style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Soru Metni</label>
                                <input 
                                    type="text" className="modern-input" 
                                    value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                />
                            </div>
                            <div style={{width:'180px'}}>
                                <label style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Tip</label>
                                <select 
                                    className="modern-input"
                                    value={q.question_type} onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                                >
                                    <option value="text">Metin</option>
                                    <option value="star">Yıldız (1-5)</option>
                                    <option value="choice">Çoktan Seçmeli</option>
                                </select>
                            </div>
                        </div>

                        {/* Seçenekler */}
                        {q.question_type === 'choice' && (
                            <div>
                                <label style={{fontSize:'0.8rem', color:'var(--ozal-orange)'}}>Seçenekler (Virgülle ayır)</label>
                                <input 
                                    type="text" className="modern-input" 
                                    value={q.options || ''} onChange={(e) => handleQuestionChange(index, 'options', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        <button onClick={() => saveQuestion(q)} style={{background:'var(--ozal-cyan)', color:'white', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}>💾</button>
                        <button onClick={() => deleteQuestion(q.id)} style={{background:'#EF4444', color:'white', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}>🗑️</button>
                    </div>

                </div>
            ))}
        </div>
      )}

      {/* --- CEVAPLAR & ANALİZ SEKMESİ --- */}
      {activeTab === 'responses' && (
        <div style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            
            {!stats ? (
                <div style={{textAlign:'center', padding:'20px'}}>Veriler yükleniyor...</div>
            ) : stats.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px'}}>Henüz soru eklenmemiş.</div>
            ) : (
                stats.map((stat) => (
                    <div key={stat.id} style={{background:'var(--card-bg)', padding:'30px', borderRadius:'16px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)'}}>
                        
                        {/* SORU BAŞLIĞI */}
                        <div style={{marginBottom:'20px', borderBottom:'1px solid var(--nav-border)', paddingBottom:'15px'}}>
                            <h4 style={{margin:0, color:'var(--heading-color)', fontSize:'1.1rem'}}>{stat.text}</h4>
                            <span style={{fontSize:'0.85rem', color:'var(--text-muted)', background:'var(--input-bg)', padding:'4px 10px', borderRadius:'6px', marginTop:'5px', display:'inline-block'}}>
                                Toplam Cevap: <strong>{stat.total}</strong>
                            </span>
                        </div>

                        {/* --- TİPE GÖRE GÖSTERİM --- */}
                        
                        {/* 1. YILDIZ PUANLAMA */}
                        {stat.type === 'star' && (
                            <div style={{display:'flex', alignItems:'center', gap:'40px'}}>
                                <div style={{textAlign:'center', background:'var(--ozal-orange)', color:'white', padding:'20px', borderRadius:'12px', minWidth:'120px'}}>
                                    <div style={{fontSize:'2.5rem', fontWeight:'bold'}}>{stat.results.average}</div>
                                    <div style={{fontSize:'0.9rem'}}>Ortalama</div>
                                </div>
                                <div style={{flex:1}}>
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = stat.results.distribution[star] || 0;
                                        const percent = stat.total > 0 ? (count / stat.total) * 100 : 0;
                                        return (
                                            <div key={star} style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                                                <span style={{width:'20px', fontWeight:'bold', color:'var(--text-muted)'}}>{star}★</span>
                                                <div style={{flex:1, height:'10px', background:'var(--input-bg)', borderRadius:'5px', overflow:'hidden'}}>
                                                    <div style={{width:`${percent}%`, height:'100%', background:'var(--ozal-orange)', transition:'width 0.5s'}}></div>
                                                </div>
                                                <span style={{width:'30px', textAlign:'right', fontSize:'0.8rem', color:'var(--text-muted)'}}>{count}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. ÇOKTAN SEÇMELİ */}
                        {stat.type === 'choice' && (
                            <div>
                                {Object.entries(stat.results).map(([option, count]) => {
                                    const percent = stat.total > 0 ? (count / stat.total) * 100 : 0;
                                    return (
                                        <div key={option} style={{marginBottom:'15px'}}>
                                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'0.95rem', color:'var(--text-main)'}}>
                                                <span>{option}</span>
                                                <span style={{fontWeight:'bold'}}>{count} kişi (%{Math.round(percent)})</span>
                                            </div>
                                            <div style={{width:'100%', height:'12px', background:'var(--input-bg)', borderRadius:'6px', overflow:'hidden'}}>
                                                <div style={{width:`${percent}%`, height:'100%', background:'var(--ozal-cyan)', transition:'width 0.5s'}}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* 3. METİN CEVAPLAR */}
                        {stat.type === 'text' && (
                            <div style={{maxHeight:'300px', overflowY:'auto', paddingRight:'10px'}}>
                                {stat.results.length === 0 ? (
                                    <p style={{color:'var(--text-muted)'}}>Henüz cevap yok.</p>
                                ) : (
                                    stat.results.map((txt, i) => (
                                        <div key={i} style={{background:'var(--bg-body)', padding:'15px', borderRadius:'8px', marginBottom:'10px', borderLeft:'4px solid var(--ozal-navy)', color:'var(--text-main)'}}>
                                            "{txt}"
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                    </div>
                ))
            )}
        </div>
      )}

    </div>
  );
}

export default SurveyDetail;