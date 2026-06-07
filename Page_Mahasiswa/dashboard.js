// dashboard.js - Mahasiswa, mengambil lowongan dari Firebase
import { getAllJobs } from '../Page_Perusahaan/firebase-company.js';

let jobs = [];
let savedJobs = new Set(JSON.parse(localStorage.getItem('mg_saved') || '[]'));
let activeFilter = 'all';

function persistSaved() {
  localStorage.setItem('mg_saved', JSON.stringify([...savedJobs]));
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

function renderJobs(filter = 'all') {
  const list = document.getElementById('jobsList');
  if (!list) return;

  let filtered = jobs;
  if (filter === 'new') filtered = jobs.filter(j => j.isNew);
  if (filter !== 'all' && filter !== 'new') filtered = jobs.filter(j => j.category === filter);

  if (!filtered.length) {
    list.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:40px 0">Belum ada lowongan yang tersedia.</p>';
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
          <button class="bookmark-btn ${savedJobs.has(job.id) ? 'saved' : ''}"
            onclick="toggleSave(event, '${job.id}')" title="Simpan">
            <svg viewBox="0 0 24 24" fill="${savedJobs.has(job.id) ? 'currentColor' : 'none'}"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          ${job.isNew ? '<span class="new-badge">Baru</span>' : ''}
        </div>
      </div>
      <div class="job-meta">
        <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${escapeHtml(job.type || 'Magang')}</span>
        <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(job.location)}</span>
      </div>
      <p class="job-salary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:4px"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>${escapeHtml(job.salary || 'Rp 0')}</p>
      <div class="job-tags">${(job.tags || []).map(t => `<span class="job-tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="job-card-footer"><span class="job-time">${formatRelativeTime(job.createdAt)}</span><button class="apply-btn" onclick="applyJob(event, '${job.id}')">Lamar</button></div>
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

function setFilter(el, filter) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeFilter = filter;
  renderJobs(filter);
}

function toggleSave(e, id) {
  e.stopPropagation();
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

function applyJob(e, id) {
  e.stopPropagation();
  window.location.href = 'detail-lowongan.html?id=' + id;
}

function openJob(id) {
  window.location.href = 'detail-lowongan.html?id=' + id;
}

async function loadJobs() {
  try {
    jobs = await getAllJobs();
    // Tambahkan properti isNew dan lainnya
    jobs = jobs.map(job => ({
      ...job,
      company: job.companyName || job.company,
      companyShort: job.companyShort || (job.companyName ? job.companyName.charAt(0) : '?'),
      isNew: isNewJob(job.createdAt),
    }));
    renderJobs(activeFilter);
    updateNewJobsBadge();
  } catch (err) {
    console.error('Gagal memuat lowongan:', err);
    showToast('Gagal memuat lowongan. Periksa koneksi.');
  }
}

function updateNewJobsBadge() {
  const newCount = jobs.filter(j => j.isNew).length;
  const badge = document.getElementById('newJobsCount');
  if (badge) {
    if (newCount > 0) {
      badge.textContent = newCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ========== GREETING & SIDEBAR (salin dari dashboard.js asli) ==========
function getGreetingLabel() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Selamat pagi,';
  if (h >= 12 && h < 15) return 'Selamat siang,';
  if (h >= 15 && h < 18) return 'Selamat sore,';
  return 'Selamat malam,';
}

function setGreeting(name) {
  const el = document.getElementById('greetingLabel');
  const nm = document.getElementById('greetingName');
  if (el) el.textContent = getGreetingLabel();
  if (nm) nm.textContent = name;
  const user = MagnetDB.getSession();
  const avatar = user?.avatar || user?.profile?.avatar || null;
  const avBtn = document.getElementById('headerAvatar');
  const avInit = document.getElementById('avatarInitial');
  if (avBtn && avatar) {
    avBtn.style.backgroundImage = `url('${avatar}')`;
    avBtn.style.backgroundSize = 'cover';
    avBtn.style.backgroundPosition = 'center';
    if (avInit) avInit.style.display = 'none';
  } else {
    if (avBtn) avBtn.style.backgroundImage = '';
    if (avInit) { avInit.style.display = ''; avInit.textContent = name.charAt(0).toUpperCase(); }
  }
}

function startGreetingClock() {
  const el = document.getElementById('greetingLabel');
  if (!el) return;
  setInterval(() => { el.textContent = getGreetingLabel(); }, 60 * 1000);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('visible');
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

let _toastTimer = null;
function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  if (_toastTimer) { clearTimeout(_toastTimer); t.classList.remove('show'); void t.offsetWidth; }
  t.textContent = msg;
  t.classList.add('show');
  _toastTimer = setTimeout(() => { t.classList.remove('show'); _toastTimer = null; }, dur);
}

async function handleLogout() {
  MagnetDB.logout();
  const { signOut } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");
  const { auth } = await import("../Page_Login_Register/firebase-config.js");
  await signOut(auth);
  window.location.href = '../Page_Login_Register/index.html';
}

function applyGuestMode() {
  const user = MagnetDB.getSession();
  if (user) return;
  // Sembunyikan beberapa elemen, tambah banner (opsional)
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    headerActions.innerHTML = `<a href="../Page_Login_Register/index.html" class="guest-masuk-btn">Masuk</a>`;
  }
  const pageBody = document.querySelector('.page-body');
  if (pageBody && !document.querySelector('.guest-banner')) {
    const banner = document.createElement('div');
    banner.className = 'guest-banner';
    banner.innerHTML = `<span>Kamu sedang menjelajah sebagai tamu. <a href="../Page_Login_Register/index.html">Masuk</a> untuk melamar.</span>`;
    pageBody.insertBefore(banner, pageBody.firstChild);
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
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
  loadJobs(); // Muat lowongan dari Firebase
});

// Ekspos fungsi ke global (untuk onclick di HTML)
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.setFilter = setFilter;
window.toggleSave = toggleSave;
window.applyJob = applyJob;
window.openJob = openJob;
window.handleLogout = handleLogout;
window.showToast = showToast;