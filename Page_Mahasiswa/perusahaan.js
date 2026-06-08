/* perusahaan.js - Mengambil data dari Firebase */
import { getCompanyProfile, getJobsByCompany } from '../Page_Perusahaan/firebase-company.js';

let activePrTab = 'tentang';
let currentCompanyId = null;
let currentCompanyData = null;

function setPrTab(el) {
  document.querySelectorAll('.pr-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activePrTab = el.dataset.tab;
  document.getElementById('prTabTentang').style.display = activePrTab === 'tentang' ? '' : 'none';
  document.getElementById('prTabLowongan').style.display = activePrTab === 'lowongan' ? 'flex' : 'none';
  document.getElementById('prTabReviews').style.display = activePrTab === 'reviews' ? '' : 'none';
}

function starsHTML(rating, size = 16) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const star = (fill) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="fill:${fill};flex-shrink:0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  let html = '';
  for (let i = 0; i < full; i++) html += star('#FBBF24');
  if (half) html += star('#FBBF24');
  for (let i = 0; i < empty; i++) html += star('#E5E7EB');
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
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

async function renderCompany(companyId, companyData) {
  currentCompanyId = companyId;
  currentCompanyData = companyData;

  // Hero section
  const companyName = companyData.nama || companyData.name || 'Perusahaan';
  const logoColor = '#3B2A8E'; // default, bisa pakai warna dari data jika ada
  const companyShort = companyName.charAt(0).toUpperCase();

  const logoEl = document.getElementById('prLogo');
  if (logoEl) {
    logoEl.textContent = companyShort;
    logoEl.style.cssText = `color:${logoColor};background:${logoColor}22;border-color:${logoColor}44;font-size:1rem;font-family:var(--font-display);font-weight:800;width:64px;height:64px;border-radius:14px;display:flex;align-items:center;justify-content:center;border:2px solid;flex-shrink:0`;
  }
  document.getElementById('prName').textContent = companyName;
  document.getElementById('prHeroBg').style.background = `linear-gradient(135deg,${logoColor}DD 0%,${logoColor}99 100%)`;

  // Ambil review dari localStorage? Bisa gunakan fungsi dari db.js
  const allReviews = MagnetDB.getCompanyReviews(companyId);
  const totalCount = allReviews.length;
  const avgRating = totalCount ? (allReviews.reduce((s, r) => s + r.rating, 0) / totalCount).toFixed(1) : '—';

  const hasApplied = MagnetDB.hasAppliedToCompany(companyName);
  const userReview = MagnetDB.getUserReview(companyId);

  document.getElementById('prRating').innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" style="fill:#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    <span class="pr-rating-num">${avgRating}</span>
    <span class="pr-review-count">(${totalCount} ulasan)</span>
    ${hasApplied ? `<a href="review.html?id=${companyId}" class="pr-write-review-btn">${userReview ? '✏️ Edit Review' : '✍️ Tulis Review'}</a>` : ''}
  `;

  // Info grid
  const infoGrid = document.getElementById('prInfoGrid');
  if (infoGrid) {
    infoGrid.innerHTML = `
      <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
        <div><p class="pr-info-label">Industri</p><p class="pr-info-value">${escapeHtml(companyData.industri || '-')}</p></div></div>
      <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div><p class="pr-info-label">Ukuran</p><p class="pr-info-value">${escapeHtml(companyData.ukuran || '-')}</p></div></div>
      <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <div><p class="pr-info-label">Lokasi</p><p class="pr-info-value">${escapeHtml(companyData.lokasi || '-')}</p></div></div>
      <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
        <div><p class="pr-info-label">Website</p>${companyData.website ? `<a href="https://${companyData.website}" target="_blank" class="pr-info-link">${escapeHtml(companyData.website)}</a>` : '<span class="pr-info-value">-</span>'}</div></div>
      <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div><p class="pr-info-label">Berdiri</p><p class="pr-info-value">${escapeHtml(companyData.tahun ? 'Sejak ' + companyData.tahun : '-')}</p></div></div>
      <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
        <div><p class="pr-info-label">Alamat</p><p class="pr-info-value" style="font-size:0.78rem">${escapeHtml(companyData.alamat || '-')}</p></div></div>
    `;
  }

  // Deskripsi, budaya, benefit
  document.getElementById('prDesc')?.textContent = companyData.deskripsi || 'Deskripsi belum tersedia.';
  document.getElementById('prCulture')?.textContent = companyData.budaya || 'Informasi budaya belum tersedia.';
  const benefits = companyData.benefit ? companyData.benefit.split('\n').filter(b => b.trim()) : [];
  document.getElementById('prBenefits').innerHTML = benefits.length ? benefits.map(b => `<span class="pr-benefit-tag">${escapeHtml(b)}</span>`).join('') : '<span class="pr-benefit-tag">Belum ada informasi</span>';

  // Lowongan perusahaan
  const jobs = await getJobsByCompany(companyId);
  const jobCount = jobs.length;
  document.getElementById('prJobCount').textContent = jobCount;
  document.getElementById('prReviewCount').textContent = totalCount;

  const jobsList = document.getElementById('prJobsList');
  if (jobsList) {
    if (jobCount) {
      jobsList.innerHTML = jobs.map((job, i) => `
        <div class="job-card" style="animation-delay:${i * 0.06}s;cursor:pointer" onclick="window.location.href='detail-lowongan.html?id=${job.id}'">
          <div class="job-card-top">
            <div class="company-logo" style="background:${job.logoColor || '#3B2A8E'}18;color:${job.logoColor || '#3B2A8E'};border-color:${job.logoColor || '#3B2A8E'}22">${job.companyShort || (job.companyName ? job.companyName.charAt(0) : '?')}</div>
            <div class="job-main"><p class="job-title">${escapeHtml(job.title)}</p><p class="job-company">${escapeHtml(job.department || job.type || 'Magang')}</p></div>
            <div class="job-card-actions">${job.isNew ? '<span class="new-badge">Baru</span>' : ''}</div>
          </div>
          <div class="job-meta">
            <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${escapeHtml(job.durasiLabel || job.duration || `${job.durasi || 3} Bulan`)}</span>
            <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(job.location || '-')}</span>
            <span class="meta-item" style="text-transform:capitalize">${escapeHtml(job.remoteKey || job.workMode || 'Onsite')}</span>
          </div>
          <p class="job-salary">${escapeHtml(job.salary || `Rp ${job.salaryMin || 0} – ${job.salaryMax || 0}`)}</p>
          <div class="job-card-footer">
            <span class="job-time">Tutup ${escapeHtml(job.deadline || 'Tidak ditentukan')}</span>
            <button class="apply-btn" onclick="event.stopPropagation();window.location.href='detail-lowongan.html?id=${job.id}'">Lihat Detail</button>
          </div>
        </div>`).join('');
    } else {
      jobsList.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:32px;font-size:0.88rem">Belum ada lowongan aktif.</p>';
    }
  }

  // Reviews tab (menggunakan data dari db.js)
  renderReviews(allReviews, companyName, hasApplied, userReview, companyId);
}

function renderReviews(allReviews, companyName, hasApplied, userReview, companyId) {
  const wrap = document.getElementById('prTabReviews');
  if (!wrap) return;

  const avg = allReviews.length ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1) : '—';
  const dist = [5, 4, 3, 2, 1].map(star => ({ star, count: allReviews.filter(r => r.rating === star).length }));

  wrap.innerHTML = `
    <div class="pr-reviews-summary">
      <div class="pr-reviews-big-rating">
        <span class="pr-reviews-avg">${avg}</span>
        <div class="pr-reviews-stars">${starsHTML(parseFloat(avg))}</div>
        <span class="pr-reviews-total">${allReviews.length} ulasan</span>
      </div>
      <div class="pr-reviews-bars">
        ${dist.map(d => `<div class="pr-rating-bar-row">
          <span class="pr-rating-bar-label">${d.star} ★</span>
          <div class="pr-rating-bar-track"><div class="pr-rating-bar-fill" style="width:${allReviews.length ? Math.round(d.count / allReviews.length * 100) : 0}%"></div></div>
          <span class="pr-rating-bar-count">${d.count}</span>
        </div>`).join('')}
      </div>
    </div>
    ${hasApplied ? `<div class="pr-review-cta">
      ${userReview ? `<p>Kamu sudah menulis review. <a href="review.html?id=${companyId}" class="pr-review-cta-link">Edit review kamu →</a></p>` : `<p>Sudah pernah magang di sini?</p><a href="review.html?id=${companyId}" class="pr-write-review-btn" style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;background:var(--blue-primary);border-color:var(--blue-primary);color:#fff">✍️ Tulis Review</a>`}
    </div>` : ''}
    <div class="pr-review-list">
      ${allReviews.length ? allReviews.map(r => `<div class="pr-review-item ${r.userId && r.userId === MagnetDB.getSession()?.id ? 'pr-review-mine' : ''}">
        <div class="pr-review-header">
          <div class="pr-reviewer-avatar">${r.userInitial || '?'}</div>
          <div class="pr-reviewer-info"><p class="pr-reviewer-name">${escapeHtml(r.userName || 'Anonim')} ${r.userId === MagnetDB.getSession()?.id ? '<span class="pr-review-you">Kamu</span>' : ''}</p><p class="pr-reviewer-role">${escapeHtml(r.role || 'Intern')}</p></div>
          <div class="pr-review-rating">${starsHTML(r.rating, 14)}</div>
        </div>
        ${r.title ? `<p class="pr-review-title">"${escapeHtml(r.title)}"</p>` : ''}
        <p class="pr-review-text">${escapeHtml(r.reviewText)}</p>
        ${r.pros ? `<div class="pr-review-proscon pr-review-pro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHtml(r.pros)}</div>` : ''}
        ${r.cons ? `<div class="pr-review-proscon pr-review-con"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ${escapeHtml(r.cons)}</div>` : ''}
        <p class="pr-review-date">${new Date(r.createdAt || r.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>`).join('') : `<div style="text-align:center;padding:32px;color:var(--text-light);font-size:0.88rem">Belum ada review untuk perusahaan ini.<br>${hasApplied ? `<a href="review.html?id=${companyId}" style="color:var(--blue-primary);font-weight:600">Jadilah yang pertama menulis review →</a>` : ''}</div>`}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  MagnetDB.requireMahasiswaAuth();
  restoreSidebarState();

  const user = MagnetDB.getSession();
  if (user) {
    const av = document.getElementById('avatarInitial');
    if (av) av.textContent = user.name.charAt(0).toUpperCase();
  }

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    document.querySelector('.page-body').innerHTML = `<div style="text-align:center;padding:64px;color:var(--text-light)"><p>ID perusahaan tidak ditemukan.</p><a href="lowongan.html" style="color:var(--blue-primary);font-weight:600">← Kembali</a></div>`;
    return;
  }

  try {
    const companyData = await getCompanyProfile(id);
    if (!companyData || Object.keys(companyData).length === 0) {
      document.querySelector('.page-body').innerHTML = `<div style="text-align:center;padding:64px;color:var(--text-light)"><p>Perusahaan tidak ditemukan.</p><a href="lowongan.html" style="color:var(--blue-primary);font-weight:600">← Kembali</a></div>`;
      return;
    }
    document.title = `Magnet – ${companyData.nama || 'Perusahaan'}`;
    document.querySelector('.header-brand-name').textContent = companyData.nama || 'Profil Perusahaan';
    await renderCompany(id, companyData);
  } catch (err) {
    console.error('Gagal memuat profil perusahaan:', err);
    document.querySelector('.page-body').innerHTML = `<div style="text-align:center;padding:64px;color:var(--text-light)"><p>Gagal memuat data perusahaan. Periksa koneksi.</p><a href="lowongan.html" style="color:var(--blue-primary);font-weight:600">← Kembali</a></div>`;
  }
});

window.setPrTab = setPrTab;