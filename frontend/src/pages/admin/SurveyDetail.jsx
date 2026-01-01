// frontend/src/pages/admin/SurveyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Kayıt işlemi sürerken butonu kitlemek için
  const [activeTab, setActiveTab] = useState('questions');
  const [stats, setStats] = useState(null);

  // Verileri Çek
  useEffect(() => {
    fetchSurveyDetails();
  }, [id]);

  const fetchSurveyDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8000/api/surveys/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();

        setSurvey(data);
        setQuestions(data.questions.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
      if (activeTab === 'responses') {
          fetchStats();
      }
  }, [activeTab]);

  // --- HANDLERS ---

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // --- HEPSİNİ KAYDET FONKSİYONU ---
  const handleSaveAll = async () => {
    if(!window.confirm("Tüm değişiklikleri kaydetmek istiyor musunuz?")) return;
    setSaving(true);
    const token = localStorage.getItem('authToken');

    try {
        // 1. ADIM: Anket Başlığı ve Açıklamasını Kaydet
        await fetch(`http://localhost:8000/api/surveys/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
            body: JSON.stringify({ 
                title: survey.title, 
                description: survey.description, 
                is_active: survey.is_active 
            })
        });

        // 2. ADIM: Tüm Soruları Paralel Olarak Kaydet
        const questionPromises = questions.map(q => {
            return fetch(`http://localhost:8000/api/questions/${q.id}/`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    text: q.text,
                    question_type: q.question_type,
                    options: q.options,
                    page_number: q.page_number,
                    required: q.required
                })
            });
        });

        await Promise.all(questionPromises);

        alert("Tüm değişiklikler başarıyla kaydedildi! ✅");

    } catch(err) { 
        console.error(err);
        alert("Kaydederken bir hata oluştu."); 
    } finally {
        setSaving(false);
    }
  };

  const deleteQuestion = async (qId) => {
    if(!window.confirm("Soruyu silmek istediğine emin misin?")) return;
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`http://localhost:8000/api/questions/${qId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        setQuestions(questions.filter(q => q.id !== qId));
    } catch(err) { alert("Silinemedi."); }
  };

  const addNewQuestion = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8000/api/questions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
            body: JSON.stringify({
                survey: id,
                text: "Yeni Soru",
                question_type: "text",
                order: questions.length + 1,
                page_number: 1
            })
        });
        if(res.ok) {
            const newQ = await res.json();
            setQuestions([...questions, newQ]);
        }
    } catch(err) { alert("Eklenemedi."); }
  };


  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>Yükleniyor...</div>;
  if (!survey) return <div>Anket bulunamadı.</div>;

  return (
    <div>
      {/* BAŞLIK ALANI & SAVE BUTTON */}
      <div className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{flex:1}}>
            <input 
                type="text" 
                value={survey.title} 
                onChange={(e) => setSurvey({...survey, title: e.target.value})}
                style={{fontSize:'2rem', fontWeight:'800', border:'none', background:'transparent', color:'var(--text-main)', width:'100%', marginBottom:'10px'}}
            />
            <textarea 
                 value={survey.description} 
                 onChange={(e) => setSurvey({...survey, description: e.target.value})}
                 style={{fontSize:'1rem', border:'none', background:'transparent', color:'var(--text-muted)', width:'100%', resize:'none', fontFamily:'inherit'}}
                 rows={2}
            />
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
             {/* TEK VE BÜYÜK KAYDET BUTONU */}
             <button 
                onClick={handleSaveAll} 
                className="auth-btn" 
                disabled={saving}
                style={{width:'auto', padding:'15px 30px', fontSize:'1rem', background:'var(--ozal-cyan)', whiteSpace:'nowrap'}}
             >
                {saving ? 'Kaydediliyor...' : 'TÜMÜNÜ KAYDET 💾'}
             </button>
        </div>
      </div>

      {/* SEKMELER */}
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
                        {/* 1. SATIR: SORU METNİ */}
                        <div style={{marginBottom:'15px'}}>
                            <label style={{fontSize:'0.8rem', color:'var(--text-muted)', display:'block', marginBottom:'5px'}}>Soru Metni</label>
                            <input 
                                type="text" className="modern-input" 
                                value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                            />
                        </div>

                        {/* 2. SATIR: TİP ve SAYFA NO */}
                        <div style={{display:'flex', gap:'15px'}}>
                            <div style={{flex:1}}>
                                <label style={{fontSize:'0.8rem', color:'var(--text-muted)', display:'block', marginBottom:'5px'}}>Tip</label>
                                <select 
                                    className="modern-input"
                                    value={q.question_type} onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                                >
                                    <option value="text">Kısa Metin</option>
                                    <option value="star">Yıldız (Letterboxd)</option>
                                    <option value="scale">1-10 Puan (Ölçek)</option>
                                    <option value="choice">Tek Seçim (Radio)</option>
                                    <option value="multiple">Çoklu Seçim (Checkbox)</option>
                                    <option value="date">Tarih</option>
                                </select>
                            </div>

                            <div style={{width:'80px'}}>
                                <label style={{fontSize:'0.8rem', color:'var(--text-muted)', display:'block', marginBottom:'5px'}}>Sayfa</label>
                                <input 
                                    type="number" min="1" className="modern-input"
                                    value={q.page_number || 1} 
                                    onChange={(e) => handleQuestionChange(index, 'page_number', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* YENİ: ZORUNLU CHECKBOX */}
                        <div style={{width:'80px', textAlign:'center'}}>
                            <label style={{display:'block', marginBottom:'5px', fontSize:'0.8rem', color:'var(--text-muted)', cursor:'pointer'}}>Zorunlu</label>
                            <input 
                                type="checkbox" 
                                checked={q.required}
                                onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                                style={{width:'20px', height:'20px', accentColor:'var(--ozal-cyan)', cursor:'pointer'}}
                            />
                        </div>

                        {/* SEÇENEKLER */}
                        {(q.question_type === 'choice' || q.question_type === 'multiple') && (
                            <div style={{marginTop:'15px'}}>
                                <label style={{fontSize:'0.8rem', color:'var(--ozal-orange)', display:'block', marginBottom:'5px'}}>Seçenekler (Virgülle ayır)</label>
                                <input 
                                    type="text" className="modern-input" 
                                    value={q.options || ''} onChange={(e) => handleQuestionChange(index, 'options', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* BUTONLAR: Sadece Silme Butonu Kaldı */}
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        <button onClick={() => deleteQuestion(q.id)} title="Soruyu Sil" style={{background:'rgba(239, 68, 68, 0.1)', color:'#EF4444', border:'1px solid #EF4444', padding:'10px', borderRadius:'8px', cursor:'pointer', fontSize:'1.2rem'}}>🗑️</button>
                    </div>

                </div>
            ))}
        </div>
      )}

      {/* --- CEVAPLAR SEKMESİ --- */}
      {activeTab === 'responses' && (
        <div style={{display:'flex', flexDirection:'column', gap:'30px'}}>
             {!stats ? (
                <div style={{textAlign:'center', padding:'20px'}}>Veriler yükleniyor...</div>
            ) : stats.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px'}}>Henüz soru eklenmemiş veya cevap yok.</div>
            ) : (
                stats.map((stat) => (
                    <div key={stat.id} style={{background:'var(--card-bg)', padding:'30px', borderRadius:'16px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)'}}>
                        
                        {/* BAŞLIK */}
                        <div style={{marginBottom:'20px', borderBottom:'1px solid var(--nav-border)', paddingBottom:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h4 style={{margin:0, color:'var(--heading-color)', fontSize:'1.1rem'}}>{stat.text}</h4>
                            <span style={{fontSize:'0.85rem', color:'var(--text-muted)', background:'var(--input-bg)', padding:'4px 10px', borderRadius:'6px'}}>
                                Toplam: <strong>{stat.total}</strong>
                            </span>
                        </div>

                        {/* --- 1. METİN ve TARİH LİSTESİ --- */}
                        {(stat.type === 'text' || stat.type === 'date') && (
                             <div style={{maxHeight:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px'}}>
                                {stat.results && stat.results.length > 0 ? stat.results.map((txt, i) => (
                                    <div key={i} style={{background:'var(--bg-body)', padding:'10px', borderRadius:'8px', fontSize:'0.9rem', color:'var(--text-main)'}}>
                                        {txt}
                                    </div>
                                )) : <span style={{color:'var(--text-muted)'}}>Henüz cevap yok.</span>}
                             </div>
                        )}

                        {/* --- 2. SEÇİMLİ SORULAR (Choice & Multiple) - Progress Bar --- */}
                        {(stat.type === 'choice' || stat.type === 'multiple') && stat.results && (
                            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                                {Object.entries(stat.results).map(([option, count]) => {
                                    // Yüzde hesapla
                                    const percentage = stat.total > 0 ? Math.round((count / stat.total) * 100) : 0;
                                    return (
                                        <div key={option}>
                                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px', color:'var(--text-main)'}}>
                                                <span>{option}</span>
                                                <span style={{fontWeight:'bold'}}>{count} ({percentage}%)</span>
                                            </div>
                                            <div style={{width:'100%', height:'8px', background:'var(--input-bg)', borderRadius:'4px', overflow:'hidden'}}>
                                                <div style={{width: `${percentage}%`, height:'100%', background:'var(--ozal-cyan)', transition:'width 0.5s'}}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* --- 3. YILDIZ (Star) --- */}
                        {stat.type === 'star' && stat.results && (
                            <div style={{textAlign:'center'}}>
                                <div style={{fontSize:'3rem', fontWeight:'bold', color:'var(--heading-color)'}}>
                                    {stat.results.average} <span style={{fontSize:'1.5rem', color:'#FFD700'}}>★</span>
                                </div>
                                <p style={{color:'var(--text-muted)', marginTop:'-10px', fontSize:'0.9rem'}}>Ortalama Puan</p>
                                
                                {/* Dağılım Grafiği */}
                                <div style={{marginTop:'20px', display:'flex', gap:'5px', height:'60px', alignItems:'flex-end', justifyContent:'center'}}>
                                    {stat.results.distribution && Object.entries(stat.results.distribution).map(([star, count]) => (
                                        <div key={star} style={{width:'40px', display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                                            <div style={{width:'100%', background:'rgba(255, 215, 0, 0.2)', borderRadius:'4px 4px 0 0', height: `${stat.total > 0 ? (count / stat.total) * 100 : 0}%`, minHeight:'2px', position:'relative'}}>
                                                {count > 0 && <span style={{position:'absolute', top:'-20px', width:'100%', textAlign:'center', fontSize:'0.8rem'}}>{count}</span>}
                                            </div>
                                            <span style={{fontSize:'0.8rem'}}>{star}★</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- 4. ÖLÇEK (Scale 1-10) --- */}
                        {stat.type === 'scale' && stat.results && (
                            <div style={{textAlign:'center'}}>
                                <div style={{fontSize:'3rem', fontWeight:'bold', color:'var(--ozal-orange)'}}>
                                    {stat.results.average} <span style={{fontSize:'1.2rem', color:'var(--text-muted)'}}>/ 10</span>
                                </div>
                                <p style={{color:'var(--text-muted)', marginTop:'-10px', fontSize:'0.9rem'}}>Genel Memnuniyet Ortalaması</p>
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