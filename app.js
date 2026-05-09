/* ═══════════════════════════════════════════════════════════
   MAGNET APP – APP.JS
   Struktur:
   1. State Management
   2. Navigation & Page Transitions
   3. Background Color Transitions
   4. Form Handlers  (register → DB → login redirect)
                     (login   → DB → dashboard redirect)
   5. Toast Utility
   6. Google Auth Stub
   7. Init
════════════════════════════════════════════════════════════ */

import { auth, googleProvider, db } from './firebase-config.js';

// 🔥 TAMBAHKAN IMPOR FUNGSI AUTH & DATABASE
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";


/* ── 1. STATE ── */
const state = {
  currentPage: 'page-landing',
  registerType: null,       // 'mahasiswa' | 'perusahaan'
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

  // If navigating to register form, store the type
  if (pageId === 'page-register-form' && extra) {
    state.registerType = extra;
    updateRegisterTypeLabel(extra);
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
    void targetEl.offsetWidth; // reflow trick
    targetEl.style.animation = '';

    // Re-trigger inner card animations
    const card = targetEl.querySelector(
      '.form-card, .action-card, .register-type-card'
    );
    if (card) {
      card.style.animation = 'none';
      card.style.opacity = '1'; // pastikan opacity: 1 DULU sebelum animasi direset
      void card.offsetWidth;
      card.style.opacity = '';  // kembalikan ke CSS (animasi 'both' akan handle)
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

  }, 400); // matches exit transition duration
}

function updateRegisterTypeLabel(type) {
  const label = document.getElementById('register-type-label');
  if (!label) return;
  label.textContent = type === 'mahasiswa' ? 'Mahasiswa' : 'Perusahaan';
}


/* ── 3. BACKGROUND TRANSITIONS ── */

/**
 * Each page gets its own background gradient personality.
 * The .bg-layer smoothly transitions between them via CSS `transition`.
 */
const PAGE_BACKGROUNDS = {
  'page-landing': `
    linear-gradient(135deg, #2C0F6B 0%, #5A2D8F 40%, #3B1F7A 70%, #6A3DAA 100%)
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


/* ── 4. FORM HANDLERS ── */
let isRegisteringFirebase = false; // Penanda agar tidak auto-login

async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email) { showToast('Masukkan email atau nomor telepon.', 'error'); shakeInput('login-email'); return; }
  if (!password) { showToast('Masukkan kata sandi.', 'error'); shakeInput('login-password'); return; }

  showToast('Memproses masuk…', 'success');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ambil tipeAkun dari Firebase
    const dbRef = ref(db, 'users/' + user.uid);
    const snapshot = await get(dbRef);
    const fbData = snapshot.exists() ? snapshot.val() : {};
    const tipeAkun = fbData.tipeAkun || 'mahasiswa';

    // Simpan session lokal
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));

    // Sinkronkan ke magnet_users
    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    let localUser = users.find(u => u.id === user.uid);
    if (!localUser) {
      localUser = {
        id: user.uid,
        name: fbData.namaLengkap || user.email,
        email: user.email,
        type: tipeAkun,
        profile: null
      };
      users.push(localUser);
    } else {
      localUser.type = tipeAkun; // update type
    }
    localStorage.setItem('magnet_users', JSON.stringify(users));

    showToast('Berhasil masuk! Mengalihkan…', 'success');

    // Redirect sesuai tipe
    setTimeout(() => {
      if (tipeAkun === 'perusahaan') {
        window.location.href = 'tambah-lowongan.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 900);
  } catch (error) {
    showToast('Login gagal: Periksa email dan sandi', 'error');
    shakeInput('login-email'); shakeInput('login-password');
  }
}

async function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  // ... (validasi form biarkan sama persis seperti sebelumnya) ...
  if (!name) { showToast('Masukkan nama lengkap.', 'error'); shakeInput('reg-name'); return; }
  if (!email) { showToast('Masukkan email.', 'error'); shakeInput('reg-email'); return; }
  if (!validateEmail(email)) { showToast('Format email tidak valid.', 'error'); shakeInput('reg-email'); return; }
  if (!phone) { showToast('Masukkan nomor telepon.', 'error'); shakeInput('reg-phone'); return; }
  if (!password || password.length < 6) { showToast('Kata sandi minimal 6 karakter.', 'error'); shakeInput('reg-password'); return; }

  showToast('Memproses pendaftaran...', 'success');

try {
    isRegisteringFirebase = true;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // SIMPAN DATA PENDAFTARAN KE FIREBASE DENGAN TIPE YANG DIPILIH
    await set(ref(db, 'users/' + user.uid), {
      namaLengkap: name,
      email: email,
      nomorTelepon: phone,
      tipeAkun: state.registerType || 'mahasiswa',  // <-- PASTIKAN INI
      waktuDaftar: new Date().toISOString()
    });

    // Simpan ke magnet_users LOCAL
    const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    users.push({
      id: user.uid,
      name: name,
      email: email,
      phone: phone,
      type: state.registerType || 'mahasiswa',  // <-- PASTIKAN INI
      profile: null,
    });
    localStorage.setItem('magnet_users', JSON.stringify(users));

    await signOut(auth);
    isRegisteringFirebase = false;

    showToast('Pendaftaran berhasil! Silakan masuk.', 'success');
    setTimeout(() => {
      navigateTo('page-login');
      setTimeout(() => {
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) loginEmail.value = email;
      }, 500);
    }, 1200);
} catch (error) {
    isRegisteringFirebase = false; // Pastikan rem mati kalau error
    showToast('Gagal mendaftar: ' + error.message, 'error');
    shakeInput('reg-email');
  }
}

async function googleAuth() {
  showToast('Menghubungkan ke Google…');
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Cek apakah data sudah ada di Firebase
    const dbRef = ref(db, 'users/' + user.uid);
    const snapshot = await get(dbRef);
    const existing = snapshot.exists() ? snapshot.val() : {};

    const tipeAkun = existing.tipeAkun || 'mahasiswa';

    // Simpan/update data ke Firebase
    await set(dbRef, {
      namaLengkap: user.displayName || existing.namaLengkap || '',
      email: user.email,
      tipeAkun: tipeAkun,
      waktuLoginTerakhir: new Date().toISOString()
    });

    // Sinkronkan ke localStorage
    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    let localUser = users.find(u => u.id === user.uid);
    if (!localUser) {
      localUser = {
        id: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        type: tipeAkun,
        profile: null
      };
      users.push(localUser);
    } else {
      localUser.type = tipeAkun; // update jika berubah
    }
    localStorage.setItem('magnet_users', JSON.stringify(users));
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));

    showToast(`Berhasil masuk! Selamat datang, ${localUser.name}!`, 'success');

    // Redirect sesuai tipe
    setTimeout(() => {
      if (tipeAkun === 'perusahaan') {
        window.location.href = 'tambah-lowongan.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 900);
  } catch (error) {
    console.error(error);
    showToast('Gagal terhubung ke Google.', 'error');
  }
}


/* ── 5. TOAST UTILITY ── */

let toastTimer = null;

/**
 * showToast(message, type?, duration?)
 * @param {string} message
 * @param {'info'|'success'|'error'} [type='info']
 * @param {number} [duration=3000]
 */
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


/* ── 6. INPUT SHAKE ── */

function shakeInput(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;

  // Inject shake keyframes if not already present
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
        border-bottom-color: #E53E3E !important;
      }
    `;
    document.head.appendChild(style);
  }

  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}


/* ── 7. HELPERS ── */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Allow pressing Enter key to submit forms
 */
function setupEnterKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    const current = state.currentPage;
    if (current === 'page-login')        handleLogin();
    if (current === 'page-register-form') handleRegister();
  });
}


/* ── 8. INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Set initial background
  transitionBackground('page-landing');

  // Make landing page active
  const landing = document.getElementById('page-landing');
  if (landing) landing.classList.add('active');

  // Keyboard UX
  setupEnterKey();

  console.log('[Magnet] App initialized ✓');

// CEK STATUS LOGIN MENGGUNAKAN FIREBASE AUTH
  auth.onAuthStateChanged(async(user) => {
    
    // Trik Logout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      signOut(auth).then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      });
      return; 
    }

       // Di dalam auth.onAuthStateChanged((user) => { ...
if (user && !isRegisteringFirebase) {
    const dbRef = ref(db, 'users/' + user.uid);
    const snapshot = await get(dbRef);  // ⚠️ ubah callback jadi async!
    const fbData = snapshot.exists() ? snapshot.val() : {};
    const tipeAkun = fbData.tipeAkun || 'mahasiswa';

    const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    if (!users.find(u => u.id === user.uid)) {
        users.push({
            id: user.uid,
            name: fbData.namaLengkap || user.displayName || 'Sobat MagNet',
            email: user.email,
            type: tipeAkun,
            profile: null
        });
        localStorage.setItem('magnet_users', JSON.stringify(users));
    }
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));

    const namaSapaan = fbData.namaLengkap || user.displayName || 'Sobat MagNet';
    showToast(`Halo kembali lagi, ${namaSapaan}!`, 'success', 2000);
    
    setTimeout(() => {
        if (tipeAkun === 'perusahaan') {
            window.location.href = 'tambah-lowongan.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }, 1500);
}
  });
});

/* ── Toggle password visibility ── */
function togglePassword(inputId, btn) {
  const input  = document.getElementById(inputId);
  const eyeOn  = btn.querySelector('.eye-icon');
  const eyeOff = btn.querySelector('.eye-off-icon');

  if (input.type === 'password') {
    input.type     = 'text';
    eyeOn.style.display  = 'none';
    eyeOff.style.display = 'block';
    btn.title = 'Sembunyikan kata sandi';
  } else {
    input.type     = 'password';
    eyeOn.style.display  = 'block';
    eyeOff.style.display = 'none';
    btn.title = 'Tampilkan kata sandi';
  }
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.googleAuth = googleAuth;
window.navigateTo = navigateTo;    
window.togglePassword = togglePassword;