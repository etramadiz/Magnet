/* detail-lowongan.js */

let currentJob  = null;
let savedSet    = new Set(JSON.parse(localStorage.getItem('mg_saved') || '[]'));
let appliedSet  = new Set(JSON.parse(localStorage.getItem('mg_applied') || '[]'));

function persistSaved()   { localStorage.setItem('mg_saved',   JSON.stringify([...savedSet])); }
function persistApplied() { localStorage.setItem('mg_applied', JSON.stringify([...appliedSet])); }

/* ── Bookmark toggle ── */
function toggleBookmark() {
  if (!currentJob) return;
  const id = currentJob.id;
  if (savedSet.has(id)) { savedSet.delete(id); showToast('Lowongan dihapus dari simpanan'); }
  else                  { savedSet.add(id);    showToast('Lowongan disimpan ✓'); }
  persistSaved();
  updateBookmarkBtn();
}

function updateBookmarkBtn() {
  const btn = document.getElementById('dlBookmarkBtn');
  if (!btn || !currentJob) return;
  const saved = savedSet.has(currentJob.id);
  btn.classList.toggle('saved', saved);
  btn.querySelector('svg').setAttribute('fill', saved ? 'currentColor' : 'none');
  btn.title = saved ? 'Hapus simpanan' : 'Simpan lowongan';
}

/* ── Apply → redirect ke halaman lamar ── */
function lamarSekarang() {
  if (!currentJob) return;

  // Guest belum login → arahkan ke halaman login
  if (!MagnetDB.getSession()) {
    showToast('Masuk terlebih dahulu untuk melamar lowongan');
    setTimeout(() => window.location.href = '../../../Page Login Register/index.html', 1500);
    return;
  }

  if (MagnetDB.hasApplied(currentJob.id)) {
    showToast('Kamu sudah melamar lowongan ini');
    setTimeout(() => window.location.href = 'lamaran.html', 1200);
    return;
  }

  window.location.href = 'lamar.html?id=' + currentJob.id;
}

/* ── Share ── */
function shareJob() {
  if (!currentJob) return;
  const text = `${currentJob.title} di ${currentJob.company} — lihat di Magnet`;
  if (navigator.share) {
    navigator.share({ title: currentJob.title, text, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => showToast('Link disalin ✓'))
      .catch(() => showToast('Salin URL dari address bar'));
  }
}

/* ── Render detail ── */
function renderDetail(job) {
  currentJob = job;

  // Top bar title
  const topTitle = document.getElementById('dlTopTitle');
  if (topTitle) topTitle.textContent = job.title;

  // CTA bar
  const ctaBar  = document.getElementById('dlCtaBar');
  const deadline = document.getElementById('dlDeadline');
  if (ctaBar)  ctaBar.style.display = 'flex';
  if (deadline) deadline.textContent = job.deadline;

  // Applied state from DB
  const lamarBtn = document.getElementById('lamarBtn');
  if (lamarBtn) {
    if (!MagnetDB.getSession()) {
      // Guest — show login prompt
      lamarBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:17px;height:17px"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Masuk untuk Melamar`;
    } else if (MagnetDB.hasApplied(job.id)) {
      lamarBtn.classList.add('applied');
      lamarBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:17px;height:17px"><polyline points="20 6 9 17 4 12"/></svg> Sudah Dilamar`;
      lamarBtn.disabled = true;
    }
  }

  const isSaved = savedSet.has(job.id);

  const scroll = document.getElementById('dlScroll');
  if (!scroll) return;

  scroll.innerHTML = `
    <!-- HERO -->
    <div class="dl-hero">
      <div class="dl-company-logo" style="background:${job.logoColor}30;border-color:${job.logoColor}40;color:${job.logoColor}">
        ${job.companyShort}
      </div>
      <div class="dl-hero-info">
        <h1 class="dl-hero-title">${job.title}</h1>
        <p class="dl-hero-company" onclick="openCompany('${job.companyId}')" style="cursor:pointer;text-decoration:underline;text-underline-offset:2px" title="Lihat profil perusahaan">${job.company} ↗</p>
        <span class="dl-hero-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          ${job.department}
        </span>
      </div>
      <button class="dl-bookmark-hero ${isSaved ? 'saved' : ''}" id="dlBookmarkBtn" onclick="toggleBookmark()" title="${isSaved ? 'Hapus simpanan' : 'Simpan'}">
        <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>

    <!-- QUICK INFO -->
    <div class="dl-quick-info">
      <div class="dl-info-pill">
        <div class="dl-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <div><span class="dl-pill-label">Lokasi</span><span class="dl-pill-value">${job.location}</span></div>
      </div>
      <div class="dl-info-pill">
        <div class="dl-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div><span class="dl-pill-label">Durasi</span><span class="dl-pill-value">${job.durasiLabel}</span></div>
      </div>
      <div class="dl-info-pill">
        <div class="dl-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div><span class="dl-pill-label">Batas Daftar</span><span class="dl-pill-value">${job.deadline}</span></div>
      </div>
      <div class="dl-info-pill">
        <div class="dl-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
        <div><span class="dl-pill-label">Mode Kerja</span><span class="dl-pill-value" style="text-transform:capitalize">${job.remoteKey}</span></div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="dl-content">

      <!-- SALARY -->
      <div class="dl-salary-box">
        <div>
          <p class="dl-salary-label">Gaji / Uang Saku</p>
          <p class="dl-salary-value">${job.salary}</p>
        </div>
        <div class="dl-quota">
          <p class="dl-quota-label">Kuota</p>
          <p class="dl-quota-value">${job.quota} orang</p>
        </div>
      </div>

      <!-- DESKRIPSI -->
      <div class="dl-section">
        <h3 class="dl-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Deskripsi Pekerjaan
        </h3>
        <p class="dl-description">${job.description}</p>
      </div>

      <!-- PERSYARATAN -->
      <div class="dl-section">
        <h3 class="dl-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Persyaratan
        </h3>
        <ul class="dl-req-list">
          ${job.requirements.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <!-- SKILL DIBUTUHKAN -->
      <div class="dl-section">
        <h3 class="dl-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Skill yang Dibutuhkan
        </h3>
        <div class="dl-skills">
          ${job.skills.map(s => `<span class="dl-skill-tag">${s}</span>`).join('')}
        </div>
      </div>

      <!-- BENEFIT -->
      <div class="dl-section">
        <h3 class="dl-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Benefit & Fasilitas
        </h3>
        <div class="dl-benefits">
          ${job.benefits.map(b => `
            <div class="dl-benefit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              ${b}
            </div>`).join('')}
        </div>
      </div>

      <p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:8px 0">
        Diposting ${job.postedAt} · ${job.quota} posisi tersedia
      </p>

    </div><!-- /dl-content -->
  `;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Guest diizinkan melihat detail lowongan tanpa login
  restoreSidebarState();
  applyGuestMode();

  const user = MagnetDB.getSession();
  if (user) { const av = document.getElementById('avatarInitial'); if (av) av.textContent = user.name.charAt(0).toUpperCase(); }

  const id  = parseInt(new URLSearchParams(window.location.search).get('id'));
  const job = MAGNET_JOBS.find(j => j.id === id);

  if (!job) {
    document.getElementById('dlScroll').innerHTML = `
      <div style="text-align:center;padding:64px 24px;color:var(--text-light)">
        <p style="font-size:1rem;font-weight:700;margin-bottom:8px">Lowongan tidak ditemukan</p>
        <p style="font-size:0.85rem">Lowongan ini mungkin sudah tidak tersedia.</p>
        <a href="lowongan.html" style="display:inline-block;margin-top:16px;color:var(--blue-primary);font-weight:600;text-decoration:none">← Kembali cari lowongan</a>
      </div>`;
    return;
  }

  renderDetail(job);
});

/* ── Open company profile ── */
function openCompany(companyId) {
  if (!companyId) return;
  window.location.href = 'perusahaan.html?id=' + companyId;
}