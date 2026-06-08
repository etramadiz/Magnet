// user-perusahaan.js - versi dengan statistik real

// Fungsi untuk mengambil data dari Firebase dan localStorage
async function refreshStats() {
  // Ambil user session
  const session = MagnetDB.getSession();
  if (!session || session.type !== 'perusahaan') return;

  const uid = session.id;

  // Import fungsi dari firebase-company.js (path relatif)
  const { getJobsByCompany } = await import('./firebase-company.js');
  const jobs = await getJobsByCompany(uid);
  const jobCount = jobs.length;

  // Hitung total pelamar dan diterima dari semua lowongan
  let totalPelamar = 0;
  let totalDiterima = 0;
  const allApps = MagnetDB.getAllApplications();
  for (const job of jobs) {
    const jobApps = allApps.filter(app => app.jobId === String(job.id));
    totalPelamar += jobApps.length;
    totalDiterima += jobApps.filter(app => app.status === 'Diterima').length;
  }
  const lowonganAktif = jobs.filter(job => job.status !== 'Tutup').length;

  // Update elemen statistik
  animateCount(document.getElementById('statLowongan'), jobCount);
  animateCount(document.getElementById('statPelamar'), totalPelamar);
  animateCount(document.getElementById('statDiterima'), totalDiterima);
  animateCount(document.getElementById('statBuka'), lowonganAktif);
}

// Fungsi animasi (sama seperti asli)
function animateCount(el, target, duration = 900) {
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
      return;
    }
    el.textContent = Math.floor(start);
  }, 16);
}

// Panggil refreshStats setelah DOM siap
document.addEventListener('DOMContentLoaded', async () => {
  // Tunggu sebentar agar session tersedia
  const session = MagnetDB.getSession();
  if (session) {
    await refreshStats();
  } else {
    // Coba lagi setelah 500ms
    setTimeout(async () => {
      if (MagnetDB.getSession()) await refreshStats();
    }, 500);
  }
  // Chart tetap statis
  renderChart();
});

// Chart data (tetap statis)
const chartData = [
  { label: 'Jan', val: 4 },
  { label: 'Feb', val: 8 },
  { label: 'Mar', val: 6 },
  { label: 'Apr', val: 12 },
  { label: 'Mei', val: 9 },
  { label: 'Jun', val: 8 },
];

function renderChart() {
  const container = document.getElementById('miniChart');
  if (!container) return;
  const max = Math.max(...chartData.map(d => d.val));
  container.innerHTML = chartData.map(d => `
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${(d.val / max) * 64}px;" title="${d.val} pelamar"></div>
      <span class="chart-label">${d.label}</span>
    </div>
  `).join('');
}

// Sisanya (inject data profil, dll) tetap seperti sebelumnya
document.addEventListener('DOMContentLoaded', () => {
  const s = MagnetDB.getSession();
  if (!s) return;

  // Render teks dasar nama dan email perusahaan
  document.querySelectorAll('.profile-company-name').forEach(el => el.textContent = s.name);
  document.querySelectorAll('.profile-email, .profile-user-email').forEach(el => el.textContent = s.email);
  if (document.getElementById('navUserName')) document.getElementById('navUserName').textContent = s.name;
  
  const logoBox = document.querySelector('.profile-logo');
  if (logoBox && s.name) logoBox.textContent = s.name.charAt(0).toUpperCase();

  const descEl = document.getElementById('profileDeskripsi');
  if (descEl) descEl.textContent = s.description || 'Deskripsi perusahaan belum diisi.';

  const cultureEl = document.getElementById('profileBudaya');
  if (cultureEl) cultureEl.textContent = s.culture || 'Informasi budaya kerja belum diisi.';

  const benefitEl = document.getElementById('profileBenefit');
  if (benefitEl) benefitEl.textContent = s.benefits || 'Informasi benefit belum diisi.';

  const indEl = document.getElementById('profileIndustri');
  if (indEl) indEl.textContent = s.industry || '—';

  const sizeEl = document.getElementById('profileUkuran');
  if (sizeEl) sizeEl.textContent = s.size || '—';

  const locEl = document.getElementById('profileLokasi');
  if (locEl) locEl.textContent = s.location || '—';

  const webEl = document.getElementById('profileWebsite');
  if (webEl) {
    webEl.textContent = s.website || '—';
    if (s.website) {
      webEl.setAttribute('href', s.website.startsWith('http') ? s.website : 'https://' + s.website);
    }
  }

  const addrEl = document.getElementById('profileAlamat');
  if (addrEl) addrEl.textContent = s.address || '—';

  const yearEl = document.getElementById('profileTahun');
  if (yearEl) yearEl.textContent = s.founded || '—';
});