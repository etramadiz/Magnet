/* hasil-pencarian.js - Mengambil data dari Firebase */
import { getAllJobs } from '../Page_Perusahaan/firebase-company.js';

let allJobs = [];
let savedSet = new Set(JSON.parse(localStorage.getItem('mg_saved') || '[]'));
let currentParams = {};

function persistSaved() { localStorage.setItem('mg_saved', JSON.stringify([...savedSet])); }

function toggleBookmark(e, id) {
  e.stopPropagation();
  if (savedSet.has(id)) { savedSet.delete(id); showToast('Lowongan dihapus dari simpanan'); }
  else { savedSet.add(id); showToast('Lowongan disimpan ✓'); }
  persistSaved();
  const btn = document.querySelector(`.hp-bookmark[data-id="${id}"]`);
  if (btn) {
    btn.classList.toggle('saved', savedSet.has(id));
    btn.querySelector('svg').setAttribute('fill', savedSet.has(id) ? 'currentColor' : 'none');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return 'Baru';
  const date = new Date(isoDate);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  if (diff < 7) return `${diff} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

let filterOpen = false;
function toggleFilterPanel() {
  filterOpen = !filterOpen;
  document.getElementById('hpFilterPanel').classList.toggle('open', filterOpen);
}

function resetFilters() {
  ['fpBidang', 'fpRemote', 'fpGaji', 'fpDurasi'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const tipe = document.getElementById('fpTipeKerja');
  if (tipe) tipe.value = '';
  currentParams.bidang = '';
  currentParams.tipe = '';
  currentParams.remote = '';
  currentParams.gaji = '';
  currentParams.durasi = '';
  applySearch();
}

function applySearch() {
  const q = document.getElementById('hpSearchInput')?.value.trim() || '';
  const bidang = document.getElementById('fpBidang')?.value || '';
  const tipe = document.getElementById('fpTipeKerja')?.value || '';
  const remote = document.getElementById('fpRemote')?.value || '';
  const gaji = document.getElementById('fpGaji')?.value || '';
  const durasi = document.getElementById('fpDurasi')?.value || '';
  currentParams = { q, bidang, lokasi: currentParams.lokasi || '', tipe, remote, gaji, durasi };
  filterOpen = false;
  document.getElementById('hpFilterPanel')?.classList.remove('open');
  renderResults();
}

function removeChip(key) {
  currentParams[key] = '';
  if (key === 'q') document.getElementById('hpSearchInput').value = '';
  if (key === 'bidang') document.getElementById('fpBidang').value = '';
  if (key === 'tipe') { const el = document.getElementById('fpTipeKerja'); if (el) el.value = ''; }
  if (key === 'remote') document.getElementById('fpRemote').value = '';
  if (key === 'gaji') document.getElementById('fpGaji').value = '';
  if (key === 'durasi') document.getElementById('fpDurasi').value = '';
  renderResults();
}

function quickSearch(kw) {
  document.getElementById('hpSearchInput').value = kw;
  currentParams.q = kw;
  renderResults();
}

function openDetail(id) {
  window.location.href = `detail-lowongan.html?id=${id}`;
}

async function renderResults() {
  const { q = '', bidang = '', lokasi = '', tipe = '', remote = '', gaji = '', durasi = '' } = currentParams;
  const kw = q.toLowerCase();

  let results = [...allJobs];
  if (kw) results = results.filter(j =>
    (j.title || '').toLowerCase().includes(kw) ||
    (j.companyName || j.company || '').toLowerCase().includes(kw) ||
    (j.department || '').toLowerCase().includes(kw) ||
    (j.tags || []).some(t => t.toLowerCase().includes(kw))
  );
  if (bidang) results = results.filter(j => j.category === bidang);
  if (lokasi) results = results.filter(j => (j.location || '').toLowerCase().includes(lokasi.toLowerCase()));
  if (tipe) results = results.filter(j => j.tipeKey === tipe);
  if (remote) results = results.filter(j => j.remoteKey === remote);
  if (durasi) results = results.filter(j => j.durasi === durasi);
  if (gaji) results = results.filter(j => gaji === 'paid' ? (j.salaryMin > 0) : (j.salaryMin === 0));

  const countEl = document.getElementById('hpCount');
  if (countEl) countEl.textContent = results.length ? `${results.length} lowongan ditemukan${q ? ` untuk "${q}"` : ''}` : 'Tidak ada lowongan ditemukan';

  renderChips();

  const hasFlt = !!(bidang || tipe || remote || gaji || durasi);
  document.getElementById('filterToggle')?.classList.toggle('has-filter', hasFlt);

  const list = document.getElementById('hpList');
  if (!list) return;

  if (!results.length) {
    list.innerHTML = `<div class="hp-empty">
      <div class="hp-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
      <h3>Lowongan tidak ditemukan</h3>
      <p>Tidak ada lowongan yang cocok dengan pencarianmu. Coba ubah kata kunci atau hapus beberapa filter.</p>
      <div class="hp-empty-suggestions">
        <button class="hp-empty-chip" onclick="quickSearch('magang')">Magang</button>
        <button class="hp-empty-chip" onclick="quickSearch('IT')">IT</button>
        <button class="hp-empty-chip" onclick="quickSearch('desain')">Desain</button>
        <button class="hp-empty-chip" onclick="quickSearch('marketing')">Marketing</button>
      </div>
    </div>`;
    return;
  }

  list.innerHTML = results.map((job, i) => {
    const isSaved = savedSet.has(job.id);
    const companyName = job.companyName || job.company || 'Perusahaan';
    const companyShort = job.companyShort || (companyName.charAt(0) || '?');
    const logoColor = job.logoColor || '#3B2A8E';
    const salary = job.salary || `Rp ${job.salaryMin || 0} – ${job.salaryMax || 0}`;
    const deadline = job.deadline || 'Tidak ditentukan';
    const durasiLabel = job.durasiLabel || job.duration || `${job.durasi || 3} Bulan`;
    const remoteKey = job.remoteKey || job.workMode || 'Onsite';
    const location = job.location || '-';
    return `<div class="hp-card" style="animation-delay:${i * 0.04}s" onclick="openDetail('${job.id}')">
      <div class="hp-card-top">
        <div class="hp-logo" style="background:${logoColor}18;color:${logoColor}">${escapeHtml(companyShort)}</div>
        <div class="hp-card-main">
          <p class="hp-card-title">${escapeHtml(job.title)}</p>
          <p class="hp-card-company">${escapeHtml(companyName)}</p>
        </div>
        <div class="hp-card-actions">
          <button class="hp-bookmark ${isSaved ? 'saved' : ''}" data-id="${job.id}" onclick="toggleBookmark(event, '${job.id}')" title="${isSaved ? 'Hapus simpanan' : 'Simpan'}">
            <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          ${job.isNew ? '<span class="hp-new-badge">Baru</span>' : ''}
        </div>
      </div>
      <div class="hp-card-meta">
        <span class="hp-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(location)}</span>
        <span class="hp-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${escapeHtml(durasiLabel)}</span>
        <span class="hp-meta" style="text-transform:capitalize"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>${escapeHtml(remoteKey)}</span>
      </div>
      <div class="hp-card-tags">${(job.tags || []).map(t => `<span class="hp-tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="hp-card-footer">
        <div><p class="hp-salary">${escapeHtml(salary)}</p><p class="hp-deadline">Tutup ${escapeHtml(deadline)}</p></div>
        <button class="hp-detail-btn" onclick="openDetail('${job.id}');event.stopPropagation()">Lihat Detail</button>
      </div>
    </div>`;
  }).join('');
}

function renderChips() {
  const { q, bidang, lokasi, tipe, remote, gaji, durasi } = currentParams;
  const bidangLabel = { it: 'Teknologi & IT', desain: 'Desain', bisnis: 'Bisnis', marketing: 'Marketing', riset: 'Riset & Data', keuangan: 'Keuangan' };
  const tipeLabel = { parttime: 'Part-time', fulltime: 'Full-time' };
  const remoteLabel = { onsite: 'Onsite', remote: 'Remote', hybrid: 'Hybrid' };
  const gajiLabel = { paid: 'Paid', unpaid: 'Unpaid' };
  const durasiLabel = { '1-3': '1–3 Bulan', '3-6': '3–6 Bulan', '6+': '6 Bulan+' };
  const chips = [];
  if (q) chips.push({ label: `"${q}"`, key: 'q' });
  if (bidang) chips.push({ label: bidangLabel[bidang] || bidang, key: 'bidang' });
  if (lokasi) chips.push({ label: '📍 ' + lokasi, key: 'lokasi' });
  if (tipe) chips.push({ label: tipeLabel[tipe] || tipe, key: 'tipe' });
  if (remote) chips.push({ label: remoteLabel[remote] || remote, key: 'remote' });
  if (gaji) chips.push({ label: gajiLabel[gaji] || gaji, key: 'gaji' });
  if (durasi) chips.push({ label: durasiLabel[durasi] || durasi, key: 'durasi' });
  const el = document.getElementById('hpChips');
  if (el) el.innerHTML = chips.map(c => `<span class="hp-chip">${c.label}<button onclick="removeChip('${c.key}')">✕</button></span>`).join('');
}

async function loadAllJobs() {
  try {
    allJobs = await getAllJobs();
    // Format data untuk konsistensi
    allJobs = allJobs.map(job => ({
      ...job,
      isNew: (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24) <= 7,
      companyName: job.companyName || job.company,
      companyShort: job.companyShort || (job.companyName ? job.companyName.charAt(0) : '?'),
    }));
    renderResults();
  } catch (err) {
    console.error('Gagal memuat lowongan dari Firebase:', err);
    showToast('Gagal memuat lowongan. Periksa koneksi.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  restoreSidebarState();
  applyGuestMode();

  const user = MagnetDB.getSession();
  if (user) {
    const av = document.getElementById('avatarInitial');
    if (av) av.textContent = user.name.charAt(0).toUpperCase();
  }

  const p = new URLSearchParams(window.location.search);
  currentParams = {
    q: p.get('q') || '',
    bidang: p.get('bidang') || '',
    lokasi: p.get('lokasi') || '',
    tipe: p.get('tipe') || '',
    remote: p.get('remote') || '',
    gaji: p.get('gaji') || '',
    durasi: p.get('durasi') || ''
  };

  document.getElementById('hpSearchInput').value = currentParams.q || '';
  if (currentParams.bidang) document.getElementById('fpBidang').value = currentParams.bidang;
  if (currentParams.tipe) { const el = document.getElementById('fpTipeKerja'); if (el) el.value = currentParams.tipe; }
  if (currentParams.remote) document.getElementById('fpRemote').value = currentParams.remote;
  if (currentParams.gaji) document.getElementById('fpGaji').value = currentParams.gaji;
  if (currentParams.durasi) document.getElementById('fpDurasi').value = currentParams.durasi;

  loadAllJobs();
});

window.toggleBookmark = toggleBookmark;
window.toggleFilterPanel = toggleFilterPanel;
window.resetFilters = resetFilters;
window.applySearch = applySearch;
window.removeChip = removeChip;
window.quickSearch = quickSearch;
window.openDetail = openDetail;