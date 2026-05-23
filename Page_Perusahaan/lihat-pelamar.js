// lihat-pelamar.js - versi Firebase

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

  // Ambil semua lowongan perusahaan ini dari localStorage (atau nanti dari Firebase)
  // Untuk sementara, kita gunakan data dari MagnetDB (db.js) yang menyimpan lowongan perusahaan.
  // Catatan: Fungsi getAllJobs() harus ditambahkan di db.js (belum ada). Alternatif: kita simpan lowongan di localStorage sendiri.
  // Tapi karena lowongan perusahaan masih statis di dashboard.js, kita ambil dari array global JOBS? Tidak disarankan.
  // Lebih baik kita baca dari localStorage key 'magnet_jobs' yang mungkin akan dibuat nanti.
  // Sementara, kita gunakan data dari MagnetDB.getUserApplications? Tidak, itu untuk mahasiswa.
  // Untuk perusahaan, kita perlu fungsi getCompanyJobs(companyId). Untuk sekarang, kita tampilkan pesan bahwa fitur dalam pengembangan.

  // Alternatif: gunakan data dari localStorage 'magnet_jobs' jika ada.
  let jobs = JSON.parse(localStorage.getItem('magnet_jobs') || '[]');
  if (jobs.length === 0) {
    // Jika belum ada lowongan, tampilkan pesan
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Belum ada lowongan yang dipublikasikan.</p>';
    return;
  }

  // Untuk setiap lowongan, cari pelamar dari MagnetDB.getApplicationsByJob(job.id)
  let html = '';
  for (const job of jobs) {
    const applicants = MagnetDB.getApplicationsByJob(job.id);
    if (applicants.length === 0) continue;

    html += `
      <div class="job-group">
        <div class="job-group-header" onclick="toggleAccordion(${job.id})" style="cursor: pointer;">
          <div class="job-group-logo" style="background:#3B2A8E">${job.company.charAt(0)}</div>
          <div class="job-group-info">
            <div class="job-group-name">
              ${job.name}
              ${statusJobBadge(job.status)}
            </div>
            <div class="job-group-company">${job.company}</div>
          </div>
          <div class="accordion-arrow" id="arrow-${job.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:20px;height:20px">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        <div class="job-accordion-content" id="accordion-content-${job.id}">
          <div class="list-pelamar-title">List Pelamar (${applicants.length} Orang)</div>
          ${applicants.map(p => `
            <div class="pelamar-row">
              <div class="pelamar-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              </div>
              <div class="pelamar-info">
                <div class="pelamar-name">${p.userName}</div>
                <div class="pelamar-meta">Mahasiswa</div>
              </div>
              <div class="pelamar-status-wrap">
                ${statusBadge(p.status)}
              </div>
              <div class="pelamar-action">
                <button class="btn btn-outline btn-sm" onclick="location.href='detail-pelamar.html?userId=${p.userId}&appId=${p.id}'">Detail</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (html === '') {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Belum ada pelamar untuk lowongan Anda.</p>';
  } else {
    container.innerHTML = html;
  }

  // Auto-buka accordion jika ada parameter id di URL
  const urlParams = new URLSearchParams(window.location.search);
  const targetJobId = urlParams.get('id');
  if (targetJobId) {
    setTimeout(() => toggleAccordion(Number(targetJobId)), 500);
  }
}

document.addEventListener('DOMContentLoaded', render);