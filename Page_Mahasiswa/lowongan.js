/* ═══════════════════════════════════════════════════════════
   MAGNET – LOWONGAN.JS
════════════════════════════════════════════════════════════ */

let lastSearch = null;

/* ── Show/hide clear (✕) buttons on keyword inputs ── */
function onSearchInput() {
  ['kwKeyword', 'kwLokasi'].forEach(id => {
    const input    = document.getElementById(id);
    const clearBtn = document.getElementById('clear' + id.charAt(0).toUpperCase() + id.slice(1));
    if (input && clearBtn) clearBtn.style.display = input.value ? 'block' : 'none';
  });
}

function clearField(id) {
  const el = document.getElementById(id);
  if (el) el.value = '';
  const btn = document.getElementById('clear' + id.charAt(0).toUpperCase() + id.slice(1));
  if (btn) btn.style.display = 'none';
}

/* ── CARI — baca semua input lalu redirect ke hasil-pencarian.html ── */
function doSearch() {
  const keyword  = (document.getElementById('kwKeyword')?.value  || '').trim();
  const bidang   = (document.getElementById('kwBidang')?.value   || '');
  const lokasi   = (document.getElementById('kwLokasi')?.value   || '').trim();
  const tipe     = (document.getElementById('fsTipeKerja')?.value || '');
  const remote   = (document.getElementById('fsRemote')?.value   || '');
  const gaji     = (document.getElementById('fsGaji')?.value     || '');
  const durasi   = (document.getElementById('fsDurasi')?.value   || '');

  /* Simpan ke localStorage supaya halaman hasil bisa baca */
  const parts = [keyword, bidang, lokasi ? 'di ' + lokasi : ''].filter(Boolean);
  const label = parts.length ? parts.join(' · ') : 'Semua lowongan';
  lastSearch = { keyword, bidang, lokasi, tipe, remote, gaji, durasi, label };
  localStorage.setItem('lw_lastSearch', JSON.stringify(lastSearch));

  /* Tampilkan pencarian terakhir */
  showLastSearch(label);

  /* Build query string */
  const params = new URLSearchParams();
  if (keyword) params.set('q',      keyword);
  if (bidang)  params.set('bidang', bidang);
  if (lokasi)  params.set('lokasi', lokasi);
  if (tipe)    params.set('tipe',   tipe);
  if (remote)  params.set('remote', remote);
  if (gaji)    params.set('gaji',   gaji);
  if (durasi)  params.set('durasi', durasi);

  /* Redirect */
  window.location.href = 'hasil-pencarian.html?' + params.toString();
}

/* ── Last search ── */
function showLastSearch(text) {
  const wrap = document.getElementById('lastSearchWrap');
  const span = document.getElementById('lastSearchText');
  if (wrap) wrap.style.display = 'block';
  if (span) span.textContent   = text;
}

function rerunLastSearch() {
  if (!lastSearch) return;
  if (lastSearch.keyword) {
    const kw = document.getElementById('kwKeyword');
    if (kw) kw.value = lastSearch.keyword;
  }
  if (lastSearch.bidang) {
    const bd = document.getElementById('kwBidang');
    if (bd) bd.value = lastSearch.bidang;
  }
  if (lastSearch.lokasi) {
    const lk = document.getElementById('kwLokasi');
    if (lk) lk.value = lastSearch.lokasi;
  }
  if (lastSearch.tipe)   { const el = document.getElementById('fsTipeKerja'); if (el) el.value = lastSearch.tipe; }
  if (lastSearch.remote) { const el = document.getElementById('fsRemote');    if (el) el.value = lastSearch.remote; }
  if (lastSearch.gaji)   { const el = document.getElementById('fsGaji');      if (el) el.value = lastSearch.gaji; }
  if (lastSearch.durasi) { const el = document.getElementById('fsDurasi');    if (el) el.value = lastSearch.durasi; }
  doSearch();
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Guest diizinkan melihat halaman ini tanpa login
  restoreSidebarState();
  applyGuestMode();

  /* Avatar initial */
  const user = MagnetDB.getSession();
  if (user) {
    const av = document.getElementById('avatarInitial');
    if (av) av.textContent = user.name.charAt(0).toUpperCase();
  }

  /* Restore last search display */
  try {
    const saved = localStorage.getItem('lw_lastSearch');
    if (saved) {
      lastSearch = JSON.parse(saved);
      showLastSearch(lastSearch.label || '—');
    }
  } catch (e) { /* ignore */ }
});