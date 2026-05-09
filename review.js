/* ═══════════════════════════════════════════════════════════
   MAGNET – REVIEW.JS
════════════════════════════════════════════════════════════ */

let selectedRating = 0;
let currentCompany = null;

const RATING_LABELS = ['','Sangat Buruk 😞','Kurang Baik 😕','Cukup 😐','Bagus 😊','Luar Biasa! 🤩'];
const RATING_CLASSES = ['','r1','r2','r3','r4','r5'];

/* ── Star interaction ── */
function setRating(val) {
  selectedRating = val;
  updateStars(val, true);
}

function hoverRating(val) {
  updateStars(val, false);
}

function unhoverRating() {
  updateStars(selectedRating, true);
}

function updateStars(val, isSet) {
  const btns  = document.querySelectorAll('.rv-star-btn');
  const label = document.getElementById('rvRatingLabel');

  btns.forEach((btn, i) => {
    btn.classList.remove('active', 'hover');
    if (i < val) btn.classList.add(isSet ? 'active' : 'hover');
  });

  if (label) {
    label.textContent = val > 0 ? RATING_LABELS[val] : (selectedRating > 0 ? RATING_LABELS[selectedRating] : 'Belum dipilih');
    label.className   = 'rv-rating-label ' + (val > 0 ? RATING_CLASSES[val] : RATING_CLASSES[selectedRating] || '');
  }
}

/* ── Char counter ── */
function countChars(inputId, countId, max) {
  const val = document.getElementById(inputId)?.value || '';
  const el  = document.getElementById(countId);
  if (el) el.textContent = val.length;
}

/* ── Submit ── */
function submitReview() {
  const role  = document.getElementById('rvRole')?.value.trim();
  const title = document.getElementById('rvTitle')?.value.trim();
  const text  = document.getElementById('rvText')?.value.trim();
  const pros  = document.getElementById('rvPros')?.value.trim();
  const cons  = document.getElementById('rvCons')?.value.trim();

  if (!selectedRating) {
    showToast('Pilih rating bintang terlebih dahulu');
    document.getElementById('rvStars')?.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }
  if (!role)  { showToast('Isi posisi / bidang magang'); hlInput('rvRole');  return; }
  if (!title) { showToast('Isi judul review');            hlInput('rvTitle'); return; }
  if (!text || text.length < 30) {
    showToast('Tulis review minimal 30 karakter');
    hlInput('rvText');
    return;
  }

  const result = MagnetDB.saveReview({
    companyId:   currentCompany.id,
    companyName: currentCompany.name,
    rating:      selectedRating,
    title, reviewText: text, pros, cons, role,
  });

  if (!result.ok) { showToast(result.message); return; }

  // Show success
  document.querySelector('.rv-form-card').style.display = 'none';
  const success = document.getElementById('rvSuccess');
  success.style.display = 'flex';
  const backLink = document.getElementById('rvSuccessBack');
  if (backLink) backLink.href = `perusahaan.html?id=${currentCompany.id}`;

  window.scrollTo({ top:0, behavior:'smooth' });
}

function hlInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  el.style.borderColor = 'var(--red)';
  setTimeout(() => el.style.borderColor = '', 2500);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  MagnetDB.requireAuth('index.html');
  restoreSidebarState();

  const user = MagnetDB.getSession();
  if (user) {
    const av = document.getElementById('avatarInitial');
    if (av) av.textContent = user.name.charAt(0).toUpperCase();
  }

  const id = new URLSearchParams(window.location.search).get('id');
  const co = MAGNET_COMPANIES.find(c => c.id === id);

  if (!co) {
    showToast('Perusahaan tidak ditemukan');
    setTimeout(() => history.back(), 1500);
    return;
  }

  currentCompany = co;

  // Fill company card
  const logoEl = document.getElementById('rvLogo');
  const nameEl = document.getElementById('rvCompanyName');
  if (logoEl) { logoEl.textContent = co.short; logoEl.style.color = co.color; logoEl.style.background = co.color + '18'; logoEl.style.borderColor = co.color + '30'; }
  if (nameEl) nameEl.textContent = co.name;

  document.title = `Magnet – Review ${co.name}`;

  // Pre-fill role if user has applied
  const apps = MagnetDB.getUserApplications();
  const appForCompany = apps.find(a => a.company === co.name);
  if (appForCompany) {
    const roleEl = document.getElementById('rvRole');
    if (roleEl) roleEl.value = appForCompany.jobTitle;
  }

  // Pre-fill existing review if any
  const existingReview = MagnetDB.getUserReview(co.id);
  if (existingReview) {
    setRating(existingReview.rating);
    const set = (id, val) => { const el=document.getElementById(id); if(el) el.value=val||''; };
    set('rvRole',  existingReview.role);
    set('rvTitle', existingReview.title);
    set('rvText',  existingReview.reviewText);
    set('rvPros',  existingReview.pros);
    set('rvCons',  existingReview.cons);
    // Update char counts
    ['rvTitle','rvText'].forEach(id => {
      const el = document.getElementById(id);
      const max = id==='rvTitle' ? 80 : 1000;
      countChars(id, id+'Count', max);
    });
    const btn = document.getElementById('rvSubmitBtn');
    if (btn) btn.textContent = '✏️ Perbarui Review';
  }
});