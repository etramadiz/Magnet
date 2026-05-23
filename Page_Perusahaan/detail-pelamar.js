// detail-pelamar.js

// Mock data for each pelamar id
const pelamarData = {
  1: { name:'Andi Saputra', univ:'Universitas Negeri Semarang', jurusan:'Desain Komunikasi Visual', status:'Semester 6', cv:'CV_Andi_Saputra.pdf', surat:'Surat_Pengantar_Andi.pdf', porto:'portofolio-andi.com' },
  2: { name:'Budi Santoso', univ:'Universitas Diponegoro', jurusan:'Teknik Informatika', status:'Semester 8', cv:'CV_Budi_Santoso.pdf', surat:'Surat_Pengantar_Budi.pdf', porto:'Portofolio_Budi.pdf' },
  3: { name:'Citra Dewi', univ:'Universitas Gadjah Mada', jurusan:'Ilmu Komputer', status:'Semester 6', cv:'CV_Citra_Dewi.pdf', surat:'Surat_Pengantar_Citra.pdf', porto:'citra.behance.net' },
  4: { name:'Dani Hermawan', univ:'Universitas Brawijaya', jurusan:'Sistem Informasi', status:'Semester 7', cv:'CV_Dani_Hermawan.pdf', surat:'Surat_Pengantar_Dani.pdf', porto:'Portofolio_Dani.pdf' },
  5: { name:'Eka Putri', univ:'Universitas Negeri Yogyakarta', jurusan:'Pendidikan Teknik Informatika', status:'Semester 6', cv:'CV_Eka_Putri.pdf', surat:'Surat_Pengantar_Eka.pdf', porto:'eka-porto.netlify.app' },
};

function updateStatus(status) {
  const nama = document.getElementById('detailName').textContent;
  const catatan = document.getElementById('catatan').value;
  const msg = `Pelamar "${nama}" berhasil ${status === 'Diterima' ? 'diterima' : 'ditolak'}.${catatan ? '\nCatatan: ' + catatan : ''}`;
  alert(msg);
  window.location.href = 'lihat-pelamar.html';
}

// Load data berdasarkan ID parameter URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get('id')) || 1;
const data = pelamarData[id] || pelamarData[1];

// Menampilkan data teks profil dasar pelamar
document.getElementById('detailName').textContent = data.name;
document.getElementById('universitas').textContent = data.univ;
document.getElementById('jurusan').textContent = data.jurusan;
document.getElementById('statusMhs').textContent = data.status;

// Mengisi teks nama berkas untuk CV dan Surat Pengantar
document.getElementById('cvName').textContent = data.cv;
document.getElementById('suratName').textContent = data.surat;

// --- LOGIKA UTAMA UNTUK PORTOFOLIO (LINK ATAU PDF) ---
document.getElementById('portoName').textContent = data.porto;
const btnPorto = document.getElementById('btnPortoAction');

// Cek apakah isi data portofolio mengandung ekstensi berkas .pdf
if (data.porto.toLowerCase().includes('.pdf')) {
  // JIKA FILE PDF: Diarahkan ke folder penyimpanan berkas lokal kamu (misal folder 'uploads/')
  btnPorto.textContent = "👁️ Buka PDF";
  btnPorto.href = "uploads/" + data.porto;
} else {
  // JIKA TAUTAN/LINK: Langsung diarahkan ke URL website portofolio luar mereka
  btnPorto.textContent = "🔗 Buka Link";
  
  // Deteksi otomatis jika pelamar lupa mengetik 'http://' atau 'https://' di database mock agar tidak error saat diklik
  if (!data.porto.startsWith('http://') && !data.porto.startsWith('https://')) {
    btnPorto.href = 'https://' + data.porto;
  } else {
    btnPorto.href = data.porto;
  }
}