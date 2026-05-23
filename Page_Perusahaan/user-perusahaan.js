// user-perusahaan.js

// Animated stat counters
function animateCount(el, target, duration = 900) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); return; }
    el.textContent = Math.floor(start);
  }, 16);
}

window.addEventListener('load', () => {
  animateCount(document.getElementById('statLowongan'), 9);
  animateCount(document.getElementById('statPelamar'), 47);
  animateCount(document.getElementById('statDiterima'), 12);
  animateCount(document.getElementById('statBuka'), 6);
  renderChart();
});

// Mini bar chart – pelamar per bulan
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

// Inject data sesi ke halaman profil
document.addEventListener('DOMContentLoaded', () => {
  const s = MagnetDB.getSession();
  if (!s) return;
  document.querySelectorAll('.profile-company-name').forEach(el => el.textContent = s.name);
  document.querySelectorAll('.profile-email, .profile-user-email').forEach(el => el.textContent = s.email);
  if (document.getElementById('navUserName')) document.getElementById('navUserName').textContent = s.name;
  if (s.description) {
    const desc = document.querySelector('.profile-text, .about-text');
    if (desc) desc.textContent = s.description;
  }
  if (s.location) {
    document.querySelectorAll('td').forEach(td => {
      if (td.previousElementSibling && /Lokasi|Kota/i.test(td.previousElementSibling.textContent))
        td.textContent = s.location;
    });
  }
});
