import { saveProfileToFirebase, syncProfileFromFirebase } from './auth-firebase.js';

/* ═══════════════════════════════════════════════════════════
    MAGNET – LENGKAPI-PROFIL.JS (FIREBASE INTEGRATED)
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
  // Ambil data user aktif dari localStorage magnet_users
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const loggedInUser = users.find(u => u.isLoggedIn === true);
  return loggedInUser?.name?.charAt(0).toUpperCase() || '?';
}

function initPhotoSection() {
  const initial = document.getElementById('photoInitial');
  if (initial) initial.textContent = _getInitial();
}

/* ════════════
   PROGRESS
════════════ */
function updateProgress() {
  console.log('updateProgress dipanggil');
  
  // Mengambil data nama & email real-time dari field input / localStorage terkini
  const namaVal = document.getElementById('f-nama')?.value?.trim();
  const univVal = document.getElementById('f-universitas')?.value?.trim();
  const jurVal  = document.getElementById('f-jurusan')?.value?.trim();
  const semVal  = document.getElementById('f-semester')?.value;

  const checks = [
    !!namaVal,
    !!univVal,
    !!jurVal,
    !!semVal,
    skillTags.length > 0,
    minatTags.length > 0,
    !!photoDataURL, // Menghitung kelengkapan foto profil
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
      ${isEditMode ? `<button type="button" class="tag-remove" data-type="${type}" data-index="${i}">×</button>` : ''}
    </span>
  `).join('');

  // Re-attach event listener secara aman untuk tombol hapus tag
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

// Ekspos fungsi ke global scope jika dipanggil langsung dari HTML suggestions inline onclick
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
window.toggleEditMode = function() {
  if (isEditMode) {
    doSave(false); 
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
    if(form) form.classList.remove('view-mode');
    if(btn) btn.classList.add('editing');
    if(label) label.textContent = 'Selesai & Simpan';
    if (!cvData) {
      const area = document.getElementById('cvUploadArea');
      if (area) {
        area.style.display   = '';
        area.style.cursor    = 'pointer';
        area.onclick = () => document.getElementById('cvFileInput').click();
      }
    }
  } else {
    if(form) form.classList.add('view-mode');
    if(btn) btn.classList.remove('editing');
    if(label) label.textContent = 'Edit';
  }
  renderTags('skill');
  renderTags('minat');
}

/* ════════════
   SAVE DATA TO FIREBASE (REAL-TIME FIX)
════════════ */
async function doSave(strict = true) {
  const nama        = document.getElementById('f-nama')?.value.trim()        || '';
  const universitas = document.getElementById('f-universitas')?.value.trim() || '';
  const jurusan     = document.getElementById('f-jurusan')?.value.trim()     || '';
  const semester    = document.getElementById('f-semester')?.value           || '';
  const ipk         = document.getElementById('f-ipk')?.value.trim()         || '';
  const pendidikan  = document.getElementById('f-pendidikan')?.value.trim()  || '';
  const pengalaman  = document.getElementById('f-pengalaman')?.value.trim()  || '';
  const prestasi    = document.getElementById('f-prestasi')?.value.trim()    || '';

  if (!nama) {
    if (strict) showToast('Nama lengkap wajib diisi');
    hlField('f-nama');
    return false;
  }

  // Ambil UID dari user aktif di local storage yang sinkron dengan Firebase Auth
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const loggedInUser = users.find(u => u.isLoggedIn === true);
  const uid = loggedInUser?.id || firebase.auth().currentUser?.uid;

  if (!uid) {
    showToast('Sesi user tidak ditemukan. Silakan login kembali.');
    return false;
  }

  // Membuat struktur data profil yang SINKRON & VALID untuk disimpan ke Firebase
  const profileData = {
    nama: nama,
    universitas,
    jurusan,
    semester,
    ipk,
    skills: [...skillTags],
    minats: [...minatTags], // FIX: Menggunakan minats (pakai s) agar sesuai syncProfile
    pendidikan,
    pengalaman,
    prestasi,
    cv: cvData,
    photoURL: photoDataURL // FIX: Menggunakan photoURL bukan avatar agar ter-render di profil.html
  };

  // 1. Simpan ke Firebase Database secara real-time
  const sukses = await saveProfileToFirebase(uid, profileData);

  if (sukses) {
    // 2. Perbarui cadangan lokal magnet_users agar halaman profil.html mendeteksi perubahan seketika
    const idx = users.findIndex(u => u.id === uid);
    if (idx !== -1) {
      users[idx].profile = profileData;
      users[idx].name = nama;
      localStorage.setItem('magnet_users', JSON.stringify(users));
    }
    
    // Sinkronisasi data mock MagnetDB lama sebagai fallback agar sistem lama tidak error
    if (typeof MagnetDB !== 'undefined') {
      MagnetDB.saveProfile({
        name: nama, universitas, jurusan, semester, ipk,
        skills: [...skillTags], minat: [...minatTags],
        pendidikan, pengalaman, prestasi, cv: cvData, avatar: photoDataURL
      });
    }

    showToast('Profil berhasil disimpan ke database ✓', 'success');
    isEditMode = false;
    applyEditMode();
    updateProgress();
    
    // Redirect otomatis ke halaman profil utama setelah berhasil menyimpan agar perubahan langsung terlihat
    setTimeout(() => {
      window.location.href = 'profil.html';
    }, 1200);
    
    return true;
  } else {
    showToast('Gagal menyimpan perubahan ke database.', 'error');
    return false;
  }
}

// Binding fungsi save ke window object agar bisa diakses button HTML
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
   LOAD DATA FROM FIREBASE (REAL-TIME FIX)
════════════ */
async function loadProfile() {
  // 1. Dapatkan user logged-in dari penyimpanan lokal browser
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const loggedInUser = users.find(u => u.isLoggedIn === true);
  const uid = loggedInUser?.id || firebase.auth().currentUser?.uid;

  if (!uid) {
    console.error("User UID tidak terdeteksi.");
    return;
  }

  const namaEl = document.getElementById('f-nama');
  if (namaEl && loggedInUser) namaEl.value = loggedInUser.name || '';

  try {
    // 2. AMBIL DATA LANGSUNG DARI FIREBASE SECARA REAL-TIME
    const profile = await syncProfileFromFirebase(uid);

    if (profile) {
      // 3. Masukkan data profil Firebase ke dalam input field HTML form secara real-time
      if (namaEl) namaEl.value = profile.nama || profile.name || loggedInUser.name || '';
      
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
      set('f-universitas', profile.universitas);
      set('f-jurusan',     profile.jurusan);
      set('f-semester',    profile.semester);
      set('f-ipk',         profile.ipk);
      set('f-pendidikan',  profile.pendidikan);
      set('f-pengalaman',  profile.pengalaman);
      set('f-prestasi',    profile.prestasi);

      // Sinkronisasi Array Tag ke variabel global
      skillTags = Array.isArray(profile.skills) ? [...profile.skills] : [];
      minatTags = Array.isArray(profile.minats) ? [...profile.minats] : (Array.isArray(profile.minat) ? [...profile.minat] : []);

      // Sinkronisasi File CV
      if (profile.cv) {
        cvData = profile.cv;
        const placeholder = document.getElementById('cvPlaceholder');
        if (placeholder) placeholder.style.display = 'none';
        const area = document.getElementById('cvUploadArea');
        if (area) { area.onclick = null; area.style.cursor = 'default'; }
        const st = document.getElementById('cvStatus');
        if (st)  { st.style.display = 'flex'; }
        const fn = document.getElementById('cvFileName');
        const fm = document.getElementById('cvFileMeta');
        if (fn) fn.textContent = profile.cv.name;
        if (fm) fm.textContent = (profile.cv.size/1024).toFixed(0) + ' KB · PDF · Tersimpan';
      }

      // 4. SINKRONISASI FOTO PROFIL REAL-TIME
      const savedAvatar = profile.photoURL || profile.avatar || loggedInUser?.photoURL;
      if (savedAvatar) {
        photoDataURL = savedAvatar;
        applyPhotoPreview(savedAvatar);
      }
    }
  } catch (error) {
    console.error("Gagal melakukan sinkronisasi real-time dari Firebase:", error);
  }

  // Cek parameter mode edit (?edit=1)
  const params = new URLSearchParams(window.location.search);
  isEditMode   = params.get('edit') === '1';
  applyEditMode();
  updateProgress();

  // Scroll smooth ke anchor hash jika ada target spesifik
  const hash = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}

/* ════════════
   INITIALIZATION
════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof MagnetDB !== 'undefined') {
    MagnetDB.requireMahasiswaAuth();
    if (typeof restoreSidebarState === 'function') restoreSidebarState();
    
    // Update badge status lamaran bawaan aplikasi Anda
    const apps  = MagnetDB.getUserApplications();
    const badge = document.getElementById('nav-lamaran-badge');
    if (badge) {
      if (apps.length > 0) { badge.textContent = apps.length; badge.style.display = 'inline-flex'; }
      else badge.style.display = 'none';
    }
  }

  // Jalankan pemuatan data profil terintegrasi Firebase
  loadProfile();
  initPhotoSection();

  // Event listener tombol enter pada input skill & minat
  const si = document.getElementById('skillInput');
  const mi = document.getElementById('minatInput');
  if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skill'); } });
  if (mi) mi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag('minat'); } });

  // Update progress bar secara langsung saat user mengetik isi form
  ['f-nama','f-universitas','f-jurusan','f-semester','f-ipk'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateProgress); el.addEventListener('change', updateProgress); }
  });

  // Drag & drop area untuk berkas CV
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