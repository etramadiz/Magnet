// sidebar.js – Page Perusahaan

(function () {
  // Inject nama sesi ke navbar
  const session = MagnetDB.getSession();
  const nameEl = document.getElementById('navUserName');
  if (nameEl && session) nameEl.textContent = session.name;

  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  const mainArea  = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (!sidebar) return;

  function isMobile() { return window.innerWidth <= 900; }

  function openSidebar() {
    if (isMobile()) { sidebar.classList.add('open'); if (overlay) overlay.classList.add('visible'); }
    else { sidebar.classList.remove('collapsed'); if (mainArea) mainArea.classList.remove('full'); }
  }
  function closeSidebar() {
    if (isMobile()) { sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('visible'); }
    else { sidebar.classList.add('collapsed'); if (mainArea) mainArea.classList.add('full'); }
  }
  function toggleSidebar() {
    if (isMobile()) sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    else            sidebar.classList.contains('collapsed') ? openSidebar() : closeSidebar();
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  if (overlay)   overlay.addEventListener('click', closeSidebar);
  window.addEventListener('resize', () => {
    if (!isMobile()) { sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('visible'); }
  });

  // Set active nav
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    link.classList.toggle('active', href === page);
  });
})();

// Global logout untuk semua halaman perusahaan
async function handleLogout() {
  // Hapus session lokal
  MagnetDB.logout();
  // Logout dari Firebase
  const { signOut } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");
  const { auth } = await import("../Page_Login_Register/firebase-config.js");
  await signOut(auth);
  // Redirect ke halaman login
  window.location.href = '../Page_Login_Register/index.html';
}
