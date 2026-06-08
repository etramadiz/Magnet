// detail-pelamar.js - lamaran dari Firebase, profil dari localStorage
import { getApplicationById } from './firebase-company.js';

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

function updateStatus(newStatus) {
  const catatan = document.getElementById('catatan').value;
  const result = MagnetDB.updateApplicationStatus(window.currentAppId, newStatus);
  if (result.ok) {
    alert(`Pelamar ${newStatus === 'Diterima' ? 'diterima' : 'ditolak'}.${catatan ? '\nCatatan: ' + catatan : ''}`);
    window.location.href = 'lihat-pelamar.html';
  } else {
    alert('Gagal mengupdate status.');
  }
}

window.updateStatus = updateStatus;
loadData();