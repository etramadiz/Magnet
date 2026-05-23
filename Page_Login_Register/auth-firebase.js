// auth-firebase.js
import { auth, googleProvider, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Fungsi showToast (salin dari auth.js jika perlu)
function showToast(msg, type = 'info') {
  let toast = document.getElementById('auth-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show';
  if (type === 'error') toast.classList.add('error');
  if (type === 'success') toast.classList.add('success');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Fungsi login untuk mahasiswa atau perusahaan
export async function firebaseLogin(email, password, expectedRole) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Ambil data dari Realtime Database
    const snapshot = await get(ref(db, 'users/' + user.uid));
    const userData = snapshot.exists() ? snapshot.val() : {};
    const role = userData.tipeAkun || 'mahasiswa';

    if (role !== expectedRole) {
      showToast(`Akun ini bukan akun ${expectedRole}.`, 'error');
      await signOut(auth);
      return false;
    }

    // Simpan ke localStorage (agar dibaca halaman lain)
    const localUser = {
      id: user.uid,
      name: userData.namaLengkap || user.email,
      email: user.email,
      type: role,
    };
    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    const idx = users.findIndex(u => u.id === user.uid);
    if (idx !== -1) users[idx] = localUser;
    else users.push(localUser);
    localStorage.setItem('magnet_users', JSON.stringify(users));
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));

    showToast(`Halo, ${localUser.name}!`, 'success');
    return true;
  } catch (err) {
    showToast('Login gagal: ' + err.message, 'error');
    return false;
  }
}

// Fungsi register mahasiswa/perusahaan
export async function firebaseRegister(data, role) {
  const { name, email, phone, password } = data;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Simpan ke Realtime Database
    await set(ref(db, 'users/' + user.uid), {
      namaLengkap: name,
      email: email,
      nomorTelepon: phone || '',
      tipeAkun: role,
      createdAt: new Date().toISOString()
    });
    // Simpan ke localStorage (opsional)
    const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    users.push({ id: user.uid, name, email, type: role });
    localStorage.setItem('magnet_users', JSON.stringify(users));
    await signOut(auth); // logout otomatis, user harus login setelah daftar
    showToast('Pendaftaran berhasil! Silakan masuk.', 'success');
    return true;
  } catch (err) {
    showToast('Gagal daftar: ' + err.message, 'error');
    return false;
  }
}

// Fungsi login dengan Google
export async function firebaseGoogleLogin(expectedRole) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const snapshot = await get(ref(db, 'users/' + user.uid));
    let role = expectedRole;
    if (snapshot.exists()) {
      role = snapshot.val().tipeAkun;
      if (role !== expectedRole) {
        showToast(`Akun Google ini sudah terdaftar sebagai ${role}.`, 'error');
        await signOut(auth);
        return false;
      }
    } else {
      // Pengguna baru: simpan dengan role yang dipilih
      await set(ref(db, 'users/' + user.uid), {
        namaLengkap: user.displayName || '',
        email: user.email,
        tipeAkun: expectedRole,
        createdAt: new Date().toISOString()
      });
    }
    // Simpan ke localStorage
    const localUser = { id: user.uid, name: user.displayName || user.email, email: user.email, type: role };
    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    if (!users.find(u => u.id === user.uid)) users.push(localUser);
    localStorage.setItem('magnet_users', JSON.stringify(users));
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));
    showToast(`Halo, ${localUser.name}!`, 'success');
    return true;
  } catch (err) {
    showToast('Gagal login dengan Google', 'error');
    return false;
  }
}

// Fungsi untuk mengecek session saat halaman auth dimuat
export function checkSessionAndRedirect() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const snapshot = await get(ref(db, 'users/' + user.uid));
      const role = snapshot.exists() ? snapshot.val().tipeAkun : 'mahasiswa';
      // Simpan ke localStorage jika belum
      if (!localStorage.getItem('magnet_session')) {
        localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));
      }
      // Redirect ke dashboard sesuai role
      if (window.location.pathname.includes('login') || window.location.pathname.includes('register') || window.location.pathname.endsWith('index.html')) {
        if (role === 'perusahaan') window.location.href = '../Page_Perusahaan/dashboard.html';
        else window.location.href = '../Page_Mahasiswa/dashboard.html';
      }
    }
  });
}