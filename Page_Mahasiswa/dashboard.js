/* ═══════════════════════════════════════════════════════════
   MAGNET – DASHBOARD.JS
════════════════════════════════════════════════════════════ */

/* ── Sample job data ── */
const JOBS = [
  {
    id: 1,
    title: 'Jr Quality Assurance (Automation)',
    company: 'PT Adi Data Informatika',
    companyShort: 'AD',
    logo: null,
    logoColor: '#E53935',
    type: 'Full time',
    location: 'Jakarta',
    salary: 'Rp 5.000.000 – Rp 6.500.000 / bulan',
    tags: ['Placed in BUMN Institution', 'Career development', 'Competitive salary'],
    postedAt: '1 hari lalu',
    isNew: true,
    category: 'it',
  },
  {
    id: 2,
    title: 'QA or Tester (Onsite at Yogya)',
    company: 'PT. Amalura Multisarana',
    companyShort: 'AM',
    logo: null,
    logoColor: '#1565C0',
    type: 'Full time',
    location: 'Yogyakarta',
    salary: 'Rp 4.000.000 – Rp 5.500.000 / bulan',
    tags: ['Remote friendly', 'Training provided'],
    postedAt: '2 hari lalu',
    isNew: true,
    category: 'it',
  },
  {
    id: 3,
    title: 'UI/UX Designer Intern',
    company: 'Tokopedia',
    companyShort: 'TK',
    logo: null,
    logoColor: '#4CAF50',
    type: 'Part time',
    location: 'Jakarta',
    salary: 'Rp 2.500.000 – Rp 3.500.000 / bulan',
    tags: ['Figma', 'Design System', 'Hybrid'],
    postedAt: '3 hari lalu',
    isNew: false,
    category: 'desain',
  },
  {
    id: 4,
    title: 'Business Analyst Intern',
    company: 'Gojek',
    companyShort: 'GJ',
    logo: null,
    logoColor: '#00BCD4',
    type: 'Part time',
    location: 'Jakarta (Remote)',
    salary: 'Rp 2.000.000 – Rp 3.000.000 / bulan',
    tags: ['Excel', 'PowerBI', 'Presentasi'],
    postedAt: '4 hari lalu',
    isNew: false,
    category: 'bisnis',
  },
  {
    id: 5,
    title: 'Frontend Developer (React)',
    company: 'Bukalapak',
    companyShort: 'BL',
    logo: null,
    logoColor: '#FF5722',
    type: 'Part time',
    location: 'Bandung',
    salary: 'Rp 3.000.000 – Rp 4.500.000 / bulan',
    tags: ['React', 'TypeScript', 'Remote OK'],
    postedAt: '5 hari lalu',
    isNew: false,
    category: 'it',
  },
];

let savedJobs = new Set(JSON.parse(localStorage.getItem('mg_saved') || '[]'));
let activeFilter = 'all';

function persistSaved() {
  localStorage.setItem('mg_saved', JSON.stringify([...savedJobs]));
}

/* ── Render job cards ── */
function renderJobs(filter = 'all') {
  const list = document.getElementById('jobsList');
  if (!list) return;

  let filtered = JOBS;
  if (filter === 'new')    filtered = JOBS.filter(j => j.isNew);
  if (filter !== 'all' && filter !== 'new') filtered = JOBS.filter(j => j.category === filter);

  list.innerHTML = filtered.map((job, i) => `
    <div class="job-card" style="animation-delay:${i * 0.06}s" onclick="openJob(${job.id})">
      <div class="job-card-top">
        <div class="company-logo" style="background:${job.logoColor}18; color:${job.logoColor}; border-color:${job.logoColor}22;">
          ${job.companyShort}
        </div>
        <div class="job-main">
          <p class="job-title">${job.title}</p>
          <p class="job-company">${job.company}</p>
        </div>
        <div class="job-card-actions">
          <button class="bookmark-btn ${savedJobs.has(job.id) ? 'saved' : ''}"
            onclick="toggleSave(event, ${job.id})" title="Simpan">
            <svg viewBox="0 0 24 24" fill="${savedJobs.has(job.id) ? 'currentColor' : 'none'}"
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
          ${job.type}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${job.location}
        </span>
      </div>

      <p class="job-salary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:4px"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        ${job.salary}
      </p>

      <div class="job-tags">
        ${job.tags.map(t => `<span class="job-tag">${t}</span>`).join('')}
      </div>

      <div class="job-card-footer">
        <span class="job-time">${job.postedAt}</span>
        <button class="apply-btn" onclick="applyJob(event, ${job.id})">Lamar</button>
      </div>
    </div>
  `).join('');
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
   SIDEBAR TOGGLE
═══════════════════════════ */

/** Desktop: collapse/expand. Mobile: slide in/out. */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  const isMobile = window.innerWidth <= 900;

  if (isMobile) {
    // Mobile: slide in / out
    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
    } else {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('visible');
    }
  } else {
    // Desktop: collapse / expand — toggle both sidebar class & body class
    const isCollapsed = sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    // Persist state across pages
    localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

/* Restore sidebar collapsed state on load */
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

/* Close sidebar on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});


/* ═══════════════════════════
   SEARCH
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

// Live search filter
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      if (!q) { renderJobs(activeFilter); return; }

      const filtered = JOBS.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q))
      );

      const list = document.getElementById('jobsList');
      if (!list) return;
      list.innerHTML = filtered.length
        ? filtered.map((job, i) => `
            <div class="job-card" style="animation-delay:${i * 0.05}s" onclick="openJob(${job.id})">
              <div class="job-card-top">
                <div class="company-logo" style="background:${job.logoColor}18; color:${job.logoColor};">
                  ${job.companyShort}
                </div>
                <div class="job-main">
                  <p class="job-title">${job.title}</p>
                  <p class="job-company">${job.company}</p>
                </div>
                <div class="job-card-actions">
                  ${job.isNew ? `<span class="new-badge">Baru</span>` : ''}
                </div>
              </div>
              <div class="job-meta">
                <span class="meta-item">${job.type}</span>
                <span class="meta-item">${job.location}</span>
              </div>
              <p class="job-salary">${job.salary}</p>
              <div class="job-card-footer">
                <span class="job-time">${job.postedAt}</span>
                <button class="apply-btn" onclick="applyJob(event, ${job.id})">Lamar</button>
              </div>
            </div>
          `).join('')
        : `<p style="color:var(--text-light);font-size:0.9rem;text-align:center;padding:32px 0;">Tidak ada lowongan ditemukan untuk "<strong>${q}</strong>"</p>`;
    });
  }
});


/* ═══════════════════════════
   NOTIFICATION PANEL
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

// Close notif when clicking outside
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifPanel');
  const btn   = document.querySelector('.notif-btn');
  if (notifOpen && !panel.contains(e.target) && !btn.contains(e.target)) {
    notifOpen = false;
    panel.classList.remove('open');
  }
});


/* ═══════════════════════════
   LOGOUT
═══════════════════════════ */
function handleLogout() {
  MagnetDB.logout();
  window.location.href = '../Page_Login_Register/index.html';
}


/* ═══════════════════════════
   TOAST
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


/* ═══════════════════════════
   GREETING
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

  // Update avatar — show photo if saved, else show initial
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

/* Update greeting label tiap menit supaya real-time */
function startGreetingClock() {
  const el = document.getElementById('greetingLabel');
  if (!el) return;
  setInterval(() => {
    el.textContent = getGreetingLabel();
  }, 60 * 1000);
}


/* ═══════════════════════════
   INIT
═══════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Halaman dengan window.GUEST_ALLOWED = true boleh diakses tanpa login
  if (!window.GUEST_ALLOWED) {
    MagnetDB.requireMahasiswaAuth();
  }

  const user = MagnetDB.getSession();
  if (user) {
    setGreeting(user.name || 'Pengguna');
    startGreetingClock();
  }

  // --- Username di header ---
    const profileName = document.getElementById('profileNavName');
    if (profileName) {
      profileName.textContent = user?.name || 'Pengguna';
    }

  // ── Badge: Status Lamaran (hitung dari localStorage) ──
  const apps       = MagnetDB.getUserApplications();
  const lamaranBadge = document.getElementById('nav-lamaran-badge');
  if (lamaranBadge) {
    if (apps.length > 0) {
      lamaranBadge.textContent   = apps.length;
      lamaranBadge.style.display = 'inline-flex';
    } else {
      lamaranBadge.style.display = 'none';
    }
  }

  // ── Badge: "Baru untukmu" (hitung job dengan isNew: true) ──
  const newCount = typeof JOBS !== 'undefined'
    ? JOBS.filter(j => j.isNew).length
    : 0;
  const newBadge = document.getElementById('newJobsCount');
  if (newBadge) {
    if (newCount > 0) {
      newBadge.textContent   = newCount;
      newBadge.style.display = 'inline-flex';
    } else {
      newBadge.style.display = 'none';
    }
  }

  // Restore sidebar collapsed state (desktop)
  restoreSidebarState();

  // Only render job cards on dashboard page
  if (document.getElementById('jobsList')) {
    renderJobs();
  }
});


/* ═══════════════════════════
   GUEST MODE
═══════════════════════════ */
/**
 * Dipanggil di halaman yang bisa diakses tanpa login.
 * Menyembunyikan elemen yang butuh auth, menampilkan banner guest.
 */
function applyGuestMode() {
  const user = MagnetDB.getSession();
  if (user) return; // sudah login, tidak perlu guest mode

  // Sembunyikan sidebar items yang butuh auth
  const hideIds = ['nav-lamaran', 'nav-profil'];
  hideIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Ganti avatar/header action → tombol Masuk
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    headerActions.innerHTML = `
      <a href="../Page_Login_Register/index.html" class="guest-masuk-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Masuk
      </a>`;
  }

  // Tambahkan guest banner di bawah top-header
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