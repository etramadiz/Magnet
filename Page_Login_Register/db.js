const MagnetDB = (() => {
  const MHS_KEY     = 'magnet_mahasiswa';
  const PRU_KEY     = 'magnet_perusahaan';
  const SESSION_KEY = 'magnet_session';
  const APPS_KEY    = 'magnet_applications';
  const REVIEWS_KEY = 'magnet_reviews';

  // --- SETTING PATH (SESUAIKAN DI BAWAH) ---
  // Jika file db.js ada di folder "Page_Login_Register", maka path-nya adalah:
  const LOGIN_URL = 'index.html';
  const MHS_DASH  = '../Page_Mahasiswa/dashboard.html';
  const PRU_DASH  = '../Page_Perusahaan/dashboard.html';
  // ----------------------------------------

  function getUsers(type) {
    const KEY = type === 'perusahaan' ? PRU_KEY : MHS_KEY;
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function register({ name, email, phone, password, type }) {
    const KEY = type === 'perusahaan' ? PRU_KEY : MHS_KEY;
    const users = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (users.find(u => u.email === email)) return { ok: false, message: 'Email sudah terdaftar.' };
    const user = { id: Date.now().toString(), name, email, phone: phone || '', password, type, createdAt: new Date().toISOString(), avatar: null, profile: null };
    users.push(user);
    localStorage.setItem(KEY, JSON.stringify(users));
    return { ok: true, user };
  }

  function login(email, password) {
    let users = JSON.parse(localStorage.getItem(PRU_KEY) || '[]').concat(JSON.parse(localStorage.getItem(MHS_KEY) || '[]'));
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, message: 'Email atau kata sandi salah.' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, type: user.type }));
    return { ok: true, user };
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const { userId, type } = JSON.parse(raw);
      const KEY = type === 'perusahaan' ? PRU_KEY : MHS_KEY;
      const users = JSON.parse(localStorage.getItem(KEY) || '[]');
      return users.find(u => u.id === userId) || null;
    } catch (e) { return null; }
  }

  function logout() { localStorage.removeItem(SESSION_KEY); window.location.href = LOGIN_URL; }

  function updateUser(userId, data) {
    [PRU_KEY, MHS_KEY].forEach(KEY => {
      let users = JSON.parse(localStorage.getItem(KEY) || '[]');
      let idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        Object.assign(users[idx], data);
        localStorage.setItem(KEY, JSON.stringify(users));
      }
    });
    return { ok: true };
  }

  function requireAuth() { if (!getSession()) { window.location.href = LOGIN_URL; return false; } return true; }
  function requireMahasiswaAuth() { const s = getSession(); if (!s || s.type !== 'mahasiswa') { window.location.href = LOGIN_URL; return false; } return true; }
  function requirePerusahaanAuth() { const s = getSession(); if (!s || s.type !== 'perusahaan') { window.location.href = LOGIN_URL; return false; } return true; }

  return { register, login, getSession, logout, updateUser, requireAuth, requireMahasiswaAuth, requirePerusahaanAuth };
})();