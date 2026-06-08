/* ═══════════════════════════════════════════════════════════
   MAGNET – LAMAR.JS
════════════════════════════════════════════════════════════ */

import { getJobById } from '../Page_Perusahaan/firebase-company.js';
import { saveApplicationToFirebase } from './firebase-mahasiswa.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// KONEKSI SUPABASE
const supabaseUrl = 'https://nwmlmcgxkfhwurpztycz.supabase.co';
const supabaseKey = 'sb_publishable_HixUc0iM1zAymTOsVLtEyg_VzIOkxBB';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentJob = null;
const docs = { cv: null, surat: null, porto: null };

// === TAMBAHKAN FUNGSI INI ===
function showToast(msg, dur = 3000) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ════════════════════
   PROFILE GATE (sama seperti kode Anda, tidak diubah)
════════════════════ */
function checkProfileComplete() {
  const user    = MagnetDB.getSession();
  const profile = MagnetDB.getProfile();
  const REQUIRED_FIELDS = [
    { label: 'Nama lengkap',           value: user?.name },
    { label: 'Nomor telepon',          value: user?.phone },
    { label: 'Nama universitas',       value: profile?.universitas },
    { label: 'Program studi / jurusan', value: profile?.jurusan },
    { label: 'Semester aktif',         value: profile?.semester },
  ];
  const missing = REQUIRED_FIELDS.filter(f => !f.value?.toString().trim());
  const allChecks = [
    !!user?.name, !!user?.email, !!user?.phone,
    !!(profile?.universitas), !!(profile?.jurusan), !!(profile?.semester),
    !!(profile?.skills?.length), !!(profile?.minat?.length), !!(profile?.cv),
  ];
  const pct = Math.round((allChecks.filter(Boolean).length / allChecks.length) * 100);
  const fillEl = document.getElementById('gateProgressFill');
  const pctEl  = document.getElementById('gateProgressPct');
  if (fillEl) fillEl.style.width = pct + '%';
  if (pctEl)  pctEl.textContent  = pct + '%';
  if (missing.length === 0) return true;
  document.getElementById('pageProfileGate').style.display = 'block';
  document.getElementById('pageStep1').style.display        = 'none';
  const list = document.getElementById('gateMissingList');
  if (list) {
    list.innerHTML = missing.map(f => `
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        ${f.label} belum diisi
      </li>
    `).join('');
  }
  return false;
}

/* ════════════════════
   UPLOAD HANDLERS (sama seperti kode Anda)
════════════════════ */
function triggerUpload(inputId) {
  document.getElementById(inputId)?.click();
}

function handleUpload(type, input) {
  const file = input.files[0];
  if (!file) return;
  const maxMB = type === 'porto' ? 10 : 5;
  if (file.size > maxMB * 1024 * 1024) {
    showToast(`Ukuran file maksimal ${maxMB}MB`);
    input.value = '';
    return;
  }
  docs[type] = { name: file.name, size: file.size, type: file.type };
  const area        = document.getElementById(type === 'cv' ? 'cvArea' : type === 'surat' ? 'suratArea' : 'portoArea');
  const status      = document.getElementById(type + 'Status');
  const nameEl      = document.getElementById(type + 'Name');
  const metaEl      = document.getElementById(type + 'Meta');
  const placeholder = document.getElementById(type + 'Placeholder');
  if (area)        area.style.display        = 'none';
  if (status)      status.style.display      = 'flex';
  if (placeholder) placeholder.style.display = 'none';
  if (nameEl)      nameEl.textContent        = file.name;
  if (metaEl)      metaEl.textContent        = (file.size / 1024).toFixed(0) + ' KB';
  updateChecklist();
  showToast(type === 'cv' ? 'CV berhasil diunggah ✓' : 'File berhasil diunggah ✓');
}

function removeFile(type) {
  docs[type] = null;
  document.getElementById(type === 'cv' ? 'cvFile' : type === 'surat' ? 'suratFile' : 'portoFile').value = '';
  const areaId = type === 'cv' ? 'cvArea' : type === 'surat' ? 'suratArea' : 'portoArea';
  const area   = document.getElementById(areaId);
  const status = document.getElementById(type + 'Status');
  if (area)   area.style.display   = '';
  if (status) status.style.display = 'none';
  updateChecklist();
}

function useSavedCV() {
  const profile = MagnetDB.getProfile();
  if (!profile?.cv) return;
  docs.cv = profile.cv;
  document.getElementById('cvArea').style.display   = 'none';
  document.getElementById('cvStatus').style.display = 'flex';
  document.getElementById('cvName').textContent      = profile.cv.name;
  document.getElementById('cvMeta').textContent      = (profile.cv.size / 1024).toFixed(0) + ' KB · dari profil';
  document.getElementById('cvTip').style.display     = 'none';
  updateChecklist();
  showToast('CV dari profil digunakan ✓');
}

function updateCharCount() {
  const val = document.getElementById('catatanInput')?.value || '';
  const el  = document.getElementById('charCount');
  if (el) el.textContent = val.length;
}

function updateChecklist() {
  const list   = document.getElementById('lmChecklist');
  const btn    = document.getElementById('submitBtn');
  if (!list || !btn) return;
  const hasCv   = !!docs.cv;
  const checkEl = document.getElementById('checkCV');
  if (hasCv) {
    checkEl.classList.add('ok');
    checkEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> CV sudah diunggah`;
  } else {
    checkEl.classList.remove('ok');
    checkEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> CV belum diunggah (wajib)`;
  }
  btn.disabled = !hasCv;
}

// Fungsi rahasia untuk menerbangkan PDF ke Supabase
async function uploadToSupabase(file, folderName) {
  // Buat nama file unik agar tidak bentrok
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${folderName}/${fileName}`;

  // Upload ke bucket 'lamaran.pdf'
  const { data, error } = await supabase.storage
    .from('lamaran.pdf') 
    .upload(filePath, file);

  if (error) throw error;

  // Dapatkan URL publik yang bisa didownload
  const { data: urlData } = supabase.storage
    .from('lamaran.pdf')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

async function submitLamaran() {
  if (!docs.cv) {
    showToast('Upload CV terlebih dahulu (wajib)');
    document.getElementById('cvArea')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!currentJob) return;

  const catatan   = document.getElementById('catatanInput')?.value.trim() || '';
  const portoLink = document.getElementById('portoLink')?.value.trim() || '';

  const session = MagnetDB.getSession();
  if (!session) {
    showToast('Sesi tidak ditemukan, silakan login ulang.');
    return;
  }

  // Ubah tombol jadi loading
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.innerHTML = 'Mengunggah File...';
  submitBtn.disabled = true;

  try {
    // 1. Ambil file fisik dari input HTML
    const cvFile = document.getElementById('cvFile').files[0];
    const suratFile = document.getElementById('suratFile').files[0];
    const portoFile = document.getElementById('portoFile').files[0];

    let cvUrl = null, suratUrl = null, portoUrl = null;

    // 2. Upload file satu per satu ke Supabase (jika ada file fisiknya)
    if (cvFile) {
      cvUrl = await uploadToSupabase(cvFile, 'cv');
    }
    if (suratFile) {
      submitBtn.innerHTML = 'Mengunggah Surat...';
      suratUrl = await uploadToSupabase(suratFile, 'surat');
    }
    if (portoFile) {
      submitBtn.innerHTML = 'Mengunggah Portofolio...';
      portoUrl = await uploadToSupabase(portoFile, 'porto');
    }

    submitBtn.innerHTML = 'Menyimpan Lamaran...';

// 3. Gabungkan link URL dari Supabase ke dalam data dokumen
    const firebaseApp = {
      userId: session.id,
      userName: session.name,
      userEmail: session.email,
      jobId: currentJob.id,
      jobTitle: currentJob.title,
      companyId: currentJob.companyId,
      companyName: currentJob.companyName || currentJob.company || 'Perusahaan',
      companyShort: currentJob.companyShort || (currentJob.companyName ? currentJob.companyName.charAt(0) : '?'),
      logoColor: currentJob.logoColor || '#3B2A8E',
      status: 'terkirim',
      appliedAt: new Date().toISOString(),
      documents: {
        // 🔥 PERBAIKAN: Tambahkan || null di akhir setiap url agar Firebase tidak marah
        cv: docs.cv ? { name: docs.cv.name, size: docs.cv.size, url: cvUrl || docs.cv.url || null } : null,
        surat: docs.surat ? { name: docs.surat.name, size: docs.surat.size, url: suratUrl || null } : null,
        porto: docs.porto ? { name: docs.porto.name, size: docs.porto.size, url: portoUrl || null } : null,
        portoLink: portoLink || null,
        catatan: catatan || null,
      }
    };

    // 4. Simpan ke Firebase Realtime Database
    await saveApplicationToFirebase(firebaseApp);
    console.log('Lamaran dan file PDF berhasil dikirim!');

    // 5. Tampilkan halaman sukses
    document.getElementById('pageStep1').style.display   = 'none';
    document.getElementById('pageSuccess').style.display = 'block';
    document.getElementById('successCompany').textContent = currentJob.companyName || currentJob.company;

    document.getElementById('step1').classList.add('done');
    document.getElementById('step2').classList.add('done');
    document.getElementById('step3').classList.add('active', 'done');

    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error('Gagal upload atau simpan:', err);
    showToast('Lamaran gagal dikirim: ' + err.message);
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
      Kirim Lamaran
    `;
    submitBtn.disabled = false;
  }
}

/* ════════════════════
   INIT
════════════════════ */
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
    showToast('ID lowongan tidak ditemukan');
    setTimeout(() => window.location.href = 'lowongan.html', 1500);
    return;
  }

  const job = await getJobById(id);
  if (!job) {
    showToast('Lowongan tidak ditemukan');
    setTimeout(() => window.location.href = 'lowongan.html', 1500);
    return;
  }

  currentJob = job;

  // Isi summary card
  const logoEl    = document.getElementById('lmJobLogo');
  const titleEl   = document.getElementById('lmJobTitle');
  const companyEl = document.getElementById('lmJobCompany');
  const linkEl    = document.getElementById('lmJobLink');

  const companyName = job.companyName || job.company || 'Perusahaan';
  const companyShort = job.companyShort || (companyName ? companyName.charAt(0) : '?');
  const logoColor = job.logoColor || '#3B2A8E';

  if (logoEl) { logoEl.textContent = companyShort; logoEl.style.color = logoColor; logoEl.style.borderColor = logoColor + '40'; }
  if (titleEl) titleEl.textContent = job.title;
  if (companyEl) companyEl.textContent = companyName;
  if (linkEl) linkEl.href = `detail-lowongan.html?id=${job.id}`;

  // Cek kelengkapan profil
  if (!checkProfileComplete()) return;

  // Cek sudah pernah melamar
  if (MagnetDB.hasApplied(job.id)) {
    showToast('Kamu sudah pernah melamar posisi ini');
    setTimeout(() => window.location.href = 'lamaran.html', 2000);
    return;
  }

  // Tampilkan form lamaran
  document.getElementById('pageStep1').style.display = 'block';

  const profile = MagnetDB.getProfile();
  if (profile?.cv) {
    document.getElementById('cvTip').style.display = 'flex';
  }

  updateChecklist();

  // Drag & drop
  ['cvArea', 'suratArea', 'portoArea'].forEach(areaId => {
    const area     = document.getElementById(areaId);
    const typeMap  = { cvArea: 'cv', suratArea: 'surat', portoArea: 'porto' };
    const inputMap = { cvArea: 'cvFile', suratArea: 'suratFile', portoArea: 'portoFile' };
    if (!area) return;
    area.addEventListener('dragover',  e => { e.preventDefault(); area.style.borderColor = 'var(--blue-primary)'; });
    area.addEventListener('dragleave', () => area.style.borderColor = '');
    area.addEventListener('drop', e => {
      e.preventDefault(); area.style.borderColor = '';
      const file  = e.dataTransfer.files[0];
      if (!file) return;
      const input = document.getElementById(inputMap[areaId]);
      try { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; } catch (err) {}
      handleUpload(typeMap[areaId], input);
    });
  });
});

// Ekspos fungsi ke global
window.triggerUpload = triggerUpload;
window.handleUpload = handleUpload;
window.removeFile = removeFile;
window.useSavedCV = useSavedCV;
window.updateCharCount = updateCharCount;
window.submitLamaran = submitLamaran;