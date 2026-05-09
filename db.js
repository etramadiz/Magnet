/* ═══════════════════════════════════════════════════════════
   MAGNET APP – DB.JS
════════════════════════════════════════════════════════════ */
const MagnetDB = (() => {
  const USERS_KEY   = 'magnet_users';
  const SESSION_KEY = 'magnet_session';
  const APPS_KEY    = 'magnet_applications';
  const REVIEWS_KEY = 'magnet_reviews';

  function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  /* ── Auth ── */
  function register({ name, email, phone, password, type }) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { ok:false, message:'Email sudah terdaftar.' };
    const user = { id:Date.now().toString(), name, email, phone, password, type,
                   createdAt:new Date().toISOString(), avatar:null, profile:null };
    users.push(user); saveUsers(users);
    return { ok:true, user };
  }

  function login(email, password) {
    const user = getUsers().find(u => u.email===email && u.password===password);
    if (!user) return { ok:false, message:'Email atau kata sandi salah.' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId:user.id }));
    return { ok:true, user };
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return getUsers().find(u => u.id===userId) || null;
  }

  function logout() { localStorage.removeItem(SESSION_KEY); }

  /* ── Profile ── */
  function saveProfile(profileData) {
    const session = getSession();
    if (!session) return { ok:false, message:'Tidak ada sesi aktif.' };
    const users = getUsers();
    const idx = users.findIndex(u => u.id===session.id);
    if (idx===-1) return { ok:false, message:'User tidak ditemukan.' };
    if (profileData.name)   users[idx].name   = profileData.name;
    if (profileData.avatar) users[idx].avatar = profileData.avatar;
    users[idx].profile = { ...profileData, updatedAt:new Date().toISOString() };
    saveUsers(users);
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

  /* ── Applications ── */
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

  /* ── Reviews ── */
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
      userId:session.id,
      userName: session.name,
      userInitial: session.name.charAt(0).toUpperCase(),
      companyId, companyName, rating, title,
      reviewText, pros, cons, role,
      createdAt: existing>=0 ? reviews[existing].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existing>=0) reviews[existing] = review;
    else reviews.push(review);

    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return { ok:true, review };
  }

  function getCompanyReviews(companyId) {
    return getAllReviews()
      .filter(r => r.companyId===companyId)
      .sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
  }

  function getUserReview(companyId) {
    const session = getSession();
    if (!session) return null;
    return getAllReviews().find(r => r.userId===session.id && r.companyId===companyId) || null;
  }

  /* ── Guards ── */
  function requireAuth(redirectTo='index.html') { if (!getSession()) window.location.href=redirectTo; }
  function requireGuest(redirectTo='dashboard.html') { if (getSession()) window.location.href=redirectTo; }

  return {
    register, login, getSession, logout,
    saveProfile, getProfile, isProfileComplete,
    saveApplication, getUserApplications, hasApplied, hasAppliedToCompany,
    saveReview, getCompanyReviews, getUserReview,
    requireAuth, requireGuest,
  };
})();