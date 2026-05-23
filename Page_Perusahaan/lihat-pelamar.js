// lihat-pelamar.js - versi Firebase (ambil lowongan dari Firebase)
import { auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getJobsByCompany } from './firebase-company.js';

let companyId = null;

function statusBadge(s) {
  const map = { 'terkirim':'badge-pending', 'diproses':'badge-pending', 'dilihat':'badge-accepted', 'diterima':'badge-accepted', 'ditolak':'badge-rejected' };
  return `<span class="badge ${map[s]||''}">${s}</span>`;
}

function statusJobBadge(s) {
  return s === 'Buka' ? `<span class="badge badge-open">Buka</span>` : `<span class="badge badge-closed">Tutup</span>`;
}

function toggleAccordion(jobId) {
  const content = document.getElementById(`accordion-content-${jobId}`);
  const arrow = document.getElementById(`arrow-${jobId}`);
  if (content && arrow) {
    content.classList.toggle('active');
    arrow.classList.toggle('rotated');
  }
}

async function render() {
  const container = document.getElementById('pelamarList');
  if (!container) return;
  if (!companyId) return;

  const jobs = await getJobsByCompany(companyId);
  if (!jobs.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Belum ada lowongan yang dipublikasikan.</p>';
    return;
  }

  let html = '';
  for (const job of jobs) {
    // Gunakan MagnetDB (db.js) yang masih membaca aplikasi dari localStorage
    const applicants = MagnetDB.getApplicationsByJob(job.id);
    if (!applicants.length) continue;

    html += `
      <div class="job-group">
        <div class="job-group-header" onclick="toggleAccordion('${job.id}')" style="cursor: pointer;">
          <div class="job-group-logo" style="background:#3B2A8E">${job.companyName?.charAt(0) || '?'}</div>
          <div class="job-group-info">
            <div class="job-group-name">
              ${job.title}
              ${statusJobBadge(job.status)}
            </div>
            <div class="job-group-company">${job.companyName}</div>
          </div>
          <div class="accordion-arrow" id="arrow-${job.id}">
            <svg ...>...</svg>
          </div>
        </div>
        <div class="job-accordion-content" id="accordion-content-${job.id}">
          <div class="list-pelamar-title">List Pelamar (${applicants.length} Orang)</div>
          ${applicants.map(p => `
            <div class="pelamar-row">
              <div class="pelamar-avatar">...</div>
              <div class="pelamar-info">
                <div class="pelamar-name">${p.userName}</div>
                <div class="pelamar-meta">Mahasiswa</div>
              </div>
              <div class="pelamar-status-wrap">${statusBadge(p.status)}</div>
              <div class="pelamar-action">
                <button class="btn btn-outline btn-sm" onclick="location.href='detail-pelamar.html?userId=${p.userId}&appId=${p.id}'">Detail</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (!html) {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Belum ada pelamar untuk lowongan Anda.</p>';
  } else {
    container.innerHTML = html;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const targetJobId = urlParams.get('id');
  if (targetJobId) {
    setTimeout(() => toggleAccordion(targetJobId), 500);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../Page_Login_Register/login-perusahaan.html';
    return;
  }
  companyId = user.uid;
  await render();
});

// Tambahkan event listener jika halaman dimuat setelah login
document.addEventListener('DOMContentLoaded', () => {
  if (companyId) render();
});