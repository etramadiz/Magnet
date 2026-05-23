/* ═══════════════════════════════════════════════════════════
   MAGNET – LENGKAPI-PROFIL.JS
════════════════════════════════════════════════════════════ */

let skillTags  = [];
let minatTags  = [];
let cvData     = null;
let isEditMode = false;
let photoDataURL = null; // base64 foto profil

/* ════════════════════
   PHOTO UPLOAD
════════════════════ */
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
  const user = MagnetDB.getSession();
  return user?.name?.charAt(0).toUpperCase() || '?';
}

function initPhotoSection() {
  const initial = document.getElementById('photoInitial');
  if (initial) initial.textContent = _getInitial();
  // Restore saved avatar
  const user    = MagnetDB.getSession();
  const profile = MagnetDB.getProfile();
  const saved   = user?.avatar || profile?.avatar || null;
  if (saved) { photoDataURL = saved; applyPhotoPreview(saved); }
}



/* ════════════
   PROGRESS
════════════ */
function updateProgress() {
  const user = MagnetDB.getSession();
  const checks = [
    !!user?.name,
    !!user?.email,
    !!user?.phone,
    !!(document.getElementById('f-universitas')?.value?.trim()),
    !!(document.getElementById('f-jurusan')?.value?.trim()),
    !!(document.getElementById('f-semester')?.value),
    skillTags.length > 0,
    minatTags.length > 0,
    !!cvData,
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
function doSave(strict = true) {
  const nama        = document.getElementById('f-nama')?.value.trim()        || '';
  const universitas = document.getElementById('f-universitas')?.value.trim() || '';
  const jurusan     = document.getElementById('f-jurusan')?.value.trim()     || '';
  const semester    = document.getElementById('f-semester')?.value            || '';
  const ipk         = document.getElementById('f-ipk')?.value.trim()         || '';
  const pendidikan  = document.getElementById('f-pendidikan')?.value.trim()  || '';
  const pengalaman  = document.getElementById('f-pengalaman')?.value.trim()  || '';
  const prestasi    = document.getElementById('f-prestasi')?.value.trim()    || '';

  // Validasi hanya nama yang wajib ada
  if (!nama) {
    if (strict) showToast('Nama lengkap wajib diisi');
    hlField('f-nama');
    return false;
  }

  const result = MagnetDB.saveProfile({
    name: nama, universitas, jurusan, semester, ipk,
    skills: [...skillTags],
    minat:  [...minatTags],
    pendidikan, pengalaman, prestasi,
    cv: cvData,
    avatar: photoDataURL,
  });

  if (!result.ok) { showToast(result.message); return false; }

  showToast('Profil berhasil disimpan ✓');
  isEditMode = false;
  applyEditMode();
  updateProgress();
  return true;
}

// Tombol "Simpan Profil" tetap ada sebagai cadangan
function saveProfile() {
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
function loadProfile() {
  const user    = MagnetDB.getSession();
  const profile = MagnetDB.getProfile();

  // Pre-fill nama dari akun
  const namaEl = document.getElementById('f-nama');
  if (namaEl) namaEl.value = user?.name || '';

  if (profile) {
    if (namaEl) namaEl.value = profile.name || user?.name || '';
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('f-universitas', profile.universitas);
    set('f-jurusan',     profile.jurusan);
    set('f-semester',    profile.semester);
    set('f-ipk',         profile.ipk);
    set('f-pendidikan',  profile.pendidikan);
    set('f-pengalaman',  profile.pengalaman);
    set('f-prestasi',    profile.prestasi);

    skillTags = Array.isArray(profile.skills) ? [...profile.skills] : [];
    minatTags = Array.isArray(profile.minat)  ? [...profile.minat]  : [];

    if (profile.cv) {
      cvData = profile.cv;
      document.getElementById('cvPlaceholder').style.display = 'none';
      const area = document.getElementById('cvUploadArea');
      if (area) { area.onclick = null; area.style.cursor = 'default'; }
      const st = document.getElementById('cvStatus');
      if (st)  { st.style.display = 'flex'; }
      const fn = document.getElementById('cvFileName');
      const fm = document.getElementById('cvFileMeta');
      if (fn) fn.textContent = profile.cv.name;
      if (fm) fm.textContent = (profile.cv.size/1024).toFixed(0) + ' KB · PDF · Tersimpan';
    }
  }

  // URL param ?edit=1 atau belum ada profil → langsung edit mode
  const params = new URLSearchParams(window.location.search);
  isEditMode   = params.get('edit') === '1' || !profile;
  applyEditMode();
  updateProgress();

  // Scroll ke anchor kalau ada (#sect-xxx)
  const hash = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  if (MagnetDB.isProfileComplete()) {
    document.getElementById('lpBanner')?.classList.add('hidden');
  }
}

/* ════════════
   INIT
════════════ */
document.addEventListener('DOMContentLoaded', () => {
  MagnetDB.requireMahasiswaAuth();
  restoreSidebarState();

  // Update badge Status Lamaran
  const apps  = MagnetDB.getUserApplications();
  const badge = document.getElementById('nav-lamaran-badge');
  if (badge) {
    if (apps.length > 0) { badge.textContent = apps.length; badge.style.display = 'inline-flex'; }
    else badge.style.display = 'none';
  }

  loadProfile();
  initPhotoSection();

  // Enter key untuk tag input
  const si = document.getElementById('skillInput');
  const mi = document.getElementById('minatInput');
  if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skill'); } });
  if (mi) mi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('minat'); } });

  // Live progress update
  ['f-nama','f-universitas','f-jurusan','f-semester','f-ipk'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateProgress); el.addEventListener('change', updateProgress); }
  });

  // Drag & drop CV
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
});