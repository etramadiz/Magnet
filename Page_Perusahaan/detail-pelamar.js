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

  // --- Bagian dokumen CV dan Portofolio di bawah ini tetap sama ---
const docs = application.documents || {};
  
  // Ubah CV menjadi link jika URL-nya ada
  const cvEl = document.getElementById('cvName');
  if (docs.cv?.url) {
    cvEl.innerHTML = `<a href="${docs.cv.url}" target="_blank" style="color:var(--blue-primary);text-decoration:underline">${docs.cv.name}</a>`;
  } else {
    cvEl.textContent = docs.cv?.name || 'Tidak ada file';
  }

  // Ubah Surat menjadi link jika URL-nya ada
  const suratEl = document.getElementById('suratName');
  if (docs.surat?.url) {
    suratEl.innerHTML = `<a href="${docs.surat.url}" target="_blank" style="color:var(--blue-primary);text-decoration:underline">${docs.surat.name}</a>`;
  } else {
    suratEl.textContent = docs.surat?.name || 'Tidak ada file';
  }

  let porto = docs.porto || docs.portoLink || '';
  if (typeof porto !== 'string') porto = '';
  document.getElementById('portoName').textContent = porto || '-';

  if (porto && porto !== '-') {
    const btnPorto = document.getElementById('btnPortoAction');
    if (porto.includes('.pdf') || porto.includes('.zip')) {
      btnPorto.textContent = '👁️ Buka File';
      btnPorto.href = 'uploads/' + porto;
    } else {
      btnPorto.textContent = '🔗 Buka Link';
      btnPorto.href = porto.startsWith('http') ? porto : 'https://' + porto;
    }
  }

  window.currentAppId = appId;
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