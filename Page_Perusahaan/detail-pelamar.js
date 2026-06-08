// detail-pelamar.js - lamaran dari Firebase, profil dari localStorage
import { getApplicationById, updateApplicationStatus } from './firebase-company.js';

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const appId = urlParams.get('appId');

if (!userId || !appId) {
  alert('Parameter tidak lengkap.');
  window.location.href = 'lihat-pelamar.html';
}

async function loadData() {
  // 1. Ambil lamaran dari Firebase Realtime Database
  let application = await getApplicationById(appId);
  if (!application) {
    alert('Data lamaran tidak ditemukan di database.');
    window.location.href = 'lihat-pelamar.html';
    return;
  }

  // 2. Ambil data mahasiswa dari localStorage (sudah disimpan saat login/register)
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const user = users.find(u => u.id === userId);
  const profile = user?.profile || {};

  // 3. Tampilkan data
  document.getElementById('detailName').textContent = user?.name || 'Tidak diketahui';
  document.getElementById('universitas').textContent = profile.universitas || '-';
  document.getElementById('jurusan').textContent = profile.jurusan || '-';
  document.getElementById('statusMhs').textContent = profile.semester || '-';

  const docs = application.documents || {};
  document.getElementById('cvName').textContent = docs.cv?.name || 'Tidak ada file';
  document.getElementById('suratName').textContent = docs.surat?.name || 'Tidak ada file';

  // Pastikan porto berupa string
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

async function updateStatus(newStatus) { // Tambahkan async
  const catatan = document.getElementById('catatan').value;
  
  try {
    // Ganti pemanggilan MagnetDB dengan fungsi Firebase
    await updateApplicationStatus(window.currentAppId, newStatus, catatan);
    window.showToast(`Pelamar ${newStatus === 'Diterima' ? 'diterima' : 'ditolak'}.${catatan ? '\nCatatan: ' + catatan : ''}`);
    window.location.href = 'lihat-pelamar.html';
  } catch (error) {
    alert('Gagal mengupdate status: ' + error.message);
  }
}

// ========== TAMBAHKAN FUNGSI SHOWTOAST ==========
function showToast(message) {
  // Coba gunakan elemen toast jika ada
  const toastEl = document.getElementById('toast');
  if (toastEl) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
  } else {
    // Fallback ke alert
    alert(message);
  }
}
window.showToast = showToast;
// =================================================

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const appId = urlParams.get('appId');

if (!userId || !appId) {
  alert('Parameter tidak lengkap.');
  window.location.href = 'lihat-pelamar.html';
}

async function loadData() {
  // 1. Ambil lamaran dari Firebase Realtime Database
  let application = await getApplicationById(appId);
  if (!application) {
    alert('Data lamaran tidak ditemukan di database.');
    window.location.href = 'lihat-pelamar.html';
    return;
  }

  // 2. Ambil data mahasiswa dari localStorage
  const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
  const user = users.find(u => u.id === userId);
  const profile = user?.profile || {};

  // 3. Tampilkan data
  document.getElementById('detailName').textContent = user?.name || 'Tidak diketahui';
  document.getElementById('universitas').textContent = profile.universitas || '-';
  document.getElementById('jurusan').textContent = profile.jurusan || '-';
  document.getElementById('statusMhs').textContent = profile.semester || '-';

  const docs = application.documents || {};
  document.getElementById('cvName').textContent = docs.cv?.name || 'Tidak ada file';
  document.getElementById('suratName').textContent = docs.surat?.name || 'Tidak ada file';

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
    window.showToast(`Pelamar ${newStatus === 'Diterima' ? 'diterima' : 'ditolak'}.${catatan ? '\nCatatan: ' + catatan : ''}`);
    window.location.href = 'lihat-pelamar.html';
  } catch (error) {
    alert('Gagal mengupdate status: ' + error.message);
  }
}

window.updateStatus = updateStatus;
loadData();

