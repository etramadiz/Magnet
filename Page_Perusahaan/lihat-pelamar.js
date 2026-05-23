// lihat-pelamar.js

const jobsData = [
  {
    id: 1, name: 'UI/UX Designer Intern', company: 'PT Kreasi Digital', status: 'Buka', color: '#3B2A8E',
    pelamars: [
      { id:1, name:'Andi Saputra', status:'Menunggu' },
      { id:2, name:'Budi Santoso', status:'Diterima' },
      { id:3, name:'Citra Dewi', status:'Ditolak' },
      { id:4, name:'Dani Hermawan', status:'Menunggu' },
      { id:5, name:'Eka Putri', status:'Menunggu' },
    ]
  },
  {
    id: 2, name: 'Front-End Developer', company: 'CV TechNova', status: 'Buka', color: '#1E88E5',
    pelamars: [
      { id:6, name:'Fahmi Aditya', status:'Menunggu' },
      { id:7, name:'Gita Larasati', status:'Diterima' },
      { id:8, name:'Hendra Wijaya', status:'Menunggu' },
      { id:9, name:'Indira Sari', status:'Ditolak' },
      { id:10, name:'Joko Susanto', status:'Menunggu' },
    ]
  },
];

function statusBadge(s) {
  const map = { 'Menunggu':'badge-pending','Diterima':'badge-accepted','Ditolak':'badge-rejected' };
  return `<span class="badge ${map[s]||''}">${s}</span>`;
}

function statusJobBadge(s) {
  return s === 'Buka' ? `<span class="badge badge-open">Buka</span>` : `<span class="badge badge-closed">Tutup</span>`;
}

// Fungsi interaktif untuk buka tutup daftar pelamar (Accordion)
function toggleAccordion(jobId) {
  const content = document.getElementById(`accordion-content-${jobId}`);
  const arrow = document.getElementById(`arrow-${jobId}`);
  
  if (content && arrow) {
    content.classList.toggle('active');
    arrow.classList.toggle('rotated');
  }
}

function render() {
  const container = document.getElementById('pelamarList');
  if (!container) return;

  container.innerHTML = jobsData.map(job => `
    <div class="job-group">
      <div class="job-group-header" onclick="toggleAccordion(${job.id})" style="cursor: pointer; user-select: none;">
        <div class="job-group-logo" style="background:${job.color}">${job.company.charAt(0)}</div>
        <div class="job-group-info">
          <div class="job-group-name">
            ${job.name}
            ${statusJobBadge(job.status)}
          </div>
          <div class="job-group-company">${job.company}</div>
        </div>
        <div class="accordion-arrow" id="arrow-${job.id}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 20px; height: 20px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      
      <div class="job-accordion-content" id="accordion-content-${job.id}">
        <div class="list-pelamar-title">List Pelamar (${job.pelamars.length} Orang)</div>
        ${job.pelamars.map(p => `
          <div class="pelamar-row">
            <div class="pelamar-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
            </div>
            <div class="pelamar-info">
              <div class="pelamar-name">${p.name}</div>
              <div class="pelamar-meta">Mahasiswa</div>
            </div>
            <div class="pelamar-status-wrap">
              ${statusBadge(p.status)}
            </div>
            <div class="pelamar-action">
              <button class="btn btn-outline btn-sm" onclick="location.href='detail-pelamar.html'">Detail</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // ── FIX PARAMETER URL AGAR SINKRON DENGAN DASHBOARD ──
  const urlParams = new URLSearchParams(window.location.search);
  
  // Diubah dari 'jobId' menjadi 'id' agar sesuai dengan tombol dashboard.js kamu!
  const targetJobId = urlParams.get('id'); 

  if (targetJobId) {
    // Jalankan fungsi klik otomatis accordion
    toggleAccordion(Number(targetJobId));
  }
}

document.addEventListener('DOMContentLoaded', render);