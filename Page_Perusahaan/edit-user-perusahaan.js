// edit-user-perusahaan.js

import { getSession } from './db.js';
import { getCompanyProfile, updateCompanyProfile } from './firebase-company.js';

let uid = null;
let currentLogoBase64 = null;

// Load data perusahaan saat halaman dimuat
async function loadData() {
  const session = getSession();
  if (!session || session.type !== 'perusahaan') {
    window.location.href = '../Page_Login_Register/login-perusahaan.html';
    return;
  }
  uid = session.id;
  const data = await getCompanyProfile(uid);
  if (data) {
    document.getElementById('editNama').value = data.nama || '';
    document.getElementById('editIndustri').value = data.industri || 'Teknologi Informasi';
    document.getElementById('editUkuran').value = data.ukuran || '50–100 karyawan';
    document.getElementById('editLokasi').value = data.lokasi || '';
    document.getElementById('editWebsite').value = data.website || '';
    document.getElementById('editAlamat').value = data.alamat || '';
    document.getElementById('editTahun').value = data.tahun || '';
    document.getElementById('editDeskripsi').value = data.deskripsi || '';
    document.getElementById('editBudaya').value = data.budaya || '';
    document.getElementById('editBenefit').value = data.benefit || '';
    if (data.logo) {
      const preview = document.getElementById('logoPreview');
      preview.innerHTML = `<img src="${data.logo}" alt="Logo" />`;
      currentLogoBase64 = data.logo;
    }
  } else {
    // Jika belum ada data, isi dengan default kosong
    document.getElementById('editNama').value = session.name || '';
    // field lainnya biarkan kosong atau default
  }
}

// Preview logo dari input file
function previewLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('logoPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Logo" />`;
    currentLogoBase64 = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Simpan profil ke Firebase
async function saveProfile() {
  const nama = document.getElementById('editNama').value.trim();
  if (!nama) { alert('Nama perusahaan harus diisi.'); return; }

  const dataToSave = {
    nama: nama,
    industri: document.getElementById('editIndustri').value,
    ukuran: document.getElementById('editUkuran').value,
    lokasi: document.getElementById('editLokasi').value,
    website: document.getElementById('editWebsite').value,
    alamat: document.getElementById('editAlamat').value,
    tahun: document.getElementById('editTahun').value,
    deskripsi: document.getElementById('editDeskripsi').value,
    budaya: document.getElementById('editBudaya').value,
    benefit: document.getElementById('editBenefit').value,
    updatedAt: new Date().toISOString()
  };
  if (currentLogoBase64) {
    dataToSave.logo = currentLogoBase64;
  }

  try {
    await updateCompanyProfile(uid, dataToSave);
    
    // Update juga nama di session local
    const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    const userIdx = users.findIndex(u => u.id === uid);
    if (userIdx !== -1) {
      users[userIdx].name = nama;
      localStorage.setItem('magnet_users', JSON.stringify(users));
    }
    const session = getSession();
    if (session) session.name = nama;
    localStorage.setItem('magnet_session', JSON.stringify({ userId: uid }));

    // Success feedback
    const btn = document.querySelector('.form-actions .btn-primary');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:15px;height:15px"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg> Tersimpan!';
    btn.style.background = '#2E7D32';
    btn.style.borderColor = '#2E7D32';

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
      window.location.href = 'user-perusahaan.html';
    }, 1200);
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message);
  }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', loadData);

// Ekspos fungsi ke global (karena dipanggil dari inline onclick)
window.previewLogo = previewLogo;
window.saveProfile = saveProfile;