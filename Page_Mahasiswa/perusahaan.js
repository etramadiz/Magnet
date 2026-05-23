/* ═══════════════════════════════════════════════════════════
   MAGNET – PERUSAHAAN.JS
════════════════════════════════════════════════════════════ */

let activePrTab = 'tentang';
let currentCo   = null;

function setPrTab(el) {
  document.querySelectorAll('.pr-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activePrTab = el.dataset.tab;
  document.getElementById('prTabTentang').style.display  = activePrTab==='tentang'  ? '' : 'none';
  document.getElementById('prTabLowongan').style.display = activePrTab==='lowongan' ? 'flex' : 'none';
  document.getElementById('prTabReviews').style.display  = activePrTab==='reviews'  ? '' : 'none';
}

/* ── Stars ── */
function starsHTML(rating, size=16) {
  const full=Math.floor(rating), half=rating%1>=0.5?1:0, empty=5-full-half;
  const star = (fill) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="fill:${fill};flex-shrink:0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  let h='';
  for(let i=0;i<full;i++)  h+=star('#FBBF24');
  if(half)                  h+=star('url(#hg)');
  for(let i=0;i<empty;i++) h+=star('#E5E7EB');
  return h;
}

/* ── Render company ── */
function renderCompany(co, hasApplied, userReview) {
  currentCo = co;

  // Hero
  document.getElementById('prLogo').textContent = co.short;
  document.getElementById('prLogo').style.cssText = `color:${co.color};background:${co.color}22;border-color:${co.color}44;font-size:1rem;font-family:var(--font-display);font-weight:800;width:64px;height:64px;border-radius:14px;display:flex;align-items:center;justify-content:center;border:2px solid;flex-shrink:0`;
  document.getElementById('prName').textContent = co.name;
  document.getElementById('prHeroBg').style.background = `linear-gradient(135deg,${co.color}DD 0%,${co.color}99 100%)`;

  // Get all reviews (sample + user-submitted)
  const userReviews = MagnetDB.getCompanyReviews(co.id);
  const sampleRevs  = (SAMPLE_REVIEWS||[]).filter(r=>r.companyId===co.id);
  const allReviews  = [...userReviews, ...sampleRevs];

  const avgRating = allReviews.length
    ? (allReviews.reduce((s,r)=>s+r.rating,0)/allReviews.length).toFixed(1)
    : '—';
  const totalCount = allReviews.length;

  document.getElementById('prRating').innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" style="fill:#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    <span class="pr-rating-num">${avgRating}</span>
    <span class="pr-review-count">(${totalCount} ulasan)</span>
    ${hasApplied ? `<a href="review.html?id=${co.id}" class="pr-write-review-btn">${userReview?'✏️ Edit Review':'✍️ Tulis Review'}</a>` : ''}
  `;

  // Info grid
  document.getElementById('prInfoGrid').innerHTML = `
    <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
      <div><p class="pr-info-label">Industri</p><p class="pr-info-value">${co.industry}</p></div></div>
    <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div><p class="pr-info-label">Ukuran</p><p class="pr-info-value">${co.size}</p></div></div>
    <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
      <div><p class="pr-info-label">Lokasi</p><p class="pr-info-value">${co.location}</p></div></div>
    <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
      <div><p class="pr-info-label">Website</p><a href="https://${co.website}" target="_blank" class="pr-info-link">${co.website}</a></div></div>
    <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div><p class="pr-info-label">Berdiri</p><p class="pr-info-value">Sejak ${co.founded}</p></div></div>
    <div class="pr-info-item"><div class="pr-info-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
      <div><p class="pr-info-label">Alamat</p><p class="pr-info-value" style="font-size:0.78rem">${co.address}</p></div></div>
  `;

  document.getElementById('prDesc').textContent    = co.description;
  document.getElementById('prCulture').textContent = co.culture;
  document.getElementById('prBenefits').innerHTML  = (co.benefits||[]).map(b=>`<span class="pr-benefit-tag">${b}</span>`).join('');

  // Jobs count
  const jobs = MAGNET_JOBS.filter(j=>j.company===co.name);
  document.getElementById('prJobCount').textContent = jobs.length;
  document.getElementById('prReviewCount').textContent = totalCount;

  // Jobs tab
  const jobsList = document.getElementById('prJobsList');
  jobsList.innerHTML = jobs.length
    ? jobs.map((job,i)=>`
        <div class="job-card" style="animation-delay:${i*0.06}s;cursor:pointer" onclick="window.location.href='detail-lowongan.html?id=${job.id}'">
          <div class="job-card-top">
            <div class="company-logo" style="background:${job.logoColor}18;color:${job.logoColor};border-color:${job.logoColor}22">${job.companyShort}</div>
            <div class="job-main"><p class="job-title">${job.title}</p><p class="job-company">${job.department||job.type}</p></div>
            <div class="job-card-actions">${job.isNew?'<span class="new-badge">Baru</span>':''}</div>
          </div>
          <div class="job-meta">
            <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${job.durasiLabel||job.durasi}</span>
            <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${job.location}</span>
            <span class="meta-item" style="text-transform:capitalize">${job.remoteKey}</span>
          </div>
          <p class="job-salary">${job.salary}</p>
          <div class="job-card-footer">
            <span class="job-time">Tutup ${job.deadline}</span>
            <button class="apply-btn" onclick="event.stopPropagation();window.location.href='detail-lowongan.html?id=${job.id}'">Lihat Detail</button>
          </div>
        </div>`).join('')
    : `<p style="text-align:center;color:var(--text-light);padding:32px;font-size:0.88rem">Belum ada lowongan aktif.</p>`;

  // Reviews tab
  renderReviews(allReviews, co, hasApplied, userReview);
}

/* ── Reviews ── */
function renderReviews(allReviews, co, hasApplied, userReview) {
  const wrap = document.getElementById('prTabReviews');
  if (!wrap) return;

  const avg = allReviews.length
    ? (allReviews.reduce((s,r)=>s+r.rating,0)/allReviews.length).toFixed(1)
    : '—';

  // Rating distribution
  const dist = [5,4,3,2,1].map(star => ({
    star, count: allReviews.filter(r=>r.rating===star).length
  }));

  wrap.innerHTML = `
    <!-- Rating summary -->
    <div class="pr-reviews-summary">
      <div class="pr-reviews-big-rating">
        <span class="pr-reviews-avg">${avg}</span>
        <div class="pr-reviews-stars">${starsHTML(parseFloat(avg))}</div>
        <span class="pr-reviews-total">${allReviews.length} ulasan</span>
      </div>
      <div class="pr-reviews-bars">
        ${dist.map(d=>`
          <div class="pr-rating-bar-row">
            <span class="pr-rating-bar-label">${d.star} ★</span>
            <div class="pr-rating-bar-track">
              <div class="pr-rating-bar-fill" style="width:${allReviews.length?Math.round(d.count/allReviews.length*100):0}%"></div>
            </div>
            <span class="pr-rating-bar-count">${d.count}</span>
          </div>`).join('')}
      </div>
    </div>

    ${hasApplied ? `
      <div class="pr-review-cta">
        ${userReview
          ? `<p>Kamu sudah menulis review. <a href="review.html?id=${co.id}" class="pr-review-cta-link">Edit review kamu →</a></p>`
          : `<p>Sudah pernah magang di sini?</p><a href="review.html?id=${co.id}" class="pr-write-review-btn" style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;background:var(--blue-primary);border-color:var(--blue-primary);color:#fff">✍️ Tulis Review</a>`}
      </div>` : ''}

    <!-- Review list -->
    <div class="pr-review-list">
      ${allReviews.length
        ? allReviews.map(r=>`
            <div class="pr-review-item ${r.userId&&r.userId===MagnetDB.getSession()?.id?'pr-review-mine':''}">
              <div class="pr-review-header">
                <div class="pr-reviewer-avatar">${r.userInitial||'?'}</div>
                <div class="pr-reviewer-info">
                  <p class="pr-reviewer-name">${r.userName||'Anonim'} ${r.userId===MagnetDB.getSession()?.id?'<span class="pr-review-you">Kamu</span>':''}</p>
                  <p class="pr-reviewer-role">${r.role||'Intern'}</p>
                </div>
                <div class="pr-review-rating">${starsHTML(r.rating,14)}</div>
              </div>
              ${r.title?`<p class="pr-review-title">"${r.title}"</p>`:''}
              <p class="pr-review-text">${r.reviewText}</p>
              ${r.pros?`<div class="pr-review-proscon pr-review-pro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> ${r.pros}</div>`:''}
              ${r.cons?`<div class="pr-review-proscon pr-review-con"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ${r.cons}</div>`:''}
              <p class="pr-review-date">${new Date(r.createdAt||r.updatedAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
            </div>`).join('')
        : `<div style="text-align:center;padding:32px;color:var(--text-light);font-size:0.88rem">Belum ada review untuk perusahaan ini.<br>${hasApplied?'<a href="review.html?id='+co.id+'" style="color:var(--blue-primary);font-weight:600">Jadilah yang pertama menulis review →</a>':''}</div>`}
    </div>
  `;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  MagnetDB.requireMahasiswaAuth();
  restoreSidebarState();

  const user = MagnetDB.getSession();
  if (user) {
    const av = document.getElementById('avatarInitial');
    if (av) av.textContent = user.name.charAt(0).toUpperCase();
  }

  const id = new URLSearchParams(window.location.search).get('id');
  const co = MAGNET_COMPANIES.find(c=>c.id===id);

  if (!co) {
    document.querySelector('.page-body').innerHTML = `<div style="text-align:center;padding:64px;color:var(--text-light)"><p>Perusahaan tidak ditemukan.</p><a href="lowongan.html" style="color:var(--blue-primary);font-weight:600">← Kembali</a></div>`;
    return;
  }

  const hasApplied  = MagnetDB.hasAppliedToCompany(co.name);
  const userReview  = MagnetDB.getUserReview(co.id);

  document.title = `Magnet – ${co.name}`;
  document.querySelector('.header-brand-name').textContent = co.name;

  renderCompany(co, hasApplied, userReview);
});