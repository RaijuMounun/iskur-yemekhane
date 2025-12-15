// frontend/src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import '../App.css';
import RatingForm from '../components/RatingForm';
import SurveyForm from '../components/SurveyForm';

function HomePage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // (Basitlik olsun diye sadece UI için "likedMenus" state'i tutalım)
  // Normalde bunu backend'den çekmemiz gerekir.
  const [likedMenus, setLikedMenus] = useState({}); 

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/menus/');
        const data = await response.json();
        setMenus(data);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const handleLike = async (menuId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Giriş yapmalısın kanki.");
      return;
    }

    // İsteği atmadan önce UI'da hemen kalbi boyayalım (Optimistic UI)
    setLikedMenus(prev => ({ ...prev, [menuId]: true }));

    try {
      const response = await fetch(`http://localhost:8000/api/menus/${menuId}/like/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!response.ok) {
        // Hata olursa geri al (Hata mesajını şimdilik boşverelim UI bozulmasın)
        // const errorData = await response.json();
        // alert(errorData.detail); 
      }
    } catch (err) {
      alert("Ağ hatası.");
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div className="App">
      <div className="menu-list">
        {menus.map(menu => (
          <div key={menu.id} className="menu-card">
            
            {/* ÜST KISIM: Tarih ve Kalp */}
            <div className="menu-header">
              <h2>{menu.date}</h2>
              <button 
                className={`like-btn ${likedMenus[menu.id] ? 'liked' : ''}`}
                onClick={() => handleLike(menu.id)}
                title="Menüyü Beğen"
              >
                {likedMenus[menu.id] ? '♥' : '♡'}
              </button>
            </div>

            {/* YEMEKLER */}
            <ul>
              {menu.meals.map(meal => (
                <li key={meal.id} className="meal-item">
                  <div className="meal-info">
                    <span>{meal.name}</span>
                    <span style={{color: '#99aabb', fontSize: '0.9rem'}}>{meal.calories} kcal</span>
                  </div>
                  {/* Yıldızlar buraya */}
                  <RatingForm mealId={meal.id} />
                </li>
              ))}
            </ul>

            {/* ALT KISIM: Anket */}
            <div className="survey-box">
               <SurveyForm menuId={menu.id} />
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;