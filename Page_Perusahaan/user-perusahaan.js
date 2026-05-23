// user-perusahaan.js

function animateCount(el, target, duration = 900) {
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); return; }
    el.textContent = Math.floor(start);
  }, 16);
}

window.addEventListener('load', () => {
  if (document.getElementById('statLowongan')) animateCount(document.getElementById('statLowongan'), 9);
  if (document.getElementById('statPelamar')) animateCount(document.getElementById('statPelamar'), 47);
  if (document.getElementById('statDiterima')) animateCount(document.getElementById('statDiterima'), 12);
  if (document.getElementById('statBuka')) animateCount(document.getElementById('statBuka'), 6);
  renderChart();
});

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

// SOLUSI MASALAH 1: Injeksi data dinamis hasil input registrasi/edit profil
document.addEventListener('DOMContentLoaded', () => {
  const s = MagnetDB.getSession();
  if (!s) return;

  // Render teks dasar nama dan email perusahaan
  document.querySelectorAll('.profile-company-name').forEach(el => el.textContent = s.name);
  document.querySelectorAll('.profile-email, .profile-user-email').forEach(el => el.textContent = s.email);
  if (document.getElementById('navUserName')) document.getElementById('navUserName').textContent = s.name;
  
  // Set inisial huruf pertama logo berdasarkan nama perusahaan terbaru
  const logoBox = document.querySelector('.profile-logo');
  if (logoBox && s.name) logoBox.textContent = s.name.charAt(0).toUpperCase();

  // Injeksi teks deskripsi panjang, budaya, dan benefit
  const descEl = document.getElementById('profileDeskripsi');
  if (descEl) descEl.textContent = s.description || 'Deskripsi perusahaan belum diisi.';

  const cultureEl = document.getElementById('profileBudaya');
  if (cultureEl) cultureEl.textContent = s.culture || 'Informasi budaya kerja belum diisi.';

  const benefitEl = document.getElementById('profileBenefit');
  if (benefitEl) benefitEl.textContent = s.benefits || 'Informasi benefit belum diisi.';

  // Injeksi data spesifik ke komponen spesifikasi detail box
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