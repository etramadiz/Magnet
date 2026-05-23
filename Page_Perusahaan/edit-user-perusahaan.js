// edit-user-perusahaan.js

document.addEventListener('DOMContentLoaded', () => {
  MagnetDB.requirePerusahaanAuth();
  
  // SOLUSI MASALAH 3: Ambil data real dari session saat ini (bukan dummy HTML)
  const user = MagnetDB.getSession();
  if (user) {
    if (user.name) document.getElementById('editNama').value = user.name;
    if (user.industry) document.getElementById('editIndustri').value = user.industry;
    if (user.size) document.getElementById('editUkuran').value = user.size;
    if (user.location) document.getElementById('editLokasi').value = user.location;
    if (user.website) document.getElementById('editWebsite').value = user.website;
    if (user.address) document.getElementById('editAlamat').value = user.address;
    if (user.founded) document.getElementById('editTahun').value = user.founded;
    if (user.description) document.getElementById('editDeskripsi').value = user.description;
    if (user.culture) document.getElementById('editBudaya').value = user.culture;
    if (user.benefits) document.getElementById('editBenefit').value = user.benefits;
    
    // Perbarui inisial huruf kotak logo sesuai nama perusahaan asli
    const preview = document.getElementById('logoPreview');
    if (preview && user.name) preview.textContent = user.name.charAt(0).toUpperCase();
  }
});

function previewLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('logoPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Logo" />`;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const nama = document.getElementById('editNama').value.trim();
  if (!nama) { alert('Nama perusahaan harus diisi.'); return; }

  const user = MagnetDB.getSession();
  if (!user) return;

  // SOLUSI MASALAH 2: Ambil seluruh data dari form input
  const dataPerubahan = {
    name: nama,
    industry: document.getElementById('editIndustri').value,
    size: document.getElementById('editUkuran').value,
    location: document.getElementById('editLokasi').value.trim(),
    website: document.getElementById('editWebsite').value.trim(),
    address: document.getElementById('editAlamat').value.trim(),
    founded: document.getElementById('editTahun').value.trim(),
    description: document.getElementById('editDeskripsi').value.trim(),
    culture: document.getElementById('editBudaya').value.trim(),
    benefits: document.getElementById('editBenefit').value.trim()
  };

  // Simpan data perubahan ke dalam database utama (magnet_users)
  MagnetDB.updateUser(user.id, dataPerubahan);

  // TRIK AMAN: Perbarui objek session aktif agar perubahan langsung mencerminkan di UI tanpa relogin
  const updatedSession = { ...user, ...dataPerubahan };
  localStorage.setItem('magnet_session', JSON.stringify(updatedSession));

  // Berikan feedback visual sukses pada tombol
  const btn = document.querySelector('.form-actions .btn-primary');
  const orig = btn.innerHTML;
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:15px;height:15px"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg> Tersimpan!';
  btn.style.background = '#2E7D32';
  btn.style.borderColor = '#2E7D32';

  // Alihkan kembali ke halaman ringkasan profil utama
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.style.borderColor = '';
    window.location.href = 'user-perusahaan.html';
  }, 1200);
}