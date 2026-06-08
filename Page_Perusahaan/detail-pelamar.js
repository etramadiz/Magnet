// detail-pelamar.js - mengambil data dari Firebase
import { getApplicationById } from './firebase-company.js';
import { getMahasiswaProfile } from './firebase-mahasiswa.js';

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const appId = urlParams.get('appId');

if (!userId || !appId) {
  alert('Parameter tidak lengkap.');
  window.location.href = 'lihat-pelamar.html';
}

async function loadData() {
  // 1. Ambil lamaran dari Firebase
  let application = await getApplicationById(appId);
  if (!application) {
    alert('Data lamaran tidak ditemukan.');
    window.location.href = 'lihat-pelamar.html';
    return;
  }

  // 2. Ambil profil mahasiswa dari Firestore (Firebase)
  let profile = {};
  try {
    const firestoreProfile = await getMahasiswaProfile(userId);
    if (firestoreProfile) profile = firestoreProfile;
  } catch (e) {
    console.error('Gagal ambil profil mahasiswa dari Firestore:', e);
  }

  // 3. Tampilkan data
  document.getElementById('detailName').textContent = profile.namaLengkap || profile.name || 'Tidak diketahui';
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

// Ekspos ke global untuk tombol dengan onclick
window.updateStatus = updateStatus;

loadData();