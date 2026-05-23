// edit-user-perusahaan.js – Firebase version
import { auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getCompanyProfile, updateCompanyProfile } from './firebase-company.js';

let uid = null;
let currentLogoBase64 = null;

async function loadData() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '../Page_Login_Register/login-perusahaan.html';
      return;
    }
    uid = user.uid;
    const data = await getCompanyProfile(uid);
    
    if (data && Object.keys(data).length > 0) {
      // Isi form dengan data dari Firebase
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
      
      // Logo
      if (data.logo) {
        const preview = document.getElementById('logoPreview');
        preview.innerHTML = `<img src="${data.logo}" alt="Logo" style="width:100%;height:100%;object-fit:cover" />`;
        currentLogoBase64 = data.logo;
      } else {
        const preview = document.getElementById('logoPreview');
        preview.textContent = (data.nama || user.displayName || '?').charAt(0).toUpperCase();
        preview.style.background = '#3B2A8E';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.fontSize = '28px';
        preview.style.fontWeight = '800';
      }
    } else {
      // Data kosong, isi dengan nama dari user auth
      const userName = user.displayName || 'Perusahaan';
      document.getElementById('editNama').value = userName;
      const preview = document.getElementById('logoPreview');
      preview.textContent = userName.charAt(0).toUpperCase();
      preview.style.background = '#3B2A8E';
      preview.style.display = 'flex';
      preview.style.alignItems = 'center';
      preview.style.justifyContent = 'center';
      preview.style.fontSize = '28px';
      preview.style.fontWeight = '800';
    }
  });
}

function previewLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('logoPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Logo" style="width:100%;height:100%;object-fit:cover" />`;
    currentLogoBase64 = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  const nama = document.getElementById('editNama').value.trim();
  if (!nama) { alert('Nama perusahaan harus diisi.'); return; }
  if (!uid) { alert('Session tidak valid.'); return; }

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
    
    // Update juga nama di Firebase Authentication (displayName)
    const user = auth.currentUser;
    if (user && user.updateProfile) {
      await user.updateProfile({ displayName: nama });
    }
    
    // Feedback visual
    const btn = document.querySelector('.form-actions .btn-primary');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg ...> Tersimpan!';
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

document.addEventListener('DOMContentLoaded', loadData);

window.previewLogo = previewLogo;
window.saveProfile = saveProfile;