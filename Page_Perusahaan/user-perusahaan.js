// user-perusahaan.js - statistik real dengan Firebase UID
import { auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getJobsByCompany } from './firebase-company.js';

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

async function refreshStats(uid) {
  if (!uid) return;
  const jobs = await getJobsByCompany(uid);
  const jobCount = jobs.length;

  let totalPelamar = 0;
  let totalDiterima = 0;
  const allApps = MagnetDB.getAllApplications();
  for (const job of jobs) {
    const jobApps = allApps.filter(app => app.jobId === String(job.id));
    totalPelamar += jobApps.length;
    totalDiterima += jobApps.filter(app => app.status === 'Diterima').length;
  }
  const lowonganAktif = jobs.filter(job => job.status !== 'Tutup').length;

  animateCount(document.getElementById('statLowongan'), jobCount);
  animateCount(document.getElementById('statPelamar'), totalPelamar);
  animateCount(document.getElementById('statDiterima'), totalDiterima);
  animateCount(document.getElementById('statBuka'), lowonganAktif);
}

// Jalankan setelah auth siap
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await refreshStats(user.uid);
  }
});

// Chart (tetap)
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

document.addEventListener('DOMContentLoaded', () => {
  renderChart();
});