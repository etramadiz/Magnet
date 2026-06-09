/* ═══════════════════════════════════════════════════════════
   MAGNET – DASHBOARD.JS (dengan Firebase)
════════════════════════════════════════════════════════════ */

import { auth } from '../Page_Login_Register/firebase-config.js';
import { syncProfileFromFirebase } from '../Page_Login_Register/auth-firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Hapus array JOBS statis, kita akan ambil dari Firebase
let jobs = []; // akan diisi dari Firebase
let savedJobs = new Set(JSON.parse(localStorage.getItem('mg_saved') || '[]'));
let activeFilter = 'all';

function persistSaved() {
  localStorage.setItem('mg_saved', JSON.stringify([...savedJobs]));
}

/* ── Render job cards ── (menggunakan jobs dari Firebase) */
function renderJobs(filter = 'all') {
  const list = document.getElementById('jobsList');
  if (!list) return;

  let filtered = jobs;
  if (filter === 'new')    filtered = jobs.filter(j => j.isNew);
  if (filter !== 'all' && filter !== 'new') filtered = jobs.filter(j => j.category === filter);

  if (!filtered.length) {
    list.innerHTML = '<p style="color:var(--text-light);grid-column:1/-1;text-align:center;padding:40px 0">Tidak ada lowongan ditemukan.</p>';
    return;
  }

  list.innerHTML = filtered.map((job, i) => `
    <div class="job-card" style="animation-delay:${i * 0.06}s" onclick="openJob('${job.id}')">
      <div class="job-card-top">
        <div class="company-logo" style="background:${job.logoColor}18; color:${job.logoColor}; border-color:${job.logoColor}22;">
          ${job.companyShort || (job.companyName ? job.companyName.charAt(0) : '?')}
        </div>
        <div class="job-main">
          <p class="job-title">${escapeHtml(job.title)}</p>
          <p class="job-company">${escapeHtml(job.companyName || job.company)}</p>
        </div>
        <div class="job-card-actions">
          <button class="bookmark-btn ${savedJobs.has(String(job.id)) ? 'saved' : ''}"
            onclick="toggleSave(event, '${job.id}')" title="Simpan">
            <svg viewBox="0 0 24 24" fill="${savedJobs.has(String(job.id)) ? 'currentColor' : 'none'}"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          ${job.isNew ? `<span class="new-badge">Baru</span>` : ''}
        </div>
      </div>

      <div class="job-meta">
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${job.type || 'Magang'}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${job.location}
        </span>
      </div>

      <p class="job-salary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:4px"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        ${job.salary || 'Rp 0'}
      </p>

      <div class="job-tags">
        ${(job.tags || []).map(t => `<span class="job-tag">${escapeHtml(t)}</span>`).join('')}
      </div>

      <div class="job-card-footer">
        <span class="job-time">${formatRelativeTime(job.createdAt)}</span>
        <button class="apply-btn" onclick="applyJob(event, '${job.id}')">Lamar</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return 'Baru';
  const date = new Date(isoDate);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  if (diff < 7) return `${diff} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

function isNewJob(isoDate) {
  if (!isoDate) return true;
  const diff = (new Date() - new Date(isoDate)) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

/* ── Filter chips ── */
function setFilter(el, filter) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeFilter = filter;
  renderJobs(filter);
}

/* ── Bookmark ── */
function toggleSave(e, id) {
  e.stopPropagation();
  const strId = String(id);
  if (savedJobs.has(id)) {
    savedJobs.delete(id);
    showToast('Lowongan dihapus dari simpanan');
  } else {
    savedJobs.add(id);
    showToast('Lowongan disimpan ✓');
  }
  persistSaved();
  renderJobs(activeFilter);
}

/* ── Apply → buka detail lowongan ── */
function applyJob(e, id) {
  e.stopPropagation();
  window.location.href = 'detail-lowongan.html?id=' + id;
}

/* ── Open job → buka detail lowongan ── */
function openJob(id) {
  window.location.href = 'detail-lowongan.html?id=' + id;
}

/* ═══════════════════════════
   SIDEBAR TOGGLE (sama persis seperti asli)
═══════════════════════════ */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
    } else {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('visible');
    }
  } else {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

function restoreSidebarState() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (window.innerWidth > 900) {
    const collapsed = localStorage.getItem('sidebar_collapsed') === '1';
    if (collapsed) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

/* ═══════════════════════════
   SEARCH (sama persis seperti asli, tapi gunakan jobs)
═══════════════════════════ */
function toggleSearch() {
  const wrap = document.getElementById('searchBarWrap');
  const input = document.getElementById('searchInput');
  const isOpen = wrap.classList.contains('open');
  if (isOpen) {
    wrap.classList.remove('open');
  } else {
    wrap.classList.add('open');
    setTimeout(() => input.focus(), 150);
  }
}

function triggerSearch() {
  toggleSearch();
}

// Live search filter - gunakan jobs dari Firebase
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      if (!q) { renderJobs(activeFilter); return; }
      const filtered = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        (j.companyName || j.company || '').toLowerCase().includes(q) ||
        (j.location || '').toLowerCase().includes(q) ||
        (j.tags || []).some(t => t.toLowerCase().includes(q))
      );
      const list = document.getElementById('jobsList');
      if (!list) return;
      if (!filtered.length) {
        list.innerHTML = `<p style="color:var(--text-light);font-size:0.9rem;text-align:center;padding:32px 0;">Tidak ada lowongan ditemukan untuk "<strong>${q}</strong>"</p>`;
        return;
      }
      list.innerHTML = filtered.map((job, i) => `
        <div class="job-card" style="animation-delay:${i * 0.05}s" onclick="openJob('${job.id}')">
          <div class="job-card-top">
            <div class="company-logo" style="background:${job.logoColor}18; color:${job.logoColor};">
              ${job.companyShort || (job.companyName ? job.companyName.charAt(0) : '?')}
            </div>
            <div class="job-main">
              <p class="job-title">${escapeHtml(job.title)}</p>
              <p class="job-company">${escapeHtml(job.companyName || job.company)}</p>
            </div>
            <div class="job-card-actions">${job.isNew ? '<span class="new-badge">Baru</span>' : ''}</div>
          </div>
          <div class="job-meta">
            <span class="meta-item">${job.type || 'Magang'}</span>
            <span class="meta-item">${job.location || '-'}</span>
          </div>
          <p class="job-salary">${job.salary || 'Rp 0'}</p>
          <div class="job-card-footer">
            <span class="job-time">${formatRelativeTime(job.createdAt)}</span>
            <button class="apply-btn" onclick="applyJob(event, '${job.id}')">Lamar</button>
          </div>
        </div>`).join('');
    });
  }
});

/* ═══════════════════════════
   NOTIFICATION PANEL (sama persis seperti asli)
═══════════════════════════ */
let notifOpen = false;
function toggleNotif() {
  const panel = document.getElementById('notifPanel');
  notifOpen = !notifOpen;
  panel.classList.toggle('open', notifOpen);
}
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  document.getElementById('notifDot').style.display = 'none';
  showToast('Semua notifikasi ditandai dibaca');
}
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifPanel');
  const btn   = document.querySelector('.notif-btn');
  if (notifOpen && !panel.contains(e.target) && !btn.contains(e.target)) {
    notifOpen = false;
    panel.classList.remove('open');
  }
});

/* ═══════════════════════════
   LOGOUT dengan Firebase (sama persis seperti asli)
═══════════════════════════ */
async function handleLogout() {
  MagnetDB.logout();
  try {
    const { signOut } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");
    const { auth } = await import("../Page_Login_Register/firebase-config.js");
    await signOut(auth);
    console.log("Firebase logout berhasil");
  } catch (err) {
    console.warn("Firebase logout error:", err);
  }
  window.location.href = '../Page_Login_Register/index.html';
}

/* ═══════════════════════════
   TOAST (sama persis seperti asli)
═══════════════════════════ */
let _toastTimer = null;
function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  if (_toastTimer) { clearTimeout(_toastTimer); t.classList.remove('show'); void t.offsetWidth; }
  t.textContent = msg;
  t.classList.add('show');
  _toastTimer = setTimeout(() => { t.classList.remove('show'); _toastTimer = null; }, dur);
}

function syncProfile() {
  const session = MagnetDB.getSession();
  if (session && session.id) {
    // Gunakan onAuthStateChanged agar sistem menunggu Firebase siap
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await syncProfileFromFirebase(user.uid);
      }
    });
  }
}

/* ═══════════════════════════
   GREETING (sama persis seperti asli)
═══════════════════════════ */
function getGreetingLabel() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Selamat pagi,';
  if (h >= 12 && h < 15) return 'Selamat siang,';
  if (h >= 15 && h < 18) return 'Selamat sore,';
  return 'Selamat malam,';
}
function setGreeting(name) {
  const el = document.getElementById('greetingLabel');
  const nm = document.getElementById('greetingName');
  if (el) el.textContent = getGreetingLabel();
  if (nm) nm.textContent = name;
  const user    = MagnetDB.getSession();
  const avatar  = user?.avatar || user?.profile?.avatar || null;
  const avBtn   = document.getElementById('headerAvatar');
  const avInit  = document.getElementById('avatarInitial');
  if (avBtn && avatar) {
    avBtn.style.backgroundImage    = `url('${avatar}')`;
    avBtn.style.backgroundSize     = 'cover';
    avBtn.style.backgroundPosition = 'center';
    if (avInit) avInit.style.display = 'none';
  } else {
    if (avBtn) { avBtn.style.backgroundImage = ''; }
    if (avInit) { avInit.style.display = ''; avInit.textContent = name.charAt(0).toUpperCase(); }
  }
}
function startGreetingClock() {
  const el = document.getElementById('greetingLabel');
  if (!el) return;
  setInterval(() => { el.textContent = getGreetingLabel(); }, 60 * 1000);
}

/* ═══════════════════════════
   AMBIL DATA LOWONGAN DARI FIREBASE (BARU)
═══════════════════════════ */
async function loadJobsFromFirebase() {
  try {
    // Import fungsi getAllJobs dari firebase-company.js (sesuaikan path)
    const { getAllJobs } = await import('../Page_Perusahaan/firebase-company.js');
    const firebaseJobs = await getAllJobs();
    // Mapping data dari Firebase ke format yang digunakan renderJobs
    jobs = firebaseJobs.map(job => ({
      id: job.id,
      title: job.title,
      companyName: job.companyName || job.company,
      companyShort: job.companyShort || (job.companyName ? job.companyName.charAt(0) : '?'),
      logoColor: job.logoColor || '#3B2A8E',
      type: job.type || 'Magang',
      location: job.location,
      salary: job.salary,
      tags: job.tags || [],
      category: job.category || 'umum',
      createdAt: job.createdAt,
      isNew: isNewJob(job.createdAt),
      postedAt: formatRelativeTime(job.createdAt),
    }));
    renderJobs(activeFilter);
    // Update badge "Baru untukmu"
    const newCount = jobs.filter(j => j.isNew).length;
    const newBadge = document.getElementById('newJobsCount');
    if (newBadge) {
      if (newCount > 0) {
        newBadge.textContent = newCount;
        newBadge.style.display = 'inline-flex';
      } else {
        newBadge.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Gagal memuat lowongan dari Firebase:', err);
    showToast('Gagal memuat lowongan. Periksa koneksi internet.');
  }
}

/* ═══════════════════════════
   GUEST MODE (sama persis seperti asli)
═══════════════════════════ */
function applyGuestMode() {
  const user = MagnetDB.getSession();
  if (user) return;
  const hideIds = ['nav-lamaran', 'nav-profil'];
  hideIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    headerActions.innerHTML = `
      <a href="../Page_Login_Register/index.html" class="guest-masuk-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Masuk
      </a>`;
  }
  const pageBody = document.querySelector('.page-body');
  if (pageBody) {
    const banner = document.createElement('div');
    banner.className = 'guest-banner';
    banner.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Kamu sedang menjelajah sebagai tamu. <a href="../Page_Login_Register/index.html">Masuk</a> atau <a href="../Page_Login_Register/register-mahasiswa.html">Daftar</a> untuk melamar lowongan.</span>`;
    pageBody.insertBefore(banner, pageBody.firstChild);
  }
}

// ========== EKSPOS FUNGSI KE GLOBAL ==========
// Letakkan ini di luar DOMContentLoaded, agar langsung tersedia
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.restoreSidebarState = restoreSidebarState;
window.setFilter = setFilter;
window.toggleSave = toggleSave;
window.applyJob = applyJob;
window.openJob = openJob;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.toggleNotif = toggleNotif;
window.markAllRead = markAllRead;
window.toggleSearch = toggleSearch;
window.triggerSearch = triggerSearch;

/* ═══════════════════════════
   INIT
═══════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    let session = MagnetDB.getSession();
    if (!session) {
        // Tunggu Firebase Auth dulu
        const user = await new Promise(resolve => {
            onAuthStateChanged(auth, resolve);
        });
        if (user) {
            // Sinkronisasi session lokal dari data Firebase
            const { syncProfileFromFirebase } = await import('../Page_Login_Register/auth-firebase.js');
            await syncProfileFromFirebase(user.uid);
            session = MagnetDB.getSession();
        }
        if (!session) {
            // Benar-benar tidak ada session, baru redirect
            MagnetDB.requireMahasiswaAuth();
            return;
        }
    }
  // Jika session ada, lanjutkan
  syncProfile();
  if (!window.GUEST_ALLOWED) {
    MagnetDB.requireMahasiswaAuth();
  }
  const user = MagnetDB.getSession();
  if (user) {
    setGreeting(user.name || 'Pengguna');
    startGreetingClock();
  }
  const profileName = document.getElementById('profileNavName');
  if (profileName) profileName.textContent = user?.name || 'Pengguna';
  
  const apps = MagnetDB.getUserApplications();
  const lamaranBadge = document.getElementById('nav-lamaran-badge');
  if (lamaranBadge) {
    if (apps.length > 0) {
      lamaranBadge.textContent = apps.length;
      lamaranBadge.style.display = 'inline-flex';
    } else {
      lamaranBadge.style.display = 'none';
    }
  }
  restoreSidebarState();
  if (document.getElementById('jobsList')) {
    // Muat lowongan dari Firebase
    loadJobsFromFirebase();
  }
});

// dashboard.js
// Ekspos fungsi ke global
window.restoreSidebarState = restoreSidebarState;
window.applyGuestMode = applyGuestMode;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.setFilter = setFilter;
window.toggleSave = toggleSave;
window.applyJob = applyJob;
window.openJob = openJob;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.toggleNotif = toggleNotif;
window.markAllRead = markAllRead;
window.toggleSearch = toggleSearch;
window.triggerSearch = triggerSearch;
window.MagnetDB = MagnetDB; // pastikan MagnetDB global