/* ─────────────────────────────────────────
   Magnet – Forgot Password Logic
   Steps: 1) Email → 2) OTP → 3) New Password → 4) Success
───────────────────────────────────────── */

'use strict';

/* ── DOM refs ── */
const steps     = [1,2,3,4].map(n => document.getElementById(`step-${n}`));
const dots      = document.querySelectorAll('.dot');
const stepDots  = document.getElementById('step-dots');
const toast     = document.getElementById('toast');

// Step 1
const emailInput  = document.getElementById('email');
const emailError  = document.getElementById('email-error');
const btnSend     = document.getElementById('btn-send-code');
const backLogin   = document.getElementById('back-to-login');

// Step 2
const sentToEmail = document.getElementById('sent-to-email');
const otpInputs   = document.querySelectorAll('.otp-input');
const otpError    = document.getElementById('otp-error');
const btnResend   = document.getElementById('btn-resend');
const resendTimer = document.getElementById('resend-timer');
const btnVerify   = document.getElementById('btn-verify-otp');
const backStep1   = document.getElementById('back-to-step1');

// Step 3
const newPwInput  = document.getElementById('new-password');
const confirmPwInput = document.getElementById('confirm-password');
const newPwError  = document.getElementById('newpw-error');
const confirmPwError = document.getElementById('confirmpw-error');
const strengthBar = document.getElementById('strength-bar');
const strengthLabel = document.getElementById('strength-label');
const btnReset    = document.getElementById('btn-reset-password');

// Step 4 (Sukses)
const btnGoLogin  = document.getElementById('btn-go-login');


/* ─────────────────────────────────────────────────────────
   1. LOGIKA DETEKSI ROLE (MAHASISWA / PERUSAHAAN)
────────────────────────────────────────────────────────── */
// Ambil query parameter (?role=...) dari URL
const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get('role'); // hasil: 'mahasiswa' atau 'perusahaan'

// Tentukan file html tujuan berdasarkan role (default: mahasiswa)
let targetLoginFile = 'login-mahasiswa.html'; 

const badge = document.querySelector('.badge');

if (role === 'perusahaan') {
  targetLoginFile = 'login-perusahaan.html';
  if (badge) badge.textContent = '· PERUSAHAAN';
} else {
  targetLoginFile = 'login-mahasiswa.html';
  if (badge) badge.textContent = '· MAHASISWA';
}

// Pasang link tujuan ke tombol "Kembali ke Login" di Step 1
if (backLogin) {
  backLogin.setAttribute('href', targetLoginFile);
}

// Pasang event click ke tombol "Masuk Sekarang" di Step 4 Akhir
if (btnGoLogin) {
  btnGoLogin.addEventListener('click', () => {
    window.location.href = targetLoginFile;
  });
}


/* ─────────────────────────────────────────────────────────
   2. LOGIKA NAVIGASI ANTAR STEP
────────────────────────────────────────────────────────── */
function goToStep(stepNum) {
  // Sembunyikan semua step, tampilkan yang aktif
  steps.forEach((el, idx) => {
    if (el) {
      if (idx === stepNum - 1) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Update indikator dots bawah
  dots.forEach((dot, idx) => {
    if (idx === stepNum - 1) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Sembunyikan dots jika sudah sampai di Step 4 (Sukses)
  if (stepNum === 4 && stepDots) {
    stepDots.classList.add('hidden');
  } else if (stepDots) {
    stepDots.classList.remove('hidden');
  }
}

/* Toast Message Utility */
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}


/* ─────────────────────────────────────────────────────────
   3. LOGIKA VALIDASI STEP 1 (INPUT EMAIL)
────────────────────────────────────────────────────────── */
btnSend.addEventListener('click', () => {
  const val = emailInput.value.trim();
  emailError.textContent = '';
  emailInput.classList.remove('error');

  if (!val) {
    emailError.textContent = 'Email atau nomor telepon tidak boleh kosong.';
    emailInput.classList.add('error');
    return;
  }

  // Simulasi loading kirim kode OTP
  btnSend.disabled = true;
  btnSend.textContent = 'Mengirim...';

  setTimeout(() => {
    btnSend.disabled = false;
    btnSend.textContent = 'Kirim Kode Verifikasi';
    
    // Tampilkan email tujuan di Step 2
    if (sentToEmail) sentToEmail.textContent = val;
    
    goToStep(2);
    startResendTimer();
    otpInputs[0].focus();
  }, 1200);
});


/* ─────────────────────────────────────────────────────────
   4. LOGIKA VALIDASI STEP 2 (INPUT OTP 6 DIGIT)
────────────────────────────────────────────────────────── */
// Autowrap & autofocus perpindahan kotak input OTP
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value;
    // Bersihkan jika input bukan angka
    e.target.value = value.replace(/[^0-9]/g, '');

    if (e.target.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

/* Timer Kirim Ulang OTP */
let timerInterval;
function startResendTimer() {
  let seconds = 50;
  btnResend.disabled = true;
  resendTimer.style.display = 'inline';
  resendTimer.textContent = `(${seconds}s)`;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds--;
    resendTimer.textContent = `(${seconds}s)`;
    if (seconds <= 0) {
      clearInterval(timerInterval);
      btnResend.disabled = false;
      resendTimer.style.display = 'none';
    }
  }, 1000);
}

btnResend.addEventListener('click', () => {
  showToast('Kode verifikasi baru berhasil dikirim!');
  startResendTimer();
});

/* Validasi Tombol Verifikasi OTP */
btnVerify.addEventListener('click', () => {
  let otpCode = '';
  otpInputs.forEach(input => otpCode += input.value);
  
  otpError.textContent = '';
  otpInputs.forEach(input => input.classList.remove('error'));

  if (otpCode.length < 6) {
    otpError.textContent = 'Silakan masukkan 6 digit kode verifikasi lengkap.';
    otpInputs.forEach(input => { if(!input.value) input.classList.add('error'); });
    return;
  }

  btnVerify.disabled = true;
  btnVerify.textContent = 'Memverifikasi...';

  setTimeout(() => {
    btnVerify.disabled = false;
    btnVerify.textContent = 'Verifikasi Kode';
    goToStep(3);
  }, 1000);
});

if (backStep1) {
  backStep1.addEventListener('click', (e) => {
    e.preventDefault();
    goToStep(1);
  });
}


/* ─────────────────────────────────────────────────────────
   5. LOGIKA VALIDASI STEP 3 (GANTI PASSWORD BARU)
────────────────────────────────────────────────────────── */
/* Pengecek kekuatan password saat diketik */
newPwInput.addEventListener('input', () => {
  const val = newPwInput.value;
  let score = 0;
  
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  strengthBar.className = 'strength-bar';
  if (val.length === 0) {
    strengthLabel.textContent = '';
  } else if (score <= 1) {
    strengthBar.classList.add('weak');
    strengthLabel.textContent = 'Lemah';
  } else if (score <= 3) {
    strengthBar.classList.add('medium');
    strengthLabel.textContent = 'Sedang';
  } else {
    strengthBar.classList.add('strong');
    strengthLabel.textContent = 'Kuat';
  }
});

/* Reset Password Form Submission */
btnReset.addEventListener('click', () => {
  const pw = newPwInput.value;
  const cpw = confirmPwInput.value;
  let valid = true;

  newPwError.textContent = '';
  confirmPwError.textContent = '';
  newPwInput.classList.remove('error');
  confirmPwInput.classList.remove('error');

  if (!pw) {
    newPwError.textContent = 'Kata sandi tidak boleh kosong.';
    newPwInput.classList.add('error');
    valid = false;
  } else if (pw.length < 8) {
    newPwError.textContent = 'Kata sandi minimal 8 karakter.';
    newPwInput.classList.add('error');
    valid = false;
  }

  if (!cpw) {
    confirmPwError.textContent = 'Konfirmasi kata sandi tidak boleh kosong.';
    confirmPwInput.classList.add('error');
    valid = false;
  } else if (pw && cpw && pw !== cpw) {
    confirmPwError.textContent = 'Kata sandi tidak cocok. Periksa kembali.';
    confirmPwInput.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  btnReset.disabled = true;
  btnReset.textContent = 'Menyimpan...';

  // Simulasi API ganti password sukses
  setTimeout(() => {
    btnReset.disabled = false;
    btnReset.textContent = 'Konfirmasi Ganti Sandi';
    goToStep(4);
  }, 1200);
});

/* Live pengecekan kesamaan password */
confirmPwInput.addEventListener('input', () => {
  if (confirmPwInput.value && newPwInput.value !== confirmPwInput.value) {
    confirmPwError.textContent = 'Kata sandi belum cocok.';
    confirmPwInput.classList.add('error');
  } else {
    confirmPwError.textContent = '';
    confirmPwInput.classList.remove('error');
  }
});