import { saveReviewToFirebase, getReviewsByCompany } from '../Page_Perusahaan/firebase-company.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { db } from '../Page_Login_Register/firebase-config.js';

let selectedRating = 0;
let currentCompany = null;

const RATING_LABELS = ['','Sangat Buruk 😞','Kurang Baik 😕','Cukup 😐','Bagus 😊','Luar Biasa! 🤩'];
const RATING_CLASSES = ['','r1','r2','r3','r4','r5'];

function setRating(val) { selectedRating = val; updateStars(val, true); }
function hoverRating(val) { updateStars(val, false); }
function unhoverRating() { updateStars(selectedRating, true); }

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

function countChars(inputId, countId, max) {
  const val = document.getElementById(inputId)?.value || '';
  const el  = document.getElementById(countId);
  if (el) el.textContent = val.length;
}

function hlInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus(); el.style.borderColor = 'var(--red)';
  setTimeout(() => el.style.borderColor = '', 2500);
}

async function submitReview() {
  const role  = document.getElementById('rvRole')?.value.trim();
  const title = document.getElementById('rvTitle')?.value.trim();
  const text  = document.getElementById('rvText')?.value.trim();
  const pros  = document.getElementById('rvPros')?.value.trim();
  const cons  = document.getElementById('rvCons')?.value.trim();

  if (!selectedRating) { showToast('Pilih rating bintang terlebih dahulu'); document.getElementById('rvStars')?.scrollIntoView({ behavior:'smooth', block:'center' }); return; }
  if (!role)  { showToast('Isi posisi / bidang magang'); hlInput('rvRole');  return; }
  if (!title) { showToast('Isi judul review');            hlInput('rvTitle'); return; }
  if (!text || text.length < 30) { showToast('Tulis review minimal 30 karakter'); hlInput('rvText'); return; }

  const session = MagnetDB.getSession();
  if (!session) { showToast('Gagal memverifikasi akun Anda.'); return; }

  const submitBtn = document.getElementById('rvSubmitBtn');
  submitBtn.innerHTML = 'Mengirim...'; submitBtn.disabled = true;

  const result = await saveReviewToFirebase({
    userId: session.id,
    userName: session.name,
    userInitial: session.name.charAt(0).toUpperCase(),
    companyId: currentCompany.id,
    companyName: currentCompany.name,
    rating: selectedRating,
    title: title, reviewText: text, pros: pros, cons: cons, role: role,
    createdAt: new Date().toISOString()
  });

  if (!result.ok) { 
    showToast('Gagal menyimpan review.'); 
    submitBtn.innerHTML = 'Kirim Review'; submitBtn.disabled = false;
    return; 
  }

  // Tampilkan form sukses
  document.querySelector('.rv-form-card').style.display = 'none';
  document.getElementById('rvSuccess').style.display = 'flex';
  document.getElementById('rvSuccessBack').href = `perusahaan.html?id=${currentCompany.id}`;
  window.scrollTo({ top:0, behavior:'smooth' });
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
  
  // 🔥 PERBAIKAN: Ambil data perusahaan dari Firebase
  try {
    const companySnap = await get(ref(db, `companies/${id}`));
    if (!companySnap.exists()) {
      showToast('Perusahaan tidak ditemukan');
      setTimeout(() => history.back(), 1500);
      return;
    }
    
    const co = { id: companySnap.key, ...companySnap.val() };
    // Sesuaikan field jika di Firebase namanya 'nama' bukan 'name'
    co.name = co.nama || co.name;
    co.short = co.name.charAt(0).toUpperCase();
    co.color = '#3B2A8E'; // Warna default jika tidak ada di DB

    currentCompany = co;

    // Fill company card
    const logoEl = document.getElementById('rvLogo');
    const nameEl = document.getElementById('rvCompanyName');
    if (logoEl) { 
      logoEl.textContent = co.short; 
      logoEl.style.color = co.color; 
      logoEl.style.background = co.color + '18'; 
      logoEl.style.borderColor = co.color + '30'; 
    }
    if (nameEl) nameEl.textContent = co.name;
    document.title = `Magnet – Review ${co.name}`;

  try {
    // 1. Cek riwayat lamaran user di Firebase untuk perusahaan ini
    const appsSnap = await get(ref(db, 'applications'));
    let appForCompany = null;
    if (appsSnap.exists()) {
      appsSnap.forEach(child => {
        const app = child.val();
        if (app.userId === user.id && (app.companyId === co.id || app.company === co.name)) {
          appForCompany = app;
        }
      });
    }

    if (appForCompany) {
      const roleEl = document.getElementById('rvRole');
      if (roleEl) roleEl.value = appForCompany.jobTitle || '';
    }

    // 2. Tarik review lama user dari Firebase (jika sudah pernah review)
    const allReviews = await getReviewsByCompany(co.id);
    const existingReview = allReviews.find(r => r.userId === user.id);

    if (existingReview) {
      setRating(existingReview.rating);
      const set = (id, val) => { const el=document.getElementById(id); if(el) el.value=val||''; };
      set('rvRole',  existingReview.role);
      set('rvTitle', existingReview.title);
      set('rvText',  existingReview.reviewText);
      set('rvPros',  existingReview.pros);
      set('rvCons',  existingReview.cons);
      
      ['rvTitle','rvText'].forEach(id => { countChars(id, id+'Count', id==='rvTitle'?80:1000); });
      document.getElementById('rvSubmitBtn').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="17" height="17"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Perbarui Review';
    }

      } catch (err) {
    console.error("Gagal menarik data dari Firebase:", err);
  }
  
  } catch (err) {
    console.error("Gagal menarik data dari Firebase:", err);
  }
});

// Ekspos ke global agar HTML (onclick) bisa memanggilnya
window.setRating = setRating;
window.hoverRating = hoverRating;
window.unhoverRating = unhoverRating;
window.countChars = countChars;
window.submitReview = submitReview;