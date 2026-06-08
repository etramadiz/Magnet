/* ═══════════════════════════════════════════════════════════
   MAGNET – LENGKAPI-PROFIL.JS
════════════════════════════════════════════════════════════ */
import { db, auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { saveMahasiswaProfile, getMahasiswaProfile } from './firebase-mahasiswa.js';
import { syncProfileFromFirebase } from '../Page_Login_Register/auth-firebase.js';

// Hapus import { MagnetDB } from './db.js'; → karena MagnetDB sudah global

let skillTags  = [];
let minatTags  = [];
let cvData     = null;
let isEditMode = false;
let photoDataURL = null; // base64 foto profil

const showToast = window.showToast;

/* ════════════════════
   PHOTO UPLOAD
════════════════════ */
function compressImage(dataURL, maxWidth = 400, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.src = dataURL;
  });
}

async function handlePhotoUpload(input) {
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
  reader.onload = async (e) => {
    const original = e.target.result;
    showToast('Memproses foto...');
    const compressed = await compressImage(original, 300, 0.7);
    photoDataURL = compressed;
    applyPhotoPreview(photoDataURL);
    showToast('Foto berhasil dipilih ✓');
    updateProgress()
  };
  reader.readAsDataURL(file);
}

function applyPhotoPreview(dataURL) {
  const img     = document.getElementById('photoImg');
  const initial = document.getElementById('photoInitial');
  const rmBtn   = document.getElementById('photoRemoveBtn');
  if (img)    { img.src = dataURL; img.style.display = 'block'; }
  if (initial) initial.style.display = 'none';
  if (rmBtn)   rmBtn.style.display = 'inline-flex';
}

function removePhoto() {
  photoDataURL = null;
  const input = document.getElementById('photoFileInput');
  if (input) input.value = '';
  const img     = document.getElementById('photoImg');
  const initial = document.getElementById('photoInitial');
  const rmBtn   = document.getElementById('photoRemoveBtn');
  if (img)    { img.src = ''; img.style.display = 'none'; }
  if (initial) { initial.style.display = ''; initial.textContent = _getInitial(); }
  if (rmBtn)   rmBtn.style.display = 'none';
  updateProgress();
}

function _getInitial() {
  const user = auth.currentUser;
  const name = user?.displayName || MagnetDB.getSession()?.name || '?';
  return name.charAt(0).toUpperCase();
}

function initPhotoSection() {
  const initial = document.getElementById('photoInitial');
  if (initial) initial.textContent = _getInitial();
}

/* ════════════
   PROGRESS
════════════ */
function updateProgress() {
  const nama        = document.getElementById('f-nama')?.value?.trim() || '';
  const email       = document.getElementById('f-email')?.value?.trim() || '';
  const telepon     = document.getElementById('f-telepon')?.value?.trim() || '';
  const universitas = document.getElementById('f-universitas')?.value?.trim() || '';
  const jurusan     = document.getElementById('f-jurusan')?.value?.trim() || '';
  const semester    = document.getElementById('f-semester')?.value || '';
  const ipk         = document.getElementById('f-ipk')?.value?.trim() || '';
  const hasSkill    = skillTags.length > 0;
  const hasMinat    = minatTags.length > 0;
  const hasCV       = cvData !== null;

  const checks = [
    !!nama, !!email, !!telepon, !!photoDataURL,
    !!universitas, !!jurusan, !!semester, hasSkill, hasMinat, hasCV
  ];
  const pct = Math.round(checks.filter(Boolean).length / checks.length * 100);

  const pctEl  = document.getElementById('progressPct');
  const fillEl = document.getElementById('progressFill');
  if (pctEl)  pctEl.textContent    = pct + '%';
  if (fillEl) fillEl.style.width   = pct + '%';

  const hint = document.getElementById('progressHint');
  if (!hint) return;
  if (pct === 100) {
    hint.textContent = '✓ Profil kamu sudah lengkap!';
    hint.style.color = 'var(--green)';
    document.getElementById('lpBanner')?.classList.add('hidden');
  } else {
    const remaining = checks.filter(Boolean).length;
    hint.textContent = `${checks.length - remaining} data lagi untuk melengkapi profil`;
    hint.style.color = 'var(--text-light)';
    document.getElementById('lpBanner')?.classList.remove('hidden');
  }
}

/* ════════════
   TAGS
════════════ */
function renderTags(type) {
  const arr    = type === 'skill' ? skillTags : minatTags;
  const listEl = document.getElementById(type + 'Tags');
  if (!listEl) return;

  listEl.innerHTML = arr.map((tag, i) => `
    <span class="tag-item">
      ${tag}
      ${isEditMode ? `<button type="button" class="tag-remove" onclick="removeTag('${type}',${i})">×</button>` : ''}
    </span>
  `).join('');

  updateProgress();
}

function addTag(type) {
  const input = document.getElementById(type + 'Input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(val)) { input.value = ''; return; }
  if (arr.length >= 15)  { showToast('Maksimal 15 ' + type); return; }
  arr.push(val);
  input.value = '';
  renderTags(type);
}

function removeTag(type, idx) {
  if (type === 'skill') skillTags.splice(idx, 1);
  else                  minatTags.splice(idx, 1);
  renderTags(type);
}

function addSuggestion(type, value) {
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(value) || arr.length >= 15) return;
  arr.push(value);
  renderTags(type);
}

/* ════════════
   CV UPLOAD
════════════ */
function handleCVUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') { showToast('Hanya file PDF yang diterima'); input.value = ''; return; }
  if (file.size > 5 * 1024 * 1024)    { showToast('Ukuran file maksimal 5MB'); input.value = ''; return; }

  cvData = { name: file.name, size: file.size, uploadedAt: new Date().toISOString() };

  document.getElementById('cvPlaceholder').style.display = 'none';
  const area = document.getElementById('cvUploadArea');
  area.onclick = null;
  area.style.cursor = 'default';

  document.getElementById('cvStatus').style.display = 'flex';
  document.getElementById('cvFileName').textContent = file.name;
  document.getElementById('cvFileMeta').textContent = (file.size/1024).toFixed(0) + ' KB · PDF';

  showToast('CV berhasil diunggah ✓');
  updateProgress();
}

function removeCV() {
  cvData = null;
  document.getElementById('cvFileInput').value = '';
  document.getElementById('cvStatus').style.display = 'none';
  const area = document.getElementById('cvUploadArea');
  document.getElementById('cvPlaceholder').style.display = 'flex';
  area.style.cursor = 'pointer';
  area.onclick = () => document.getElementById('cvFileInput').click();
  updateProgress();
}

/* ════════════
   EDIT MODE
════════════ */
function toggleEditMode() {
  if (isEditMode) {
    // Klik "Selesai" → simpan dulu baru tutup edit mode
    doSave(false); // false = jangan tampilkan pesan error jika field kosong
  } else {
    isEditMode = true;
    applyEditMode();
  }
}

function applyEditMode() {
  const form  = document.getElementById('lpForm');
  const btn   = document.getElementById('editToggleBtn');
  const label = document.getElementById('editToggleLabel');

  if (isEditMode) {
    form.classList.remove('view-mode');
    btn.classList.add('editing');
    label.textContent = 'Selesai & Simpan';
    if (!cvData) {
      const area = document.getElementById('cvUploadArea');
      if (area) {
        area.style.display   = '';
        area.style.cursor    = 'pointer';
        area.onclick = () => document.getElementById('cvFileInput').click();
      }
    }
  } else {
    form.classList.add('view-mode');
    btn.classList.remove('editing');
    label.textContent = 'Edit';
  }
  renderTags('skill');
  renderTags('minat');
}

/* ════════════
   SAVE
════════════ */
/**
 * doSave(strict)
 * strict = true  → validasi ketat, tampilkan error kalau field wajib kosong
 * strict = false → partial save, simpan apa yang sudah diisi
 */
async function doSave(strict = true) {
  if (!currentUserId) {
    showToast('User tidak terautentikasi');
    return false;
  }

  const nama        = document.getElementById('f-nama')?.value.trim()        || '';
  const email       = document.getElementById('f-email')?.value.trim()       || '';
  const telepon     = document.getElementById('f-telepon')?.value.trim()     || '';
  const universitas = document.getElementById('f-universitas')?.value.trim() || '';
  const jurusan     = document.getElementById('f-jurusan')?.value.trim()     || '';
  const semester    = document.getElementById('f-semester')?.value            || '';
  const ipk         = document.getElementById('f-ipk')?.value.trim()         || '';
  const pendidikan  = document.getElementById('f-pendidikan')?.value.trim()  || '';
  const pengalaman  = document.getElementById('f-pengalaman')?.value.trim()  || '';
  const prestasi    = document.getElementById('f-prestasi')?.value.trim()    || '';

  if (!nama) {
    if (strict) showToast('Nama lengkap wajib diisi');
    hlField('f-nama');
    return false;
  }

    const profileData = {
      name: nama, 
      email: email, 
      phone: telepon,
      universitas: universitas, 
      jurusan: jurusan, 
      semester: semester, 
      ipk: ipk,
      skills: [...skillTags],
      minat: [...minatTags],
      pendidikan: pendidikan,
      pengalaman: pengalaman,
      prestasi: prestasi,
      cv: cvData,
      avatar: photoDataURL,
      updatedAt: new Date().toISOString()
    };
  }

  try {
    await saveMahasiswaProfile(currentUid, profileData);
    showToast('Profil berhasil disimpan ke cloud ✓');
    
    // Optional: Update displayName di Firebase Auth
    if (auth.currentUser && nama !== auth.currentUser.displayName) {
      await auth.currentUser.updateProfile({ displayName: nama });
    }

    isEditMode = false;
    applyEditMode();
    updateProgress();

    // Update avatar di header jika ada
    const avatarInitial = document.getElementById('avatarInitial');
    if (avatarInitial && photoDataURL) {
      const avatarDiv = document.querySelector('.avatar-btn');
      if (avatarDiv) {
        avatarDiv.style.backgroundImage = `url(${photoDataURL})`;
        avatarDiv.style.backgroundSize = 'cover';
        avatarDiv.style.backgroundPosition = 'center';
        avatarInitial.style.display = 'none';
      }
    }
    return true;
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan profil: ' + err.message);
    return false;
  }

// Tombol "Simpan Profil" tetap ada sebagai cadangan
async function saveProfile() {
  doSave(true);
}

function hlField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  el.style.borderColor = 'var(--red)';
  setTimeout(() => el.style.borderColor = '', 2000);
}

/* ════════════
   LOAD DATA
════════════ */
async function loadProfile() {
  if (!currentUid) return;
  try {
      const profile = await getMahasiswaProfile(currentUid);
      if (profile) {
      // Isi form dengan data dari Firebase
      const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
      };
      setField('f-nama', profile.name);
      setField('f-email', profile.email);
      setField('f-telepon', profile.phone);
      setField('f-universitas', profile.universitas);
      setField('f-jurusan', profile.jurusan);
      setField('f-semester', profile.semester);
      setField('f-ipk', profile.ipk);
      setField('f-pendidikan', profile.pendidikan);
      setField('f-pengalaman', profile.pengalaman);
      setField('f-prestasi', profile.prestasi);

      skillTags = profile.skills ? [...profile.skills] : [];
      minatTags = profile.minat ? [...profile.minat] : [];
      cvData = profile.cv || null;
      photoDataURL = profile.avatar || null;

      if (photoDataURL) applyPhotoPreview(photoDataURL);
      if (cvData) {
        document.getElementById('cvPlaceholder').style.display = 'none';
        const area = document.getElementById('cvUploadArea');
        if (area) { area.onclick = null; area.style.cursor = 'default'; }
        const st = document.getElementById('cvStatus');
        if (st) st.style.display = 'flex';
        const fn = document.getElementById('cvFileName');
        const fm = document.getElementById('cvFileMeta');
        if (fn) fn.textContent = cvData.name;
        if (fm) fm.textContent = (cvData.size/1024).toFixed(0) + ' KB · PDF';
      }
    } else {
      // Profile belum ada, biarkan form kosong
      skillTags = [];
      minatTags = [];
      cvData = null;
      photoDataURL = null;
    }
    renderTags('skill');
    renderTags('minat');

    // Tentukan edit mode: jika belum ada profil, langsung edit mode
    const params = new URLSearchParams(window.location.search);
    isEditMode = params.get('edit') === '1' || !profile;
    applyEditMode();
    updateProgress();

    if (profile && isProfileCompleteFromForm()) {
      document.getElementById('lpBanner')?.classList.add('hidden');
    }
  } catch (err) {
    console.error('Gagal load profil dari Firebase:', err);
    showToast('Gagal memuat profil');
  }
}

function isProfileCompleteFromForm() {
  const universitas = document.getElementById('f-universitas')?.value?.trim();
  const jurusan = document.getElementById('f-jurusan')?.value?.trim();
  const semester = document.getElementById('f-semester')?.value;
  const hasSkill = skillTags.length > 0;
  const hasMinat = minatTags.length > 0;
  const hasCV = cvData !== null;
  return !!(universitas && jurusan && semester && hasSkill && hasMinat && hasCV);
}

/* ════════════
   INIT
════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Cek auth state Firebase
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Redirect ke login jika belum login
      window.location.href = '../../../Page Login Register/index.html';
      return;
    }
    currentUid = user.uid;
    
    // Optional: pastikan session MagnetDB juga sync (untuk keperluan lamaran, dll)
    // Tapi untuk profil, kita tidak pakai MagnetDB.
    
    // Load sidebar dll
    restoreSidebarState();
    
    // Update badge lamaran (masih pakai MagnetDB, itu boleh)
    const apps = MagnetDB.getUserApplications();
    const badge = document.getElementById('nav-lamaran-badge');
    if (badge) {
      if (apps.length > 0) { badge.textContent = apps.length; badge.style.display = 'inline-flex'; }
      else badge.style.display = 'none';
    }
    
    // Load profil dari Firebase
    await loadProfile();
    initPhotoSection();
    
    // Event listeners
    const si = document.getElementById('skillInput');
    const mi = document.getElementById('minatInput');
    if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skill'); } });
    if (mi) mi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('minat'); } });
    
    ['f-nama','f-universitas','f-jurusan','f-semester','f-ipk'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('input', updateProgress); el.addEventListener('change', updateProgress); }
    });
    
    const area = document.getElementById('cvUploadArea');
    if (area) {
      area.addEventListener('dragover',  e => { e.preventDefault(); area.classList.add('drag-over'); });
      area.addEventListener('dragleave', ()  => area.classList.remove('drag-over'));
      area.addEventListener('drop', e => {
        e.preventDefault(); area.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const input = document.getElementById('cvFileInput');
        try { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; } catch(err) {}
        handleCVUpload(input);
      });
    }
    
    // Expose functions ke global
    window.handlePhotoUpload = handlePhotoUpload;
    window.removePhoto = removePhoto;
    window.addTag = addTag;
    window.removeTag = removeTag;
    window.addSuggestion = addSuggestion;
    window.handleCVUpload = handleCVUpload;
    window.removeCV = removeCV;
    window.toggleEditMode = toggleEditMode;
    window.saveProfile = saveProfile;
    window.updateProgress = updateProgress;
  });
});