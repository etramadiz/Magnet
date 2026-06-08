// detail-pelamar.js - lamaran dari Firebase, profil dari localStorage
// detail-pelamar.js - lamaran dari Firebase, profil dari localStorage (DIUBAH KE FIREBASE)
import { getApplicationById, updateApplicationStatus } from './firebase-company.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { db } from '../Page_Login_Register/firebase-config.js';

// ========== FUNGSI TOAST GLOBAL ==========
function showToast(message) {
  const toastEl = document.getElementById('toast');
  if (toastEl) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
  } else {
    alert(message);
  }
}
window.showToast = showToast;
// =========================================

// Pastikan hanya SATU kali deklarasi
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const appId = urlParams.get('appId');

if (!userId || !appId) {
  alert('Parameter tidak lengkap.');
  window.location.href = 'lihat-pelamar.html';
}

async function loadData() {
  let application = await getApplicationById(appId);
  if (!application) {
    alert('Data lamaran tidak ditemukan di database.');
    window.location.href = 'lihat-pelamar.html';
    return;
  }

  // PERBAIKAN: Ambil data mahasiswa langsung dari Firebase
  const profileSnap = await get(ref(db, `mahasiswa/${userId}`));
  let profile = {};
  if (profileSnap.exists()) {
    profile = profileSnap.val();
  }

  // Masukkan data dari Firebase ke HTML
  document.getElementById('detailName').textContent = profile.name || application.userName || 'Tidak diketahui';
  document.getElementById('universitas').textContent = profile.universitas || '-';
  document.getElementById('jurusan').textContent = profile.jurusan || '-';
  document.getElementById('statusMhs').textContent = profile.semester ? `Semester ${profile.semester}` : '-';

  // MENGAMBIL FOTO PROFIL MAHASISWA
  const avatarDiv = document.querySelector('.detail-avatar');
  if (profile.fotoUrl) {
    // Jika ada foto, ganti SVG dengan <img>
    avatarDiv.innerHTML = `<img src="${profile.fotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    avatarDiv.style.border = 'none'; // hapus border jika perlu
  } else {
    // Jika tidak ada foto, biarkan SVG bawaan (atau inisial nama)
  }
  
  // --- Bagian dokumen CV dan Portofolio di bawah ini tetap sama ---
const docs = application.documents || {};
  
// ==========================================
  // 1. BAGIAN CV
  // ==========================================
  document.getElementById('cvName').textContent = docs.cv?.name || 'Tidak ada file';
  const cvBuka = document.getElementById('cvBuka');
  const cvUnduh = document.getElementById('cvUnduh');

  if (docs.cv?.url) {
    if (cvBuka) { 
      cvBuka.href = docs.cv.url; 
      cvBuka.style.display = 'inline-block'; 
    }
    if (cvUnduh) { 
      // Trik Supabase: Tambahkan ?download= di akhir URL agar otomatis terunduh
      cvUnduh.href = docs.cv.url + '?download='; 
      cvUnduh.style.display = 'inline-block'; 
    }
  } else {
    // Sembunyikan tombol Buka & Unduh kalau mahasiswanya tidak upload file
    if (cvBuka) cvBuka.style.display = 'none';
    if (cvUnduh) cvUnduh.style.display = 'none';
  }

  // ==========================================
  // 2. BAGIAN SURAT PENGANTAR
  // ==========================================
  document.getElementById('suratName').textContent = docs.surat?.name || 'Tidak ada file';
  const suratBuka = document.getElementById('suratBuka');
  const suratUnduh = document.getElementById('suratUnduh');

  if (docs.surat?.url) {
    if (suratBuka) { 
      suratBuka.href = docs.surat.url; 
      suratBuka.style.display = 'inline-block'; 
    }
    if (suratUnduh) { 
      suratUnduh.href = docs.surat.url + '?download='; 
      suratUnduh.style.display = 'inline-block'; 
    }
  } else {
    if (suratBuka) suratBuka.style.display = 'none';
    if (suratUnduh) suratUnduh.style.display = 'none';
  }

// ==========================================
  // 3. BAGIAN PORTOFOLIO (FILE & LINK BISA MUNCUL BERSAMAAN)
  // ==========================================
  const portoFileBox = document.getElementById('portoFileBox');
  const portoNameEl = document.getElementById('portoName');
  const portoBuka = document.getElementById('portoBuka');
  const portoUnduh = document.getElementById('portoUnduh');

  const portoLinkBox = document.getElementById('portoLinkBox');
  const portoLinkText = document.getElementById('portoLinkText');
  const portoLinkBtn = document.getElementById('portoLinkBtn');

  // Cek & Atur Kotak FILE Portofolio
  if (docs.porto?.url) {
    portoFileBox.style.display = 'flex';
    portoNameEl.textContent = docs.porto.name;
    if (portoBuka) { portoBuka.href = docs.porto.url; portoBuka.style.display = 'inline-block'; }
    if (portoUnduh) { portoUnduh.href = docs.porto.url + '?download='; portoUnduh.style.display = 'inline-block'; }
  } else {
    portoFileBox.style.display = 'none'; // Sembunyikan kalau gak upload file
  }

  // Cek & Atur Kotak LINK Portofolio
  if (docs.portoLink) {
    portoLinkBox.style.display = 'flex';
    portoLinkText.textContent = docs.portoLink;
    if (portoLinkBtn) {
      portoLinkBtn.href = docs.portoLink.startsWith('http') ? docs.portoLink : 'https://' + docs.portoLink;
    }
  } else {
    portoLinkBox.style.display = 'none'; // Sembunyikan kalau gak isi link
  }

  // Tampilkan pesan default jika pelamar benar-benar tidak melampirkan keduanya
  if (!docs.porto?.url && !docs.portoLink) {
    portoFileBox.style.display = 'flex';
    portoNameEl.textContent = 'Tidak melampirkan portofolio';
    if (portoBuka) portoBuka.style.display = 'none';
    if (portoUnduh) portoUnduh.style.display = 'none';
  }
}

async function updateStatus(newStatus) {
  const catatan = document.getElementById('catatan').value;
  try {
    await updateApplicationStatus(window.currentAppId, newStatus, catatan);
    window.showToast(`Pelamar ${newStatus === 'Diterima' ? 'diterima' : 'ditolak'}.${catatan ? ' Catatan: ' + catatan : ''}`);
    setTimeout(() => {
      window.location.href = 'lihat-pelamar.html';
    }, 1500);
  } catch (error) {
    alert('Gagal mengupdate status: ' + error.message);
  }
}

// Ekspor fungsi ke global agar bisa dipanggil dari HTML onclick
window.updateStatus = updateStatus;

// Jalankan
loadData();