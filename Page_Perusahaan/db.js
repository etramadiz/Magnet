/* ═══════════════════════════════════════════════════════════
   MAGNET APP – DB.JS
════════════════════════════════════════════════════════════ */
const MagnetDB = (() => {
  // DATABASE SEKARANG DIPISAH TOTAL
  const MHS_KEY     = 'magnet_mahasiswa';
  const PRU_KEY     = 'magnet_perusahaan';
  
  const SESSION_KEY = 'magnet_session';
  const APPS_KEY    = 'magnet_applications';
  const REVIEWS_KEY = 'magnet_reviews';

// UBAH 3 BARIS INI MENJADI SEPERTI INI:
  const LOGIN_URL = '../Page_Login_Register/index.html';
  const MHS_DASH  = '../Page_Mahasiswa/dashboard.html';
  const PRU_DASH  = '../Page_Perusahaan/dashboard.html';

  function register({ name, email, phone, password, type }) {
    // Tentukan masuk ke penyimpanan mana
    const KEY = type === 'perusahaan' ? PRU_KEY : MHS_KEY;
    const users = JSON.parse(localStorage.getItem(KEY) || '[]');
    
    if (users.find(u => u.email === email)) return { ok:false, message:'Email sudah terdaftar.' };
    
    const user = { id:Date.now().toString(), name, email, phone:phone||'', password, type,
                   createdAt:new Date().toISOString(), avatar:null, profile:null };
    users.push(user); 
    localStorage.setItem(KEY, JSON.stringify(users));
    return { ok:true, user };
  }

  function login(email, password) {
    // 1. Cari di penyimpanan perusahaan dulu
    let pruUsers = JSON.parse(localStorage.getItem(PRU_KEY) || '[]');
    let user = pruUsers.find(u => u.email===email && u.password===password);
    
    // 2. Jika tidak ketemu, cari di penyimpanan mahasiswa
    if (!user) {
      let mhsUsers = JSON.parse(localStorage.getItem(MHS_KEY) || '[]');
      user = mhsUsers.find(u => u.email===email && u.password===password);
    }

    if (!user) return { ok:false, message:'Email atau kata sandi salah.' };
    
    // Simpan sesi beserta tipe untuk identifikasi
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId:user.id, type:user.type }));
    return { ok:true, user };
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { 
      const { userId, type } = JSON.parse(raw); 
      const KEY = type === 'perusahaan' ? PRU_KEY : MHS_KEY;
      const users = JSON.parse(localStorage.getItem(KEY) || '[]');
      return users.find(u => u.id===userId) || null; 
    }
    catch(e) { return null; }
  }

  function logout() { localStorage.removeItem(SESSION_KEY); }

  function updateUser(userId, data) {
    // Coba update data di tabel perusahaan
    let pruUsers = JSON.parse(localStorage.getItem(PRU_KEY) || '[]');
    let idx = pruUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      Object.assign(pruUsers[idx], data);
      localStorage.setItem(PRU_KEY, JSON.stringify(pruUsers));
      return { ok:true, user:pruUsers[idx] };
    }

    // Coba update data di tabel mahasiswa
    let mhsUsers = JSON.parse(localStorage.getItem(MHS_KEY) || '[]');
    idx = mhsUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      Object.assign(mhsUsers[idx], data);
      localStorage.setItem(MHS_KEY, JSON.stringify(mhsUsers));
      return { ok:true, user:mhsUsers[idx] };
    }

    return { ok:false, message:'User tidak ditemukan.' };
  }

  function saveProfile(profileData) {
    const session = getSession();
    if (!session) return { ok:false, message:'Tidak ada sesi aktif.' };
    
    const KEY = session.type === 'perusahaan' ? PRU_KEY : MHS_KEY;
    const users = JSON.parse(localStorage.getItem(KEY) || '[]');
    const idx = users.findIndex(u => u.id===session.id);
    
    if (idx===-1) return { ok:false, message:'User tidak ditemukan.' };
    if (profileData.name)   users[idx].name   = profileData.name;
    if (profileData.avatar) users[idx].avatar = profileData.avatar;
    const prev = users[idx].profile || {};
    users[idx].profile = Object.assign({}, prev, profileData, { updatedAt:new Date().toISOString() });
    
    localStorage.setItem(KEY, JSON.stringify(users));
    return { ok:true, user:users[idx] };
  }

  function getProfile() {
    const user = getSession();
    return user ? (user.profile||null) : null;
  }

  function isProfileComplete() {
    const p = getProfile();
    if (!p) return false;
    return ['universitas','jurusan','semester'].every(k => p[k] && String(p[k]).trim()!=='');
  }

  function getAllApplications() {
    return JSON.parse(localStorage.getItem(APPS_KEY) || '[]');
  }

  function saveApplication({ jobId, jobTitle, company, companyShort, logoColor, documents }) {
    const session = getSession();
    if (!session) return { ok:false, message:'Tidak ada sesi aktif.' };
    const apps = getAllApplications();
    if (apps.find(a => a.userId===session.id && a.jobId===jobId))
      return { ok:false, message:'Kamu sudah pernah melamar posisi ini.' };
    const app = {
      id:Date.now().toString(), userId:session.id,
      userName:session.name, userEmail:session.email,
      jobId, jobTitle, company, companyShort, logoColor,
      appliedAt:new Date().toISOString(), status:'terkirim',
      documents:documents||{},
    };
    apps.push(app);
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
    return { ok:true, app };
  }

  function getUserApplications() {
    const session = getSession();
    if (!session) return [];
    return getAllApplications().filter(a => a.userId===session.id)
           .sort((a,b) => new Date(b.appliedAt)-new Date(a.appliedAt));
  }

  function getApplicationsByJob(jobId) {
    return getAllApplications().filter(a => a.jobId===String(jobId));
  }

  function updateApplicationStatus(appId, status) {
    const apps = getAllApplications();
    const idx = apps.findIndex(a => a.id===appId);
    if (idx===-1) return { ok:false };
    apps[idx].status = status;
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
    return { ok:true };
  }

  function hasApplied(jobId) {
    const session = getSession();
    if (!session) return false;
    return getAllApplications().some(a => a.userId===session.id && a.jobId===jobId);
  }

  function hasAppliedToCompany(companyName) {
    const session = getSession();
    if (!session) return false;
    return getAllApplications().some(a => a.userId===session.id && a.company===companyName);
  }

  function getAllReviews() {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  }

  function saveReview({ companyId, companyName, rating, title, reviewText, pros, cons, role }) {
    const session = getSession();
    if (!session) return { ok:false, message:'Tidak ada sesi aktif.' };
    const reviews = getAllReviews();
    const existing = reviews.findIndex(r => r.userId===session.id && r.companyId===companyId);
    const review = {
      id: existing>=0 ? reviews[existing].id : Date.now().toString(),
      userId:session.id, userName:session.name, userInitial:session.name.charAt(0).toUpperCase(),
      companyId, companyName, rating, title, reviewText, pros, cons, role,
      createdAt: existing>=0 ? reviews[existing].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existing>=0) reviews[existing] = review; else reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return { ok:true, review };
  }

  function getCompanyReviews(companyId) {
    return getAllReviews().filter(r => r.companyId===companyId)
      .sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
  }

  function getUserReview(companyId) {
    const session = getSession();
    if (!session) return null;
    return getAllReviews().find(r => r.userId===session.id && r.companyId===companyId) || null;
  }

  function requireAuth() {
    if (!getSession()) { window.location.href=LOGIN_URL; return false; }
    return true;
  }
  function requireMahasiswaAuth() {
    const s = getSession();
    if (!s) { window.location.href=LOGIN_URL; return false; }
    if (s.type !== 'mahasiswa') { window.location.href=LOGIN_URL; return false; }
    return true;
  }
  function requirePerusahaanAuth() {
    const s = getSession();
    if (!s) { window.location.href=LOGIN_URL; return false; }
    if (s.type !== 'perusahaan') { window.location.href=LOGIN_URL; return false; }
    return true;
  }
  function requireGuest() {
    const s = getSession();
    if (!s) return;
    if (s.type === 'perusahaan') window.location.href=PRU_DASH;
    else window.location.href=MHS_DASH;
  }

  return {
    register, login, getSession, logout, updateUser,
    saveProfile, getProfile, isProfileComplete,
    saveApplication, getUserApplications, getAllApplications,
    getApplicationsByJob, updateApplicationStatus,
    hasApplied, hasAppliedToCompany,
    saveReview, getCompanyReviews, getUserReview,
    requireAuth, requireMahasiswaAuth, requirePerusahaanAuth, requireGuest,
  };
})();