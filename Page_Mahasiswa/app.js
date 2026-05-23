/* ═══════════════════════════════════════════════════════════
   MAGNET APP – APP.JS
   Struktur:
   1. State Management
   2. Navigation & Page Transitions
   3. Background Color Transitions
   4. Form Switching (register & login)
   5. Form Handlers
   6. Toast Utility
   7. Google Auth Stub
   8. Init
════════════════════════════════════════════════════════════ */


/* ── 1. STATE ── */
const state = {
  currentPage: 'page-landing',
  registerType: null,       // 'mahasiswa' | 'perusahaan'
  loginType: null,          // 'mahasiswa' | 'perusahaan'
  isTransitioning: false,
};


/* ── 2. NAVIGATION & PAGE TRANSITIONS ── */

/**
 * navigateTo(pageId, extra?)
 * @param {string} pageId   - ID of the target <div class="page">
 * @param {string} [extra]  - optional: 'mahasiswa' | 'perusahaan'
 */
function navigateTo(pageId, extra) {
  if (state.isTransitioning) return;
  if (pageId === state.currentPage) return;

  state.isTransitioning = true;

  // Handle register form type
  if (pageId === 'page-register-form' && extra) {
    state.registerType = extra;
    switchRegisterForm(extra);
  }

  // Handle login form type
  if (pageId === 'page-login' && extra) {
    state.loginType = extra;
    switchLoginForm(extra);
  }

  const currentEl = document.getElementById(state.currentPage);
  const targetEl  = document.getElementById(pageId);

  if (!targetEl) {
    console.warn(`Page not found: ${pageId}`);
    state.isTransitioning = false;
    return;
  }

  // 1. Trigger background color shift
  transitionBackground(pageId);

  // 2. Exit current page
  currentEl.classList.add('exit');

  // 3. After exit animation, activate target
  setTimeout(() => {
    currentEl.classList.remove('active', 'exit');

    // Reset any stale animation on target
    targetEl.style.animation = 'none';
    void targetEl.offsetWidth;
    targetEl.style.animation = '';

    // Re-trigger inner card animations
    const card = targetEl.querySelector(
      '.form-card:not([style*="display:none"]):not([style*="display: none"]), .action-card, .register-type-card'
    );
    if (card) {
      card.style.animation = 'none';
      card.style.opacity = '1';
      void card.offsetWidth;
      card.style.opacity = '';
      card.style.animation = '';
    }

    const brandContent = targetEl.querySelector('.brand-content');
    if (brandContent) {
      brandContent.style.animation = 'none';
      brandContent.style.opacity = '1';
      void brandContent.offsetWidth;
      brandContent.style.opacity = '';
      brandContent.style.animation = '';
    }

    targetEl.classList.add('active');
    state.currentPage = pageId;

    setTimeout(() => {
      state.isTransitioning = false;
    }, 600);

  }, 400);
}


/* ── 3. FORM SWITCHING ── */

/**
 * Tampilkan form register yang sesuai (mahasiswa / perusahaan)
 */
function switchRegisterForm(type) {
  const formMahasiswa  = document.getElementById('form-mahasiswa');
  const formPerusahaan = document.getElementById('form-perusahaan');

  if (!formMahasiswa || !formPerusahaan) return;

  if (type === 'perusahaan') {
    formMahasiswa.style.display  = 'none';
    formPerusahaan.style.display = 'flex';
  } else {
    formMahasiswa.style.display  = 'flex';
    formPerusahaan.style.display = 'none';
  }
}

/**
 * Tampilkan form login yang sesuai (mahasiswa / perusahaan)
 */
function switchLoginForm(type) {
  const formMahasiswa  = document.getElementById('login-form-mahasiswa');
  const formPerusahaan = document.getElementById('login-form-perusahaan');

  if (!formMahasiswa || !formPerusahaan) return;

  if (type === 'perusahaan') {
    formMahasiswa.style.display  = 'none';
    formPerusahaan.style.display = 'flex';
  } else {
    formMahasiswa.style.display  = 'flex';
    formPerusahaan.style.display = 'none';
  }
}


/* ── 4. BACKGROUND TRANSITIONS ── */

const PAGE_BACKGROUNDS = {
  'page-landing': `
    linear-gradient(135deg, #2C0F6B 0%, #5A2D8F 40%, #3B1F7A 70%, #6A3DAA 100%)
  `,
  'page-login-type': `
    linear-gradient(120deg, #4A1B8C 0%, #6B2FAA 30%, #3B1F7A 60%, #8C3DC0 100%)
  `,
  'page-login': `
    linear-gradient(150deg, #1B0F5C 0%, #3D2080 35%, #5A2D8F 65%, #7B4BB8 100%)
  `,
  'page-register-type': `
    linear-gradient(120deg, #4A1B8C 0%, #6B2FAA 30%, #3B1F7A 60%, #8C3DC0 100%)
  `,
  'page-register-form': `
    linear-gradient(145deg, #1A0F4A 0%, #3B1F7A 30%, #5A2D8F 60%, #7B40B5 100%)
  `,
};

function transitionBackground(pageId) {
  const bgLayer = document.getElementById('bgLayer');
  if (!bgLayer) return;
  const bg = PAGE_BACKGROUNDS[pageId] || PAGE_BACKGROUNDS['page-landing'];
  bgLayer.style.background = bg.trim();
}


/* ── 5. FORM HANDLERS ── */

/* --- LOGIN MAHASISWA --- */
function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email) {
    showToast('Masukkan email atau nomor telepon.', 'error');
    shakeInput('login-email');
    return;
  }
  if (!password) {
    showToast('Masukkan kata sandi.', 'error');
    shakeInput('login-password');
    return;
  }

  const result = MagnetDB.login(email, password);

  if (!result.ok) {
    showToast(result.message, 'error');
    shakeInput('login-email');
    shakeInput('login-password');
    return;
  }

  showToast('Berhasil masuk! Mengalihkan…', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 900);
}

/* --- LOGIN PERUSAHAAN --- */
function handleLoginPerusahaan() {
  const email    = document.getElementById('login-corp-email').value.trim();
  const password = document.getElementById('login-corp-password').value.trim();

  if (!email) {
    showToast('Masukkan email perusahaan.', 'error');
    shakeInput('login-corp-email');
    return;
  }
  if (!password) {
    showToast('Masukkan kata sandi.', 'error');
    shakeInput('login-corp-password');
    return;
  }

  const result = MagnetDB.login(email, password);

  if (!result.ok) {
    showToast(result.message, 'error');
    shakeInput('login-corp-email');
    shakeInput('login-corp-password');
    return;
  }

  showToast('Berhasil masuk! Mengalihkan…', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 900);
}

/* --- REGISTER MAHASISWA --- */
function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  if (!name) {
    showToast('Masukkan nama lengkap.', 'error');
    shakeInput('reg-name');
    return;
  }
  if (!email) {
    showToast('Masukkan email.', 'error');
    shakeInput('reg-email');
    return;
  }
  if (!validateEmail(email)) {
    showToast('Format email tidak valid.', 'error');
    shakeInput('reg-email');
    return;
  }
  if (!phone) {
    showToast('Masukkan nomor telepon.', 'error');
    shakeInput('reg-phone');
    return;
  }
  if (!password || password.length < 6) {
    showToast('Kata sandi minimal 6 karakter.', 'error');
    shakeInput('reg-password');
    return;
  }

  const result = MagnetDB.register({
    name, email, phone, password,
    type: 'mahasiswa',
  });

  if (!result.ok) {
    showToast(result.message, 'error');
    shakeInput('reg-email');
    return;
  }

  showToast('Pendaftaran berhasil! Silakan masuk.', 'success');
  console.log('[Magnet] Registered:', result.user);

  setTimeout(() => {
    navigateTo('page-login', 'mahasiswa');
    setTimeout(() => {
      const loginEmail = document.getElementById('login-email');
      if (loginEmail) loginEmail.value = email;
    }, 500);
  }, 1200);
}

/* --- REGISTER PERUSAHAAN --- */
function handleRegisterPerusahaan() {
  const name     = document.getElementById('reg-corp-name').value.trim();
  const email    = document.getElementById('reg-corp-email').value.trim();
  const about    = document.getElementById('reg-corp-about').value.trim();
  const city     = document.getElementById('reg-corp-city').value.trim();
  const province = document.getElementById('reg-corp-province').value.trim();
  const password = document.getElementById('reg-corp-password').value.trim();

  if (!name) {
    showToast('Masukkan nama perusahaan.', 'error');
    shakeInput('reg-corp-name');
    return;
  }
  if (!email) {
    showToast('Masukkan email perusahaan.', 'error');
    shakeInput('reg-corp-email');
    return;
  }
  if (!validateEmail(email)) {
    showToast('Format email tidak valid.', 'error');
    shakeInput('reg-corp-email');
    return;
  }
  if (!about) {
    showToast('Isi deskripsi perusahaan.', 'error');
    shakeInput('reg-corp-about');
    return;
  }
  if (!city) {
    showToast('Masukkan kota.', 'error');
    shakeInput('reg-corp-city');
    return;
  }
  if (!province) {
    showToast('Masukkan provinsi.', 'error');
    shakeInput('reg-corp-province');
    return;
  }
  if (!password || password.length < 6) {
    showToast('Kata sandi minimal 6 karakter.', 'error');
    shakeInput('reg-corp-password');
    return;
  }

  const result = MagnetDB.register({
    name, email, about, city, province, password,
    type: 'perusahaan',
  });

  if (!result.ok) {
    showToast(result.message, 'error');
    shakeInput('reg-corp-email');
    return;
  }

  showToast('Pendaftaran perusahaan berhasil! Silakan masuk.', 'success');
  console.log('[Magnet] Registered company:', result.user);

  setTimeout(() => {
    navigateTo('page-login', 'perusahaan');
    setTimeout(() => {
      const loginEmail = document.getElementById('login-corp-email');
      if (loginEmail) loginEmail.value = email;
    }, 500);
  }, 1200);
}

function googleAuth() {
  showToast('Menghubungkan ke Google…');
  console.log('[Magnet] Google OAuth initiated');
}


/* ── 6. TOAST UTILITY ── */

let toastTimer = null;

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  toast.classList.remove('show', 'toast-success', 'toast-error', 'toast-info');
  void toast.offsetWidth;

  toast.textContent = message;
  toast.classList.add('show', `toast-${type}`);

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, duration);
}


/* ── 7. INPUT SHAKE ── */

function shakeInput(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;

  if (!document.getElementById('shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%      { transform: translateX(-6px); }
        40%      { transform: translateX(6px); }
        60%      { transform: translateX(-4px); }
        80%      { transform: translateX(4px); }
      }
      .shake {
        animation: shake 0.4s ease !important;
        outline: 2px solid #E53E3E !important;
      }
    `;
    document.head.appendChild(style);
  }

  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}


/* ── 8. HELPERS ── */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setupEnterKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    const current = state.currentPage;
    if (current === 'page-login') {
      if (state.loginType === 'perusahaan') handleLoginPerusahaan();
      else handleLogin();
    }
    if (current === 'page-register-form') {
      if (state.registerType === 'perusahaan') handleRegisterPerusahaan();
      else handleRegister();
    }
  });
}


/* ── 9. TOGGLE PASSWORD ── */
function togglePassword(inputId, btn) {
  const input  = document.getElementById(inputId);
  const eyeOn  = btn.querySelector('.eye-icon');
  const eyeOff = btn.querySelector('.eye-off-icon');

  if (input.type === 'password') {
    input.type           = 'text';
    eyeOn.style.display  = 'none';
    eyeOff.style.display = 'block';
    btn.title = 'Sembunyikan kata sandi';
  } else {
    input.type           = 'password';
    eyeOn.style.display  = 'block';
    eyeOff.style.display = 'none';
    btn.title = 'Tampilkan kata sandi';
  }
}


/* ── 10. INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Cek session aktif
  const existingSession = MagnetDB.getSession();
  if (existingSession) {
    const landing = document.getElementById('page-landing');
    if (landing) landing.classList.add('active');
    transitionBackground('page-landing');

    showToast(`Halo kembali lagi, ${existingSession.name}! Mengalihkan…`, 'success', 2000);
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
    return;
  }

  // Default state
  transitionBackground('page-landing');

  const landing = document.getElementById('page-landing');
  if (landing) landing.classList.add('active');

  // Pastikan form register mahasiswa tampil default
  switchRegisterForm('mahasiswa');
  // Pastikan form login mahasiswa tampil default
  switchLoginForm('mahasiswa');

  setupEnterKey();

  console.log('[Magnet] App initialized ✓');
});