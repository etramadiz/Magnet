// lengkapi-profil.js (FIXED - All Bugs Resolved)
import { auth, saveProfileToFirebase, syncProfileFromFirebase } from './auth-firebase.js';
import { MagnetDB } from './db.js';

/* ═══════════════════════════════════════════════════════════
    HELPER: Toast (fallback jika dashboard.js belum load)
════════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  } else {
    alert(message);
  }
}

/* ═══════════════════════════════════════════════════════════
    GLOBAL VARIABLES
════════════════════════════════════════════════════════════ */
let skillTags    = [];
let minatTags    = [];
let cvData       = null;      // { name, size, uploadedAt } atau { url, name } jika pakai Storage
let isEditMode   = false;
let photoDataURL = null;      // base64 foto

// Helper ambil elemen (support id dengan/tanpa f-)
function getElem(id) {
  return document.getElementById(id) || document.getElementById('f-' + id);
}

/* ═══════════════════════════════════════════════════════════
    FOTO PROFIL
════════════════════════════════════════════════════════════ */
window.triggerPhotoUpload = () => document.getElementById('photoFileInput')?.click();

window.handlePhotoUpload = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Hanya file gambar (JPG, PNG, WEBP)', 'error');
    input.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Ukuran foto maksimal 2MB', 'error');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    photoDataURL = e.target.result;
    applyPhotoPreview(photoDataURL);
    showToast('Foto berhasil dipilih ✓');
    updateProgress();
  };
  reader.onerror = () => showToast('Gagal membaca file', 'error');
  reader.readAsDataURL(file);
};

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
  showToast('Foto dihapus');
};

/* ═══════════════════════════════════════════════════════════
    PROGRESS (samakan dengan halaman profil)
════════════════════════════════════════════════════════════ */
function updateProgress() {
  const nama    = getElem('nama')?.value?.trim() || '';
  const univ    = getElem('universitas')?.value?.trim() || '';
  const jur     = getElem('jurusan')?.value?.trim() || '';
  const sem     = getElem('semester')?.value || '';
  // Kriteria sama dengan profil.html (tanpa email/phone karena tidak di form)
  const checks = [
    !!nama, !!univ, !!jur, !!sem,
    skillTags.length > 0,
    minatTags.length > 0,
    !!cvData,
    !!photoDataURL   // opsional, kalau mau lebih lengkap
  ];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const pctEl = document.getElementById('progressPct');
  if (pctEl) pctEl.textContent = pct + '%';
  const fillEl = document.getElementById('progressFill');
  if (fillEl) fillEl.style.width = pct + '%';
  const hint = document.getElementById('progressHint');
  const banner = document.getElementById('lpBanner');
  if (hint) {
    if (pct === 100) {
      hint.textContent = '✓ Profil kamu sudah lengkap!';
      if (banner) banner.classList.add('hidden');
    } else {
      const kurang = checks.length - checks.filter(Boolean).length;
      hint.textContent = `${kurang} data lagi untuk melengkapi profil`;
      if (banner) banner.classList.remove('hidden');
    }
  }
}

/* ═══════════════════════════════════════════════════════════
    TAGS (SKILL & MINAT)
════════════════════════════════════════════════════════════ */
function renderTags(type) {
  const arr = type === 'skill' ? skillTags : minatTags;
  const container = document.getElementById(type + 'Tags');
  if (!container) {
    console.warn(`Container #${type}Tags tidak ditemukan`);
    return;
  }
  container.innerHTML = arr.map((tag, i) => `
    <span class="tag-item">
      ${escapeHtml(tag)}
      ${isEditMode ? `<button type="button" class="tag-remove" data-type="${type}" data-index="${i}">×</button>` : ''}
    </span>
  `).join('');

  // Event listener untuk tombol hapus
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

// Helper untuk menghindari XSS
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

window.addTag = function(type) {
  const input = document.getElementById(type + 'Input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(val)) {
    showToast('Tag sudah ada', 'info');
    input.value = '';
    return;
  }
  arr.push(val);
  input.value = '';
  renderTags(type);
};

window.addSuggestion = function(type, value) {
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(value) || arr.length >= 15) return;
  arr.push(value);
  renderTags(type);
  showToast(`"${value}" ditambahkan ke ${type === 'skill' ? 'Skill' : 'Minat'}`);
};

/* ═══════════════════════════════════════════════════════════
    CV UPLOAD
════════════════════════════════════════════════════════════ */
window.handleCVUpload = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    showToast('Hanya file PDF yang diterima', 'error');
    input.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran file maksimal 5MB', 'error');
    input.value = '';
    return;
  }
  // Simpan metadata CV (jika tidak pakai Storage)
  cvData = { name: file.name, size: file.size, uploadedAt: new Date().toISOString() };
  
  // Update UI
  const placeholder = document.getElementById('cvPlaceholder');
  if (placeholder) placeholder.style.display = 'none';
  const area = document.getElementById('cvUploadArea');
  if (area) {
    area.onclick = null;
    area.style.cursor = 'default';
  }
  const statusDiv = document.getElementById('cvStatus');
  if (statusDiv) statusDiv.style.display = 'flex';
  const fileNameSpan = document.getElementById('cvFileName');
  if (fileNameSpan) fileNameSpan.textContent = file.name;
  const metaSpan = document.getElementById('cvFileMeta');
  if (metaSpan) metaSpan.textContent = (file.size/1024).toFixed(0) + ' KB · PDF';
  
  showToast('CV berhasil diunggah ✓');
  updateProgress();
};

window.removeCV = function() {
  cvData = null;
  const fileInput = document.getElementById('cvFileInput');
  if (fileInput) fileInput.value = '';
  const statusDiv = document.getElementById('cvStatus');
  if (statusDiv) statusDiv.style.display = 'none';
  const placeholder = document.getElementById('cvPlaceholder');
  if (placeholder) placeholder.style.display = 'flex';
  const area = document.getElementById('cvUploadArea');
  if (area) {
    area.style.cursor = 'pointer';
    area.onclick = () => document.getElementById('cvFileInput').click();
  }
  updateProgress();
  showToast('CV dihapus');
};

/* ═══════════════════════════════════════════════════════════
    EDIT MODE & SAVE
════════════════════════════════════════════════════════════ */
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
  // Re-render tags biar tombol remove muncul/sesuai mode
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
    showToast('Nama lengkap wajib diisi', 'error');
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
    showToast('Sesi tidak valid, silakan login ulang', 'error');
    return false;
  }

  const profileData = {
    nama, universitas, jurusan, semester, ipk,
    skills: skillTags,
    minat: minatTags,        // konsisten: pakai 'minat' bukan 'minats'
    pendidikan, pengalaman, prestasi,
    cv: cvData,
    avatar: photoDataURL
  };

  try {
    const saved = await saveProfileToFirebase(uid, profileData);
    if (!saved) {
      showToast('Gagal menyimpan ke server', 'error');
      return false;
    }
  } catch (err) {
    console.error('Save error:', err);
    showToast('Terjadi kesalahan: ' + err.message, 'error');
    return false;
  }

  // Update localStorage dengan field yang sama (pakai 'nama', bukan 'name')
  MagnetDB.saveProfile({
    nama: nama,
    universitas, jurusan, semester, ipk,
    skills: skillTags,
    minat: minatTags,
    pendidikan, pengalaman, prestasi,
    cv: cvData,
    avatar: photoDataURL
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

/* ═══════════════════════════════════════════════════════════
    LOAD DATA DARI FIREBASE + LOCALSTORAGE
════════════════════════════════════════════════════════════ */
async function loadProfile() {
  let uid = auth.currentUser?.uid;
  if (!uid) {
    const session = MagnetDB.getSession();
    uid = session?.id;
  }
  if (!uid) {
    console.warn('Tidak ada user login');
    return;
  }

  let firebaseProfile = null;
  try {
    firebaseProfile = await syncProfileFromFirebase(uid);
  } catch (err) {
    console.error('Gagal sync dari Firebase:', err);
  }

  let profile = firebaseProfile;
  if (!profile) {
    const session = MagnetDB.getSession();
    profile = session?.profile || {};
  }

  // Isi form (gunakan 'nama' dari profile, kalau tidak ada pakai 'name' dari session)
  const setVal = (id, val) => { const el = getElem(id); if (el) el.value = val || ''; };
  setVal('nama', profile.nama || profile.name || '');
  setVal('universitas', profile.universitas || '');
  setVal('jurusan', profile.jurusan || '');
  setVal('semester', profile.semester || '');
  setVal('ipk', profile.ipk || '');
  setVal('pendidikan', profile.pendidikan || '');
  setVal('pengalaman', profile.pengalaman || '');
  setVal('prestasi', profile.prestasi || '');

  // Tags
  skillTags = Array.isArray(profile.skills) ? [...profile.skills] : [];
  minatTags = Array.isArray(profile.minat) ? [...profile.minat] : (Array.isArray(profile.minats) ? [...profile.minats] : []);
  renderTags('skill');
  renderTags('minat');

  // CV
  if (profile.cv) {
    cvData = profile.cv;
    const placeholder = document.getElementById('cvPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    const area = document.getElementById('cvUploadArea');
    if (area) { area.onclick = null; area.style.cursor = 'default'; }
    const statusDiv = document.getElementById('cvStatus');
    if (statusDiv) statusDiv.style.display = 'flex';
    const fileNameSpan = document.getElementById('cvFileName');
    if (fileNameSpan) fileNameSpan.textContent = profile.cv.name || 'CV.pdf';
    const metaSpan = document.getElementById('cvFileMeta');
    if (metaSpan) metaSpan.textContent = profile.cv.size ? (profile.cv.size/1024).toFixed(0) + ' KB · PDF' : 'PDF';
  }

  // Foto
  if (profile.avatar) {
    photoDataURL = profile.avatar;
    applyPhotoPreview(photoDataURL);
  } else {
    // reset preview
    removePhoto();
  }

  // Tentukan mode edit: jika belum ada profil di Firebase, atau URL param edit=1
  const params = new URLSearchParams(window.location.search);
  isEditMode = params.get('edit') === '1' || !firebaseProfile;
  applyEditMode();
  updateProgress();
}

/* ═══════════════════════════════════════════════════════════
    INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Pastikan user login (mahasiswa)
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

  await loadProfile();

  // Pasang event listener untuk update progress realtime
  ['nama', 'universitas', 'jurusan', 'semester', 'ipk', 'pendidikan', 'pengalaman', 'prestasi'].forEach(id => {
    const el = getElem(id);
    if (el) {
      el.addEventListener('input', updateProgress);
      el.addEventListener('change', updateProgress);
    }
  });

  // Enter untuk menambah tag
  const skillInput = document.getElementById('skillInput');
  const minatInput = document.getElementById('minatInput');
  if (skillInput) skillInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skill'); } });
  if (minatInput) minatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('minat'); } });

  // Drag & drop CV
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
        showToast('Hanya file PDF yang diterima', 'error');
      }
    });
  }
});