/* ═══════════════════════════════════════════════════════════
   MAGNET – NOTIFIKASI.JS
════════════════════════════════════════════════════════════ */

const NOTIF_KEY = 'mg_notif_read';

/* ── Notification data by tab ── */
function buildNotifications(userProfile) {
  const skills  = userProfile?.skills  || [];
  const minat   = userProfile?.minat   || [];
  const jurusan = userProfile?.jurusan || 'jurusanmu';

  return {
    penting: [
      {
        id: 'p1', unread: true, type: 'deadline',
        label: 'Pengumuman',
        title: '⚠️ Batas waktu pendaftaran hampir habis!',
        desc: 'Lowongan UI/UX Designer Intern di Tokopedia akan ditutup dalam 3 hari (20 Juni 2026). Segera lamar sekarang!',
        time: '1 jam lalu',
        cta: { text: 'Lihat Lowongan', href: 'detail-lowongan.html?id=3' },
      },
      {
        id: 'p2', unread: true, type: 'info',
        label: 'Info Penting',
        title: '🎯 Profil kamu dilihat recruiter!',
        desc: 'Recruiter dari PT Adi Data Informatika telah melihat profilmu. Pastikan profil kamu sudah lengkap untuk meningkatkan peluang.',
        time: '3 jam lalu',
        cta: { text: 'Lengkapi Profil', href: 'lengkapi-profil.html?edit=1' },
      },
      {
        id: 'p3', unread: false, type: 'tip',
        label: 'Tips Karir',
        title: '💡 Tips: Tingkatkan peluang lamaranmu',
        desc: 'Profil dengan CV dan portofolio lengkap memiliki peluang 3× lebih besar untuk dipanggil wawancara. Yuk, lengkapi profilmu sekarang!',
        time: '1 hari lalu',
        cta: { text: 'Upload CV', href: 'lengkapi-profil.html?edit=1#sect-cv', style: 'outline' },
      },
      {
        id: 'p4', unread: false, type: 'deadline',
        label: 'Pengumuman',
        title: '📅 Deadline minggu ini',
        desc: 'Ada 3 lowongan yang akan ditutup minggu ini. Business Analyst Intern di Gojek (10 Juni), Digital Marketing Intern di Blibli (18 Juni), dan Data Analyst Intern di Shopee (25 Juni).',
        time: '2 hari lalu',
        cta: { text: 'Lihat Semua', href: 'lowongan.html' },
      },
      {
        id: 'p5', unread: false, type: 'info',
        label: 'Pengumuman',
        title: '🚀 Fitur baru: Pencarian canggih tersedia!',
        desc: 'Kini kamu bisa memfilter lowongan berdasarkan gaji, durasi, dan mode kerja. Coba sekarang untuk menemukan lowongan yang paling cocok!',
        time: '3 hari lalu',
      },
    ],

    loker: [
      {
        id: 'l1', unread: true, type: 'loker',
        label: 'Rekomendasi Untukmu',
        title: `🔥 ${skills[0] || 'Skill'}? Ada lowongan baru yang cocok!`,
        desc: `Berdasarkan skill ${skills.slice(0,2).join(' & ') || 'yang kamu miliki'}, kami menemukan 5 lowongan baru yang sesuai. Jangan sampai kelewatan!`,
        time: '30 menit lalu',
        cta: { text: 'Lihat Lowongan', href: 'hasil-pencarian.html' },
      },
      {
        id: 'l2', unread: true, type: 'loker',
        label: 'Loker Baru',
        title: '🆕 Jr Quality Assurance (Automation) — PT Adi Data',
        desc: 'Gaji Rp 5–6,5 juta/bulan · Jakarta · Full time · Batas 30 Juni 2026',
        time: '1 jam lalu',
        cta: { text: 'Lihat Detail', href: 'detail-lowongan.html?id=1' },
      },
      {
        id: 'l3', unread: true, type: 'loker',
        label: 'Sesuai Jurusan',
        title: `📚 Lowongan baru untuk ${jurusan}`,
        desc: `Shopee membuka posisi Data Analyst Intern yang cocok untuk mahasiswa ${jurusan}. Gaji Rp 3,5–5 juta/bulan, hybrid working, 6 bulan.`,
        time: '2 jam lalu',
        cta: { text: 'Lamar Sekarang', href: 'detail-lowongan.html?id=6' },
      },
      {
        id: 'l4', unread: false, type: 'loker',
        label: 'Lowongan Populer',
        title: '⭐ UI/UX Designer Intern di Tokopedia — 99+ pelamar',
        desc: 'Lowongan ini diminati banyak kandidat. Hybrid, Rp 2,5–3,5 juta/bulan. Tutup 20 Juni 2026 — segera lamar!',
        time: '5 jam lalu',
        cta: { text: 'Lihat Detail', href: 'detail-lowongan.html?id=3' },
      },
      {
        id: 'l5', unread: false, type: 'loker',
        label: 'Remote Friendly',
        title: '💻 Remote? Business Analyst Intern di Gojek',
        desc: 'Cocok buat kamu yang mau kerja dari mana saja. Full remote, gaji Rp 2–3 juta/bulan, durasi 1–3 bulan.',
        time: '1 hari lalu',
        cta: { text: 'Lihat Detail', href: 'detail-lowongan.html?id=4' },
      },
      {
        id: 'l6', unread: false, type: 'loker',
        label: 'Loker Baru',
        title: '🖥️ Frontend Developer (React) — Bukalapak',
        desc: 'Gaji Rp 3–4,5 juta/bulan · Bandung · Remote OK · Durasi 3–6 bulan. Cocok untuk kamu yang kuasai React.',
        time: '2 hari lalu',
        cta: { text: 'Lihat Detail', href: 'detail-lowongan.html?id=5' },
      },
    ],

    lamaran: [
      {
        id: 'la1', unread: true, type: 'status',
        label: 'Update Lamaran',
        title: '👀 Lamaranmu dilihat recruiter!',
        desc: 'Recruiter PT Adi Data Informatika telah membuka lamaranmu untuk posisi Jr QA (Automation). Pantau terus statusnya!',
        time: '2 jam lalu',
        cta: { text: 'Lihat Status', href: 'lamaran.html' },
      },
      {
        id: 'la2', unread: false, type: 'status',
        label: 'Update Lamaran',
        title: '✅ Lamaran terkirim ke Tokopedia',
        desc: 'Lamaranmu untuk posisi UI/UX Designer Intern telah berhasil terkirim. Recruiter akan meninjau dalam 3–5 hari kerja.',
        time: '1 hari lalu',
        cta: { text: 'Lihat Detail', href: 'lamaran.html' },
      },
      {
        id: 'la3', unread: false, type: 'info',
        label: 'Tips Lamaran',
        title: '📝 Perkuat lamaranmu dengan cover letter',
        desc: 'Kandidat yang menyertakan catatan personal untuk recruiter memiliki peluang respons 40% lebih tinggi. Tulis pesanmu di halaman lamar!',
        time: '2 hari lalu',
      },
    ],

    aktivitas: [
      {
        id: 'ak1', unread: true, type: 'info',
        label: 'Aktivitas Akun',
        title: '🔐 Login baru terdeteksi',
        desc: 'Akun kamu baru saja masuk dari perangkat baru. Jika bukan kamu, segera ubah kata sandi.',
        time: '5 menit lalu',
      },
      {
        id: 'ak2', unread: false, type: 'status',
        label: 'Profil',
        title: '✏️ Profil kamu diperbarui',
        desc: 'Data profil berhasil disimpan. Kelengkapan profil kamu sekarang telah meningkat.',
        time: '1 hari lalu',
        cta: { text: 'Lihat Profil', href: 'profil.html' },
      },
      {
        id: 'ak3', unread: false, type: 'tip',
        label: 'Saran',
        title: '📊 Kelengkapan profil kamu',
        desc: 'Profil kamu saat ini belum 100% lengkap. Tambahkan skill, minat, dan CV untuk mendapatkan rekomendasi lowongan yang lebih personal.',
        time: '2 hari lalu',
        cta: { text: 'Lengkapi Sekarang', href: 'lengkapi-profil.html?edit=1', style: 'outline' },
      },
      {
        id: 'ak4', unread: false, type: 'info',
        label: 'Selamat Datang',
        title: '🎉 Selamat bergabung di Magnet!',
        desc: 'Akun kamu berhasil dibuat. Mulai lengkapi profil dan temukan lowongan magang terbaik yang sesuai denganmu.',
        time: '3 hari lalu',
        cta: { text: 'Mulai Eksplorasi', href: 'dashboard.html' },
      },
    ],
  };
}

/* ── Icon per type ── */
function iconHTML(type) {
  const icons = {
    loker:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    deadline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    status:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    info:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    tip:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };
  return icons[type] || icons.info;
}

/* ── State ── */
let activeTab  = 'penting';
let readSet    = new Set(JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'));
let notifData  = {};

function persistRead() { localStorage.setItem(NOTIF_KEY, JSON.stringify([...readSet])); }

/* ── Tabs ── */
function setTab(el) {
  document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeTab = el.dataset.tab;
  renderNotifs();
}

/* ── Render ── */
function renderNotifs() {
  const list  = document.getElementById('notifList');
  const items = notifData[activeTab] || [];
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<div class="notif-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <h3>Tidak ada notifikasi</h3>
      <p>Semua notifikasi di kategori ini sudah kamu baca atau belum ada yang baru.</p>
    </div>`;
    return;
  }

  // Group by date label
  list.innerHTML = `<div class="notif-date-header">Terbaru</div>` +
    items.map(n => {
      const isRead  = readSet.has(n.id);
      const unread  = n.unread && !isRead;
      const ctaHtml = n.cta
        ? `<a href="${n.cta.href}" class="notif-cta ${n.cta.style === 'outline' ? 'outline' : ''}" onclick="markRead('${n.id}'); event.stopPropagation();">${n.cta.text} →</a>`
        : '';
      return `
        <div class="notif-item ${unread ? 'unread' : ''}" id="notif-${n.id}" onclick="markRead('${n.id}')${n.cta ? '; window.location.href=\'' + n.cta.href + '\'' : ''}">
          <div class="notif-icon ${n.type}">${iconHTML(n.type)}</div>
          <div class="notif-content">
            <p class="notif-label">${n.label}</p>
            <p class="notif-title">${n.title}</p>
            <p class="notif-desc">${n.desc}</p>
            ${ctaHtml}
            <p class="notif-time">${n.time}</p>
          </div>
          <div class="notif-unread-dot"></div>
        </div>`;
    }).join('');
}

/* ── Mark read ── */
function markRead(id) {
  readSet.add(id);
  persistRead();
  const el = document.getElementById('notif-' + id);
  if (el) {
    el.classList.remove('unread');
    const dot = el.querySelector('.notif-unread-dot');
    if (dot) dot.style.display = 'none';
  }
  updateTabDots();
}

function markAllRead() {
  const items = notifData[activeTab] || [];
  items.forEach(n => readSet.add(n.id));
  persistRead();
  renderNotifs();
  updateTabDots();
  showToast('Semua notifikasi ditandai dibaca');
}

/* ── Update tab unread dots ── */
function updateTabDots() {
  Object.keys(notifData).forEach(tab => {
    const hasUnread = (notifData[tab] || []).some(n => n.unread && !readSet.has(n.id));
    const dot = document.getElementById('dot-' + tab);
    if (dot) dot.classList.toggle('visible', hasUnread);
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  MagnetDB.requireMahasiswaAuth();
  restoreSidebarState();

  const user    = MagnetDB.getSession();
  const profile = MagnetDB.getProfile();
  if (user) {
    const av = document.getElementById('avatarInitial');
    if (av) av.textContent = user.name.charAt(0).toUpperCase();
  }

  notifData = buildNotifications(profile);
  updateTabDots();
  renderNotifs();
});