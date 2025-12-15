// frontend/src/components/RatingForm.jsx
import React, { useState } from 'react';

function RatingForm({ mealId }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (selectedScore) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Giriş yapmalısın.");
      return;
    }
    setScore(selectedScore);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/meals/${mealId}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ score: selectedScore })
      });
      if (response.ok) console.log("Puanlandı");
      else setMessage('Hata');
    } catch (err) {
      setMessage('Ağ hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Inline style temizlendi
    <div className="rating-container">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hover || score) ? 'active' : ''}`}
            onClick={() => handleSubmit(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            role="button"
          >
            ★
          </span>
        ))}
      </div>
      {message && <small className="error-msg">{message}</small>}
    </div>
  );
}

export default RatingForm;