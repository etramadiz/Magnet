/* ═══════════════════════════════════════════════════════════
   MAGNET – AUTH.JS
════════════════════════════════════════════════════════════ */
let _toastTimer = null;

function showToast(message, type = 'info', duration = 3200) {
  let toast = document.getElementById('auth-toast');
  if (!toast) return;
  if (_toastTimer) clearTimeout(_toastTimer);
  toast.className = 'toast';
  void toast.offsetWidth;
  toast.textContent = message;
  toast.classList.add('show');
  if (type === 'success') toast.classList.add('success');
  if (type === 'error')   toast.classList.add('error');
  _toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!document.getElementById('shake-kf')) {
    const s = document.createElement('style'); s.id='shake-kf';
    s.textContent=`@keyframes _sk{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}._sk{animation:_sk .4s ease!important;border-color:#DC2626!important}`;
    document.head.appendChild(s);
  }
  el.classList.add('_sk');
  el.addEventListener('animationend', () => el.classList.remove('_sk'), { once:true });
}

function togglePw(inputId, btnEl) {
  const input = document.getElementById(inputId);
  const svg   = btnEl.querySelector('svg');
  if (!input || !svg) return;
  const EYE = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>`;
  const EYE_OFF = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>`;
  if (input.type === 'password') { input.type = 'text';     svg.innerHTML = EYE_OFF; }
  else                           { input.type = 'password'; svg.innerHTML = EYE; }
}

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function checkExistingSession() {
  const s = MagnetDB.getSession();
  if (!s || !s.id) return;
  if (s.type === 'perusahaan')
    window.location.href = '../Page_Perusahaan/dashboard.html';
  else
    window.location.href = '../Page_Mahasiswa/dashboard.html';
}
