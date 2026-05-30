// lengkapi-profil.js (FINAL FIX)
import { auth, saveProfileToFirebase, syncProfileFromFirebase } from './auth-firebase.js';
import { MagnetDB } from './db.js'; // asumsikan db.js sudah ada

/* ═══════════════════════════════════════════════════════════
    MAGNET – LENGKAPI-PROFIL.JS (RESOLVED)
════════════════════════════════════════════════════════════ */

let skillTags    = [];
let minatTags    = [];
let cvData       = null;
let isEditMode   = false;
let photoDataURL = null;

// Helper untuk mengambil elemen dengan ID alternatif (f- prefix)
function getElem(id) {
  return document.getElementById(id) || document.getElementById('f-' + id);
}

/* ════════════════════
    PHOTO UPLOAD
════════════════════ */
window.triggerPhotoUpload = function() {
  const input = document.getElementById('photoFileInput');
  if (input) input.click();
};

function handlePhotoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Hanya file gambar (JPG, PNG, WEBP)');
    input.value = ''; return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Ukuran foto maksimal 2MB');
    input.value = ''; return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    photoDataURL = e.target.result;
    applyPhotoPreview(photoDataURL);
    showToast('Foto berhasil dipilih ✓');
    updateProgress();
  };
  reader.readAsDataURL(file);
}
window.handlePhotoUpload = handlePhotoUpload; // expose untuk inline onchange

function applyPhotoPreview(dataURL) {
  const img = document.getElementById('photoImg');
  if (img) {
    img.src = dataURL;
    img.style.display = 'block';
  }
  const initial = document.getElementById('photoInitial');
  if (initial) initial.style.display = 'none';
  const removeBtn = document.getElementById('photoRemoveBtn');
  if (removeBtn) removeBtn.style.display = 'inline-flex';
}

window.removePhoto = function() {
  photoDataURL = null;
  const input = document.getElementById('photoFileInput');
  if (input) input.value = '';
  const img = document.getElementById('photoImg');
  if (img) { img.src = ''; img.style.display = 'none'; }
  const initial = document.getElementById('photoInitial');
  if (initial) initial.style.display = 'block';
  const removeBtn = document.getElementById('photoRemoveBtn');
  if (removeBtn) removeBtn.style.display = 'none';
  updateProgress();
};

/* ════════════
    PROGRESS
════════════ */
function updateProgress() {
  const nama    = getElem('nama')?.value?.trim() || '';
  const univ    = getElem('universitas')?.value?.trim() || '';
  const jur     = getElem('jurusan')?.value?.trim() || '';
  const sem     = getElem('semester')?.value || '';
  const checks = [
    !!nama, !!univ, !!jur, !!sem,
    skillTags.length > 0,
    minatTags.length > 0,
    !!photoDataURL,
    !!cvData,
  ];
  const pct = Math.round(checks.filter(Boolean).length / checks.length * 100);
  const pctEl = document.getElementById('progressPct');
  if (pctEl) pctEl.textContent = pct + '%';
  const fillEl = document.getElementById('progressFill');
  if (fillEl) fillEl.style.width = pct + '%';
  const hint = document.getElementById('progressHint');
  if (hint) {
    if (pct === 100) {
      hint.textContent = '✓ Profil kamu sudah lengkap!';
      document.getElementById('lpBanner')?.classList.add('hidden');
    } else {
      hint.textContent = `${checks.length - checks.filter(Boolean).length} data lagi untuk melengkapi profil`;
      document.getElementById('lpBanner')?.classList.remove('hidden');
    }
  }
}

/* ════════════
    TAGS
════════════ */
function renderTags(type) {
  const arr = type === 'skill' ? skillTags : minatTags;
  const container = document.getElementById(type + 'Tags');
  if (!container) return;
  container.innerHTML = arr.map((tag, i) => `
    <span class="tag-item">
      ${tag}
      ${isEditMode ? `<button type="button" class="tag-remove" data-type="${type}" data-index="${i}">×</button>` : ''}
    </span>
  `).join('');
  // Pasang event listener untuk tombol hapus
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = btn.dataset.type;
      const idx = parseInt(btn.dataset.index);
      if (t === 'skill') skillTags.splice(idx, 1);
      else minatTags.splice(idx, 1);
      renderTags(t);
      updateProgress();
    });
  });
  updateProgress();
}

window.addTag = function(type) {
  const input = document.getElementById(type + 'Input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(val)) { input.value = ''; return; }
  arr.push(val);
  input.value = '';
  renderTags(type);
};

window.addSuggestion = function(type, value) {
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(value) || arr.length >= 15) return;
  arr.push(value);
  renderTags(type);
};

/* ════════════
    CV UPLOAD
════════════ */
window.handleCVUpload = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    showToast('Hanya file PDF yang diterima');
    input.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran file maksimal 5MB');
    input.value = '';
    return;
  }
  cvData = { name: file.name, size: file.size, uploadedAt: new Date().toISOString() };
  document.getElementById('cvPlaceholder').style.display = 'none';
  const area = document.getElementById('cvUploadArea');
  if (area) { area.onclick = null; area.style.cursor = 'default'; }
  document.getElementById('cvStatus').style.display = 'flex';
  document.getElementById('cvFileName').textContent = file.name;
  document.getElementById('cvFileMeta').textContent = (file.size/1024).toFixed(0) + ' KB · PDF';
  showToast('CV berhasil diunggah ✓');
  updateProgress();
};

window.removeCV = function() {
  cvData = null;
  document.getElementById('cvFileInput').value = '';
  document.getElementById('cvStatus').style.display = 'none';
  const area = document.getElementById('cvUploadArea');
  const placeholder = document.getElementById('cvPlaceholder');
  if (placeholder) placeholder.style.display = 'flex';
  if (area) {
    area.style.cursor = 'pointer';
    area.onclick = () => document.getElementById('cvFileInput').click();
  }
  updateProgress();
};

/* ════════════
    EDIT MODE & SAVE
════════════ */
window.toggleEditMode = function() {
  if (isEditMode) {
    doSave(false);
  } else {
    isEditMode = true;
    applyEditMode();
  }
};

function applyEditMode() {
  const form = document.getElementById('lpForm');
  const btn = document.getElementById('editToggleBtn');
  const label = document.getElementById('editToggleLabel');
  if (isEditMode) {
    form?.classList.remove('view-mode');
    btn?.classList.add('editing');
    if (label) label.textContent = 'Selesai & Simpan';
  } else {
    form?.classList.add('view-mode');
    btn?.classList.remove('editing');
    if (label) label.textContent = 'Edit';
  }
  renderTags('skill');
  renderTags('minat');
}

async function doSave(strict = true) {
  const nama        = getElem('nama')?.value.trim()        || '';
  const universitas = getElem('universitas')?.value.trim() || '';
  const jurusan     = getElem('jurusan')?.value.trim()     || '';
  const semester    = getElem('semester')?.value           || '';
  const ipk         = getElem('ipk')?.value.trim()         || '';
  const pendidikan  = getElem('pendidikan')?.value.trim()  || '';
  const pengalaman  = getElem('pengalaman')?.value.trim()  || '';
  const prestasi    = getElem('prestasi')?.value.trim()    || '';

  if (!nama && strict) {
    showToast('Nama lengkap wajib diisi');
    getElem('nama')?.focus();
    return false;
  }

  // Dapatkan UID dari Firebase Auth atau session
  let uid = null;
  if (auth.currentUser) {
    uid = auth.currentUser.uid;
  } else {
    const session = MagnetDB.getSession();
    uid = session?.id;
  }
  if (!uid) {
    showToast('Sesi tidak valid, silakan login ulang');
    return false;
  }

  const profileData = {
    nama, universitas, jurusan, semester, ipk,
    skills: skillTags,
    minats: minatTags,
    pendidikan, pengalaman, prestasi,
    cv: cvData,
    avatar: photoDataURL
  };

  // Simpan ke Firebase
  const saved = await saveProfileToFirebase(uid, profileData);
  if (!saved) {
    showToast('Gagal menyimpan ke server', 'error');
    return false;
  }

  // Update localStorage via MagnetDB
  MagnetDB.saveProfile({
    name: nama, universitas, jurusan, semester, ipk,
    skills: skillTags, minat: minatTags,
    pendidikan, pengalaman, prestasi,
    cv: cvData, avatar: photoDataURL
  });

  showToast('Profil berhasil disimpan ✓');
  isEditMode = false;
  applyEditMode();
  updateProgress();
  setTimeout(() => { window.location.href = 'profil.html'; }, 1200);
  return true;
}

window.saveProfile = async function() {
  await doSave(true);
};

/* ════════════
    LOAD DATA
════════════ */
async function loadProfile() {
  // Ambil UID
  let uid = auth.currentUser?.uid;
  if (!uid) {
    const session = MagnetDB.getSession();
    uid = session?.id;
  }
  if (!uid) {
    console.warn('Tidak ada user login');
    return;
  }

  // Ambil dari Firebase
  const firebaseProfile = await syncProfileFromFirebase(uid);
  let profile = firebaseProfile;
  if (!profile) {
    // Fallback ke localStorage
    const session = MagnetDB.getSession();
    profile = session?.profile || {};
  }

  // Isi form
  const setVal = (id, val) => { const el = getElem(id); if (el) el.value = val || ''; };
  setVal('nama', profile.nama || profile.name || '');
  setVal('universitas', profile.universitas);
  setVal('jurusan', profile.jurusan);
  setVal('semester', profile.semester);
  setVal('ipk', profile.ipk);
  setVal('pendidikan', profile.pendidikan);
  setVal('pengalaman', profile.pengalaman);
  setVal('prestasi', profile.prestasi);

  skillTags = Array.isArray(profile.skills) ? [...profile.skills] : [];
  minatTags = Array.isArray(profile.minats) ? [...profile.minats] : (Array.isArray(profile.minat) ? [...profile.minat] : []);
  renderTags('skill');
  renderTags('minat');

  if (profile.cv) {
    cvData = profile.cv;
    document.getElementById('cvPlaceholder').style.display = 'none';
    const area = document.getElementById('cvUploadArea');
    if (area) { area.onclick = null; area.style.cursor = 'default'; }
    document.getElementById('cvStatus').style.display = 'flex';
    document.getElementById('cvFileName').textContent = profile.cv.name;
    document.getElementById('cvFileMeta').textContent = (profile.cv.size/1024).toFixed(0) + ' KB · PDF';
  }

  if (profile.avatar) {
    photoDataURL = profile.avatar;
    applyPhotoPreview(photoDataURL);
  }

  // Mode edit dari URL atau belum ada profil
  const params = new URLSearchParams(window.location.search);
  isEditMode = params.get('edit') === '1' || !firebaseProfile;
  applyEditMode();
  updateProgress();
}

/* ════════════
    INIT
════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Pastikan user sudah login (mahasiswa)
  if (typeof MagnetDB !== 'undefined' && MagnetDB.requireMahasiswaAuth) {
    MagnetDB.requireMahasiswaAuth();
  }

  // Tunggu auth siap
  if (auth && !auth.currentUser) {
    await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve();
      });
    });
  }

  loadProfile();

  // Binding event listener untuk input real-time progress
  ['nama', 'universitas', 'jurusan', 'semester', 'ipk'].forEach(id => {
    const el = getElem(id);
    if (el) {
      el.addEventListener('input', updateProgress);
      el.addEventListener('change', updateProgress);
    }
  });

  // Binding untuk tombol tambah tag via Enter
  const skillInput = document.getElementById('skillInput');
  const minatInput = document.getElementById('minatInput');
  if (skillInput) skillInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skill'); } });
  if (minatInput) minatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('minat'); } });

  // Untuk drag & drop CV
  const cvArea = document.getElementById('cvUploadArea');
  if (cvArea) {
    cvArea.addEventListener('dragover', e => { e.preventDefault(); cvArea.classList.add('drag-over'); });
    cvArea.addEventListener('dragleave', () => cvArea.classList.remove('drag-over'));
    cvArea.addEventListener('drop', e => {
      e.preventDefault();
      cvArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        const input = document.getElementById('cvFileInput');
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleCVUpload(input);
      } else {
        showToast('Hanya file PDF yang diterima');
      }
    });
  }
});