// frontend/src/pages/admin/UserList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook'u tanımla
  
  // Modallar için State'ler
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ userId: null, newPassword: '' });

  // Kendi yetkimizi listeden veya localStorage'dan bulacağız
  const currentUser = localStorage.getItem('username');
  // LocalStorage'a yeni eklediğimiz için eski oturumlarda olmayabilir, string kontrolü yapalım
  const amISuper = localStorage.getItem('isSuperUser') === 'true';

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- API İŞLEMLERİ ---

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8000/api/users/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      // --- DÜZELTME 2: YETKİ KONTROLÜ (KICK-OUT) ---
      if (res.status === 403) {
        // Eğer sunucu "Yasak" dediyse, yetkimiz gitmiştir.
        // Frontend'i de buna uyumlu hale getirip sayfayı yeniliyoruz.
        localStorage.setItem('isStaff', 'false'); 
        alert("Yetkiniz kısıtlandı veya oturum süreniz doldu. Ana sayfaya yönlendiriliyorsunuz.");
        window.location.reload(); // Sayfayı yenile ki AdminLayout devreye girip "Erişim Reddedildi" desin
        return;
      }

      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) { 
      console.error("Kullanıcılar yüklenemedi:", err);
    } finally { 
      setLoading(false); 
    }
  };

  // Yetki Değiştirme (Staff/Superuser Yapma)
  const toggleStaff = async (user) => {
    // --- KENDİ YETKİNİ DEĞİŞTİRME ENGELİ ---
    const currentUsername = localStorage.getItem('username');
    if (user.username === currentUsername) {
        alert("Güvenlik gereği kendi yetkilerinizi değiştiremezsiniz. Başka bir yönetici işlem yapmalıdır.");
        return; // İşlemi durdur
    }

    // Süper Admin koruması
    if (user.is_superuser) {
        alert("Süper Admin yetkileri buradan değiştirilemez. Yalnızca Süper Admin bu yetkileri değiştirebilir. (Django Admin panelini kullanın.)");
        return;
    }

    const confirmMsg = user.is_staff 
        ? `${user.username} kullanıcısının yetkisini almak istiyor musun?` 
        : `${user.username} kullanıcısını YÖNETİCİ yapmak istiyor musun?`;
    
    if(!window.confirm(confirmMsg)) return;

    try {
        const token = localStorage.getItem('authToken');
        const updatedStatus = !user.is_staff;
        
        const res = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ is_staff: updatedStatus })
        });

        if (res.status === 403) {
             localStorage.setItem('isStaff', 'false'); 
             window.location.reload();
             return;
        }

        if(res.ok) {
            setUsers(users.map(u => u.id === user.id ? {...u, is_staff: updatedStatus} : u));
            alert(`Yetki güncellendi: ${updatedStatus ? 'Yönetici Oldu' : 'Yetkisi Alındı'}`);
        }
    } catch(err) { alert("İşlem başarısız."); }
  };

  // Kullanıcı Silme
  const deleteUser = async (id) => {
    // Kendi kendini silme engeli
    const userToDelete = users.find(u => u.id === id);
    const currentUsername = localStorage.getItem('username');
    if (userToDelete && userToDelete.username === currentUsername) {
        alert("Kendinizi silemezsiniz.");
        return;
    }

    // Frontend Koruması (Fazladan güvenlik)
    if (userToDelete.is_superuser && !amISuper) {
        alert("Yetkiniz yetersiz: Süper Adminleri silemezsiniz!");
        return;
    }

    if(!window.confirm("Bu kullanıcıyı kalıcı olarak silmek istediğine emin misin?")) return;
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8000/api/users/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });

        if (res.status === 403) {
             localStorage.setItem('isStaff', 'false'); 
             window.location.reload();
             return;
        }

        if(res.ok) {
            setUsers(users.filter(u => u.id !== id));
        }else {
            alert("Silme işlemi başarısız.");
        }
    } catch(err) { alert("Silinemedi."); }
  };

  // Yeni Kullanıcı Ekleme
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        if(res.ok) {
            alert("Kullanıcı oluşturuldu!");
            setShowModal(false);
            setNewUser({ username: '', email: '', password: '' });
            fetchUsers(); 
        } else {
            alert("Hata: Kullanıcı adı veya e-posta alınmış olabilir.");
        }
    } catch(err) { alert("Sunucu hatası."); }
  };

  // Şifre Sıfırlama
  const handleResetPassword = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8000/api/users/${passData.userId}/reset_password/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}` 
            },
            body: JSON.stringify({ password: passData.newPassword })
        });

        if (res.status === 403) {
             localStorage.setItem('isStaff', 'false'); 
             window.location.reload();
             return;
        }
        
        if(res.ok) {
            alert("Şifre başarıyla değiştirildi.");
            setShowPassModal(false);
            setPassData({ userId: null, newPassword: '' });
        } else {
            alert("Şifre değiştirilemedi.");
        }
      } catch(err) { alert("Hata."); }
  };


  if (loading) return <div style={{textAlign:'center', padding:'40px'}}>Yükleniyor...</div>;

  return (
    <div>
      <div className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <h1>Kullanıcı Yönetimi</h1>
            <p>Kayıtlı öğrencileri ve personeli yönet.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="auth-btn" style={{width:'auto', padding:'12px 25px', fontSize:'0.9rem'}}>
            + Yeni Kullanıcı
        </button>
      </div>

      <div style={{background: 'var(--card-bg)', borderRadius: '16px', boxShadow: 'var(--card-shadow)', overflowX: 'auto', border: '1px solid var(--card-border)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth:'600px'}}>
            <thead>
                <tr style={{background: 'var(--input-bg)', borderBottom: '1px solid var(--card-border)'}}>
                    <th style={{padding: '15px 20px', color: 'var(--heading-color)'}}>Kullanıcı Adı</th>
                    <th style={{padding: '15px 20px', color: 'var(--heading-color)'}}>E-Posta</th>
                    <th style={{padding: '15px 20px', color: 'var(--heading-color)'}}>Yetki</th>
                    <th style={{padding: '15px 20px', color: 'var(--heading-color)', textAlign:'right'}}>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} style={{borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s'}}>
                        <td style={{padding: '15px 20px', fontWeight:'600', color:'var(--text-main)'}}>
                            {user.username}
                        </td>
                        <td style={{padding: '15px 20px', color:'var(--text-muted)'}}>
                            {user.email}
                        </td>
                        <td style={{padding: '15px 20px'}}>
                            <span style={{
                                padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                background: user.is_staff ? 'rgba(18, 167, 205, 0.15)' : 'rgba(107, 114, 128, 0.1)',
                                color: user.is_staff ? 'var(--ozal-cyan)' : 'var(--text-muted)',
                                border: user.is_staff ? '1px solid var(--ozal-cyan)' : '1px solid transparent'
                            }}>
                                {user.is_superuser ? 'Süper Admin' : (user.is_staff ? 'Yönetici' : 'Öğrenci')}
                            </span>
                        </td>
                        <td style={{padding: '15px 20px', textAlign:'right', display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                            
                            {/* YETKİ BUTONU */}
                            <button 
                                onClick={() => toggleStaff(user)}
                                title={user.is_superuser ? "Süper Admin Değiştirilemez" : (user.is_staff ? "Yetkiyi Al" : "Yönetici Yap")}
                                disabled={user.is_superuser} // Süper adminse tıklanmasın
                                style={{
                                    background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', 
                                    width:'32px', height:'32px', borderRadius:'6px', cursor: user.is_superuser ? 'not-allowed' : 'pointer', 
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    // Süper adminse veya kendisi ise silik göster
                                    opacity: (user.is_superuser || user.username === localStorage.getItem('username')) ? 0.3 : 1
                                }}
                            >
                                {user.is_superuser ? '👑' : (user.is_staff ? '⬇️' : '⬆️')}
                            </button>

                            {/* ŞİFRE BUTONU */}
                            <button 
                                onClick={() => { setPassData({...passData, userId: user.id}); setShowPassModal(true); }}
                                title="Şifre Değiştir"
                                style={{
                                    background: 'transparent', border: '1px solid var(--ozal-orange)', color: 'var(--ozal-orange)', 
                                    width:'32px', height:'32px', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
                                }}
                            >
                                🔑
                            </button>

                            {/* SİLME BUTONU */}
                            <button 
                                onClick={() => deleteUser(user.id)}
                                title={
                                    user.is_superuser && !amISuper 
                                    ? "Süper Admin Silinemez" 
                                    : "Kullanıcıyı Sil"
                                }
                                // Eğer silinecek kişi Superuser VE Ben Superuser Değilsem -> DEVRE DIŞI
                                disabled={user.is_superuser && !amISuper}
                                style={{
                                    background: 'transparent', 
                                    border: '1px solid #EF4444', 
                                    color: '#EF4444', 
                                    width:'32px', height:'32px', borderRadius:'6px', 
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    
                                    // Pasiflik Görünümü
                                    cursor: (user.is_superuser && !amISuper) ? 'not-allowed' : 'pointer',
                                    opacity: (user.is_superuser && !amISuper) || (user.username === currentUser) ? 0.3 : 1
                                }}
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* --- YENİ KULLANICI MODALI --- */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-box" style={{maxWidth:'400px'}}>
                <h3 style={{color:'var(--heading-color)', marginTop:0}}>Yeni Kullanıcı Ekle</h3>
                <form onSubmit={handleAddUser} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <input type="text" placeholder="Kullanıcı Adı" className="modern-input" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                    <input type="email" placeholder="E-Posta" className="modern-input" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    <input type="password" placeholder="Şifre" className="modern-input" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    <div className="modal-actions">
                        <button type="submit" className="modal-btn btn-copy">Oluştur</button>
                        <button type="button" onClick={() => setShowModal(false)} className="modal-btn btn-cancel">İptal</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- ŞİFRE SIFIRLAMA MODALI --- */}
      {showPassModal && (
        <div className="modal-overlay">
            <div className="modal-box" style={{maxWidth:'350px'}}>
                <h3 style={{color:'var(--heading-color)', marginTop:0}}>Şifreyi Sıfırla</h3>
                <p style={{color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'15px'}}>Yeni şifreyi giriniz.</p>
                <form onSubmit={handleResetPassword} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <input type="text" placeholder="Yeni Şifre" className="modern-input" required value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
                    <div className="modal-actions">
                        <button type="submit" className="modal-btn btn-copy" style={{background:'var(--ozal-navy)'}}>Güncelle</button>
                        <button type="button" onClick={() => setShowPassModal(false)} className="modal-btn btn-cancel">İptal</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

export default UserList;