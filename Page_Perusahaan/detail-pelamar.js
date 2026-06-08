// detail-pelamar.js - mengambil data dari Firebase
import { getApplicationById } from './firebase-company.js';
import { getMahasiswaProfile } from './firebase-mahasiswa.js';

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const appId = urlParams.get('appId');

if (!userId || !appId) {
  alert('Parameter tidak lengkap. Kembali ke daftar pelamar.');
  window.location.href = 'lihat-pelamar.html';
}

async function loadData() {
  // Ambil data lamaran dari Firebase
  let application = await getApplicationById(appId);

  // Fallback ke localStorage jika tidak ada di Firebase
  if (!application) {
    const localApps = MagnetDB.getAllApplications();
    application = localApps.find(app => app.id === appId && app.userId === userId);
  }

  if (!application) {
    alert('Data lamaran tidak ditemukan.');
    window.location.href = 'lihat-pelamar.html';
    return;
  }

  // Ambil data user (mahasiswa) - dari Firestore atau localStorage
  let user = null;
  let profile = {};

  // Coba dari Firestore dulu
  try {
    const firestoreProfile = await getMahasiswaProfile(userId);
    if (firestoreProfile) {
      user = { name: firestoreProfile.name || firestoreProfile.namaLengkap, id: userId };
      profile = firestoreProfile;
    }
  } catch (e) {
    console.warn('Gagal ambil dari Firestore:', e);
  }

  // Fallback ke localStorage
  if (!user) {
    const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    user = users.find(u => u.id === userId);
    profile = user?.profile || {};
  }

  // Tampilkan data di HTML
  document.getElementById('detailName').textContent = user?.name || 'Tidak diketahui';
  document.getElementById('universitas').textContent = profile.universitas || '-';
  document.getElementById('jurusan').textContent = profile.jurusan || '-';
  document.getElementById('statusMhs').textContent = profile.semester || '-';

  const docs = application.documents || {};
  document.getElementById('cvName').textContent = docs.cv?.name || 'Tidak ada file';
  document.getElementById('suratName').textContent = docs.surat?.name || 'Tidak ada file';

  const porto = docs.porto || docs.portoLink || '';
  document.getElementById('portoName').textContent = porto || '-';
  if (porto) {
    const btnPorto = document.getElementById('btnPortoAction');
    if (porto.toLowerCase().includes('.pdf') || porto.toLowerCase().includes('.zip')) {
      btnPorto.textContent = '👁️ Buka File';
      btnPorto.href = 'uploads/' + porto;
    } else {
      btnPorto.textContent = '🔗 Buka Link';
      if (!porto.startsWith('http')) btnPorto.href = 'https://' + porto;
      else btnPorto.href = porto;
    }
  }

  window.currentAppId = appId;
}

function updateStatus(newStatus) {
  const catatan = document.getElementById('catatan').value;
  // Update status di localStorage dulu
  const result = MagnetDB.updateApplicationStatus(window.currentAppId, newStatus);
  if (result.ok) {
    alert(`Pelamar ${newStatus === 'Diterima' ? 'diterima' : 'ditolak'}.${catatan ? '\nCatatan: ' + catatan : ''}`);
    window.location.href = 'lihat-pelamar.html';
  } else {
    alert('Gagal mengupdate status.');
  }
  // TODO: nanti bisa tambahkan update ke Firebase juga
}

loadData();
window.updateStatus = updateStatus;