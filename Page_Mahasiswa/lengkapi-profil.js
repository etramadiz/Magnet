import { saveProfileToFirebase, syncProfileFromFirebase } from './auth-firebase.js';

/* ═══════════════════════════════════════════════════════════
    MAGNET – LENGKAPI-PROFIL.JS (RESOLVED & FULLY OPTIMIZED)
════════════════════════════════════════════════════════════ */

let skillTags    = [];
let minatTags    = [];
let cvData       = null;
let isEditMode   = false;
let photoDataURL = null; // base64 foto profil

// Helper Pintar untuk mengambil elemen HTML dengan fallback ID (mengatasi f-prefix mismatch)
function getProfileElement(idWithoutPrefix) {
  return document.getElementById(idWithoutPrefix) || document.getElementById('f-' + idWithoutPrefix);
}

/* ════════════════════
    PHOTO UPLOAD
════════════════════ */
// Memastikan klik pada tombol 'Upload Foto' memicu input file tersembunyi
window.triggerPhotoUpload = function() {
  let input = document.getElementById('photoFileInput');
  if (!input) {
    // Jika input file belum ada di HTML, buat secara dinamis agar fitur upload tidak rusak
    input = document.createElement('input');
    input.id = 'photoFileInput';
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.style.display = 'none';
    input.addEventListener('change', function() { handlePhotoUpload(this); });
    document.body.appendChild(input);
  }
  input.click();
};

function handlePhotoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    if (typeof showToast === 'function') showToast('Hanya file gambar (JPG, PNG, WEBP)');
    input.value = ''; return;
  }
  if (file.size > 2 * 1024 * 1024) {
    if (typeof showToast === 'function') showToast('Ukuran foto maksimal 2MB');
    input.value = ''; return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    photoDataURL = e.target.result;
    applyPhotoPreview(photoDataURL);
    if (typeof showToast === 'function') showToast('Foto berhasil dipilih ✓');
    updateProgress();
  };
  reader.readAsDataURL(file);
}

function applyPhotoPreview(dataURL) {
  // Mencari elemen visual preview lingkaran biru bertanda tanya (?) di UI Anda
  const avatarContainer = document.querySelector('.f-foto-container, .avatar-box') || document.getElementById('photoImg')?.parentElement;
  let img = document.getElementById('photoImg');
  
  if (!img && avatarContainer) {
    // Jika tag img belum ada di dalam lingkaran, buat otomatis
    img = document.createElement('img');
    img.id = 'photoImg';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    avatarContainer.appendChild(img);
  }

  if (img) { 
    img.src = dataURL; 
    img.style.display = 'block'; 
  }
  
  // Sembunyikan text bawaan / tanda tanya "?" jika ada
  const initial = document.getElementById('photoInitial') || avatarContainer?.querySelector('span, .text-icon');
  if (initial) initial.style.display = 'none';
}

function removePhoto() {
  photoDataURL = null;
  const input = document.getElementById('photoFileInput');
  if (input) input.value = '';
  const img = document.getElementById('photoImg');
  if (img) { img.src = ''; img.style.display = 'none'; }
  
  const avatarContainer = document.querySelector('.f-foto-container, .avatar-box') || document.getElementById('photoImg')?.parentElement;
  const initial = document.getElementById('photoInitial') || avatarContainer?.querySelector('span, .text-icon');
  if (initial) initial.style.display = 'block';
  
  updateProgress();
}

function _getInitial() {
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const loggedInUser = users.find(u => u.isLoggedIn === true);
  return loggedInUser?.name?.charAt(0).toUpperCase() || '?';
}

function initPhotoSection() {
  const avatarContainer = document.querySelector('.f-foto-container, .avatar-box');
  const initial = document.getElementById('photoInitial') || avatarContainer?.querySelector('span, .text-icon');
  if (initial) initial.textContent = _getInitial();
  
  // Binding otomatis click event ke tombol upload foto di UI
  const uploadBtn = document.querySelector('button[class*="Upload"], .btn-upload-photo') || document.querySelector('button signature upload');
  if (uploadBtn && !uploadBtn.onclick) {
    uploadBtn.onclick = function(e) {
      e.preventDefault();
      window.triggerPhotoUpload();
    };
  }
}

/* ════════════
    PROGRESS
════════════ */
function updateProgress() {
  console.log('updateProgress dipanggil');
  
  const namaVal = getProfileElement('nama')?.value?.trim();
  const univVal = getProfileElement('universitas')?.value?.trim();
  const jurVal  = getProfileElement('jurusan')?.value?.trim();
  const semVal  = getProfileElement('semester')?.value;

  const checks = [
    !!namaVal,
    !!univVal,
    !!jurVal,
    !!semVal,
    skillTags.length > 0,
    minatTags.length > 0,
    !!photoDataURL,
    !!cvData,
  ];

  const pct = Math.round(checks.filter(Boolean).length / checks.length * 100);

  // Update progress percentage di text UI (Mendukung ID lama ataupun selektor class baru)
  const pctEl  = document.getElementById('progressPct') || document.querySelector('.kelengkapan-persen, font[color] ~ div');
  const fillEl = document.getElementById('progressFill') || document.querySelector('.progress-bar-fill, [style*="width"]');
  
  // Fallback direct update jika text 0% di UI ingin ditembak langsung
  const text0Percent = Array.from(document.querySelectorAll('div, span')).find(el => el.textContent.trim() === '0%' || el.textContent.includes('%'));
  
  if (pctEl) pctEl.textContent = pct + '%';
  else if (text0Percent) text0Percent.textContent = pct + '%';
  
  if (fillEl) fillEl.style.width = pct + '%';

  const hint = document.getElementById('progressHint');
  if (!hint) return;
  if (pct === 100) {
    hint.textContent = '✓ Profil kamu sudah lengkap!';
    document.getElementById('lpBanner')?.classList.add('hidden');
  } else {
    const remaining = checks.filter(Boolean).length;
    hint.textContent = `${checks.length - remaining} data lagi untuk melengkapi profil`;
    document.getElementById('lpBanner')?.classList.remove('hidden');
  }
}

/* ════════════
    TAGS
════════════ */
function renderTags(type) {
  const arr    = type === 'skill' ? skillTags : minatTags;
  const listEl = document.getElementById(type + 'Tags') || document.getElementById(type + 'sArea') || document.querySelector(`.${type}-tags-container`);
  if (!listEl) return;

  listEl.innerHTML = arr.map((tag, i) => `
    <span class="tag-item" style="display:inline-flex; align-items:center; background:#f0f0f5; padding:4px 12px; margin:4px; border-radius:16px;">
      ${tag}
      ${isEditMode ? `<button type="button" class="tag-remove" data-type="${type}" data-index="${i}" style="border:none; background:none; margin-left:6px; cursor:pointer;">×</button>` : ''}
    </span>
  `).join('');

  listEl.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = e.target.getAttribute('data-type');
      const idx = parseInt(e.target.getAttribute('data-index'));
      removeTag(t, idx);
    });
  });

  updateProgress();
}

function addTag(type) {
  const input = document.getElementById(type + 'Input') || document.querySelector(`input[placeholder*="Contoh: ${type === 'skill' ? 'Python' : 'UI/UX'}"]`);
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const arr = type === 'skill' ? skillTags : minatTags;
  if (arr.includes(val)) { input.value = ''; return; }
  if (arr.length >= 15)  { if (typeof showToast === 'function') showToast('Maksimal 15 ' + type); return; }
  arr.push(val);
  input.value = '';
  renderTags(type);
}

function removeTag(type, idx) {
  if (type === 'skill') skillTags.splice(idx, 1);
  else                  minatTags.splice(idx, 1);
  renderTags(type);
}

window.addSuggestion = function(type, value) {
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
  if (file.type !== 'application/pdf') { if (typeof showToast === 'function') showToast('Hanya file PDF yang diterima'); input.value = ''; return; }
  if (file.size > 5 * 1024 * 1024)     { if (typeof showToast === 'function') showToast('Ukuran file maksimal 5MB'); input.value = ''; return; }

  cvData = { name: file.name, size: file.size, uploadedAt: new Date().toISOString() };

  const placeholder = document.getElementById('cvPlaceholder') || document.querySelector('.cv-placeholder-text') || document.querySelector('div[class*="upload-box"] p');
  if (placeholder) placeholder.style.display = 'none';
  
  const area = document.getElementById('cvUploadArea') || document.querySelector('div[class*="upload-box"]') || document.querySelector('div[onclick*="cvFileInput"]');
  if (area) {
    area.onclick = null;
    area.style.cursor = 'default';
  }

  const cvStatus = document.getElementById('cvStatus');
  if (cvStatus) cvStatus.style.display = 'flex';
  
  const fn = document.getElementById('cvFileName');
  const fm = document.getElementById('cvFileMeta');
  if (fn) fn.textContent = file.name;
  if (fm) fm.textContent = (file.size/1024).toFixed(0) + ' KB · PDF';

  if (typeof showToast === 'function') showToast('CV berhasil diunggah ✓');
  updateProgress();
}

/* ════════════
    EDIT MODE
════════════ */
window.toggleEditMode = function() {
  if (isEditMode) {
    doSave(false); 
  } else {
    isEditMode = true;
    applyEditMode();
  }
}

function applyEditMode() {
  const form  = document.getElementById('lpForm') || document.querySelector('form');
  const btn   = document.getElementById('editToggleBtn') || document.querySelector('button[class*="Edit"]');
  const label = document.getElementById('editToggleLabel') || btn;

  if (isEditMode) {
    if(form) form.classList.remove('view-mode');
    if(label) label.innerHTML = '<i class="fas fa-save"></i> Selesai & Simpan';
  } else {
    if(form) form.classList.add('view-mode');
    if(label) label.innerHTML = '<i class="fas fa-edit"></i> Edit';
  }
  renderTags('skill');
  renderTags('minat');
}

/* ════════════
    SAVE DATA TO FIREBASE (RESOLVED)
════════════ */
async function doSave(strict = true) {
  const nama        = getProfileElement('nama')?.value.trim()        || '';
  const universitas = getProfileElement('universitas')?.value.trim() || '';
  const jurusan     = getProfileElement('jurusan')?.value.trim()     || '';
  const semester    = getProfileElement('semester')?.value           || '';
  const ipk         = getProfileElement('ipk')?.value.trim()         || '';
  const pendidikan  = getProfileElement('pendidikan')?.value.trim()  || '';
  const pengalaman  = getProfileElement('pengalaman')?.value.trim()  || '';
  const prestasi    = getProfileElement('prestasi')?.value.trim()    || '';

  if (!nama) {
    if (strict && typeof showToast === 'function') showToast('Nama lengkap wajib diisi');
    hlField(getProfileElement('nama')?.id || 'nama');
    return false;
  }

  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const loggedInUser = users.find(u => u.isLoggedIn === true);
  
  // Ambil UID aman dari Firebase Auth atau fallback dari localStorage
  let uid = null;
  try {
    uid = firebase.auth().currentUser?.uid || loggedInUser?.id;
  } catch(e) {
    uid = loggedInUser?.id;
  }

  if (!uid) {
    if (typeof showToast === 'function') showToast('Sesi user tidak ditemukan. Silakan login kembali.');
    return false;
  }

  const profileData = {
    nama: nama,
    universitas,
    jurusan,
    semester,
    ipk,
    skills: [...skillTags],
    minats: [...minatTags],
    pendidikan,
    pengalaman,
    prestasi,
    cv: cvData,
    photoURL: photoDataURL
  };

  // 1. Simpan ke Firebase Database
  let sukses = false;
  try {
    sukses = await saveProfileToFirebase(uid, profileData);
  } catch (err) {
    console.error("Gagal save ke Firebase:", err);
  }

  if (sukses || !strict) { 
    // Jika Firebase sukses atau dipaksa dari trigger toggleEditMode
    const idx = users.findIndex(u => u.id === uid);
    if (idx !== -1) {
      users[idx].profile = profileData;
      users[idx].name = nama;
      localStorage.setItem('magnet_users', JSON.stringify(users));
    }
    
    if (typeof MagnetDB !== 'undefined') {
      MagnetDB.saveProfile({
        name: nama, universitas, jurusan, semester, ipk,
        skills: [...skillTags], minat: [...minatTags],
        pendidikan, pengalaman, prestasi, cv: cvData, avatar: photoDataURL
      });
    }

    if (typeof showToast === 'function') showToast('Profil berhasil disimpan ✓', 'success');
    isEditMode = false;
    applyEditMode();
    updateProgress();
    
    setTimeout(() => {
      window.location.href = 'profil.html';
    }, 1200);
    
    return true;
  } else {
    if (typeof showToast === 'function') showToast('Gagal menyimpan perubahan ke database.', 'error');
    return false;
  }
}

window.saveProfile = async function() {
  await doSave(true);
};

function hlField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  el.style.borderColor = 'var(--red)';
  setTimeout(() => el.style.borderColor = '', 2000);
}

/* ════════════
    LOAD DATA FROM FIREBASE (RESOLVED)
════════════ */
async function loadProfile() {
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const loggedInUser = users.find(u => u.isLoggedIn === true);
  
  let uid = null;
  try {
    uid = firebase.auth().currentUser?.uid || loggedInUser?.id;
  } catch(e) {
    uid = loggedInUser?.id;
  }

  if (!uid) {
    console.error("User UID tidak terdeteksi.");
    return;
  }

  // Pre-fill nama dari data autentikasi login terlebih dahulu
  const namaEl = getProfileElement('nama');
  if (namaEl && loggedInUser) namaEl.value = loggedInUser.name || '';

  try {
    const profile = await syncProfileFromFirebase(uid);

    if (profile) {
      if (namaEl) namaEl.value = profile.nama || profile.name || loggedInUser.name || '';
      
      const set = (id, val) => { const el = getProfileElement(id); if (el) el.value = val || ''; };
      set('universitas', profile.universitas);
      set('jurusan',     profile.jurusan);
      set('semester',    profile.semester);
      set('ipk',         profile.ipk);
      set('pendidikan',  profile.pendidikan);
      set('pengalaman',  profile.pengalaman);
      set('prestasi',    profile.prestasi);

      skillTags = Array.isArray(profile.skills) ? [...profile.skills] : [];
      minatTags = Array.isArray(profile.minats) ? [...profile.minats] : (Array.isArray(profile.minat) ? [...profile.minat] : []);

      if (profile.cv) {
        cvData = profile.cv;
        const placeholder = document.getElementById('cvPlaceholder') || document.querySelector('.cv-placeholder-text') || document.querySelector('div[class*="upload-box"] p');
        if (placeholder) placeholder.style.display = 'none';
        
        const area = document.getElementById('cvUploadArea') || document.querySelector('div[class*="upload-box"]');
        if (area) { area.onclick = null; area.style.cursor = 'default'; }
        
        const st = document.getElementById('cvStatus');
        if (st) st.style.display = 'flex';
      }

      const savedAvatar = profile.photoURL || profile.avatar || loggedInUser?.photoURL;
      if (savedAvatar) {
        photoDataURL = savedAvatar;
        applyPhotoPreview(savedAvatar);
      }
    }
  } catch (error) {
    console.error("Gagal melakukan sinkronisasi dari Firebase, menggunakan local data:", error);
    // Fallback jika database offline
    if (loggedInUser?.profile) {
      const p = loggedInUser.profile;
      if (namaEl) namaEl.value = p.nama || loggedInUser.name || '';
      const set = (id, val) => { const el = getProfileElement(id); if (el) el.value = val || ''; };
      set('universitas', p.universitas);
      set('jurusan', p.jurusan);
    }
  }

  // Cek parameter mode edit
  const params = new URLSearchParams(window.location.search);
  isEditMode = params.get('edit') === '1' || document.getElementById('editToggleBtn')?.classList.contains('editing');
  applyEditMode();
  updateProgress();
}

/* ════════════
    INITIALIZATION
════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof MagnetDB !== 'undefined') {
    if (typeof MagnetDB.requireMahasiswaAuth === 'function') MagnetDB.requireMahasiswaAuth();
  }

  loadProfile();
  initPhotoSection();

  // Listener input skill & minat
  const si = document.getElementById('skillInput') || document.querySelector('input[placeholder*="Python"]');
  const mi = document.getElementById('minatInput') || document.querySelector('input[placeholder*="UI/UX"]');
  if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skill'); } });
  if (mi) mi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('minat'); } });

  // Listener tombol plus (+) manual pada kolom tags
  const plusSkill = document.querySelector('input[placeholder*="Python"] ~ button, .plus-skill-btn');
  const plusMinat = document.querySelector('input[placeholder*="UI/UX"] ~ button, .plus-minat-btn');
  if (plusSkill) plusSkill.addEventListener('click', () => addTag('skill'));
  if (plusMinat) plusMinat.addEventListener('click', () => addTag('minat'));

  // Ambil semua element input untuk live update progress bar
  ['nama','universitas','jurusan','semester','ipk'].forEach(id => {
    const el = getProfileElement(id);
    if (el) { 
      el.addEventListener('input', updateProgress); 
      el.addEventListener('change', updateProgress); 
    }
  });
  
  // Binding event click utama pada tombol "Simpan Profil" paling bawah di UI
  const saveBtn = document.querySelector('button[class*="Simpan"], .btn-simpan-profil') || document.evaluate("//button[contains(., 'Simpan Profil')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      doSave(true);
    });
  }
  
  // Binding event click pada tombol "Edit" di kanan atas UI
  const editTopBtn = document.querySelector('button[class*="Edit"], .btn-edit-top') || document.evaluate("//button[contains(., 'Edit')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (editTopBtn) {
    editTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleEditMode();
    });
  }
});