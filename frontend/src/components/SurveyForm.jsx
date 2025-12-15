// frontend/src/components/SurveyForm.jsx
import React, { useState } from 'react';

function SurveyForm({ menuId }) {
  const [formData, setFormData] = useState({
    q_portion: 0,
    q_taste: 0,
    q_cleanliness: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.q_portion === 0 || formData.q_taste === 0 || formData.q_cleanliness === 0) {
      setMessage("Lütfen tüm soruları yanıtlayın.");
      return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage("Giriş yapmalısınız.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:8000/api/menus/${menuId}/submit_survey/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage("Anket gönderildi!");
      } else {
        setMessage("Hata oluştu.");
      }
    } catch (err) {
      setMessage("Ağ hatası.");
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = () => (
    <>
      <option value="0">Seçin...</option>
      <option value="1">1 (Kötü)</option>
      <option value="2">2 (İdare Eder)</option>
      <option value="3">3 (Orta)</option>
      <option value="4">4 (İyi)</option>
      <option value="5">5 (Harika)</option>
    </>
  );

  return (
    // Inline style SİLİNDİ, className eklendi
    <form onSubmit={handleSubmit} className="survey-form">
      <h4>Günün Menüsü Anketi</h4>
      
      <div className="form-group">
        <label>Porsiyon yeterliydi:</label>
        <select name="q_portion" value={formData.q_portion} onChange={handleChange}>
          {renderOptions()}
        </select>
      </div>
      
      <div className="form-group">
        <label>Yemekler lezzetliydi:</label>
        <select name="q_taste" value={formData.q_taste} onChange={handleChange}>
          {renderOptions()}
        </select>
      </div>
      
      <div className="form-group">
        <label>Temizlik yeterliydi:</label>
        <select name="q_cleanliness" value={formData.q_cleanliness} onChange={handleChange}>
          {renderOptions()}
        </select>
      </div>
      
      <button type="submit" disabled={loading} className="survey-btn">
        {loading ? '...' : 'ANKETİ GÖNDER'}
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  );
}

export default SurveyForm;