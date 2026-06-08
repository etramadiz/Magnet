// auth-firebase.js
import { auth, googleProvider, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Fungsi toast sederhana (fallback jika tidak ada toast global)
function showToast(msg, type = 'info') {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
    // Coba cari toast dari dashboard
    toast = document.getElementById('toast');
  }
  if (!toast) {
    alert(msg);
    return;
  }
  toast.textContent = msg;
  toast.className = 'toast show';
  if (type === 'error') toast.classList.add('error');
  if (type === 'success') toast.classList.add('success');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Ekspor ulang auth agar bisa diimpor di file lain
export { auth, db, googleProvider };

// Fungsi login untuk mahasiswa atau perusahaan
export async function firebaseLogin(email, password, expectedRole) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const snapshot = await get(ref(db, 'users/' + user.uid));
    const userData = snapshot.exists() ? snapshot.val() : {};
    const role = userData.tipeAkun || 'mahasiswa';

    if (role !== expectedRole) {
      showToast(`Akun ini bukan akun ${expectedRole}.`, 'error');
      await signOut(auth);
      return false;
    }

    const localUser = {
      id: user.uid,
      name: userData.namaLengkap || user.email,
      email: user.email,
      type: role,
      profile: userData.profile || {}
    };
    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    const idx = users.findIndex(u => u.id === user.uid);
    if (idx !== -1) users[idx] = localUser;
    else users.push(localUser);
    localStorage.setItem('magnet_users', JSON.stringify(users));
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));

    // Sinkronkan profil dari Firebase
    await syncProfileFromFirebase(user.uid);

    showToast(`Halo, ${localUser.name}!`, 'success');
    return true;
  } catch (err) {
    showToast('Login gagal: ' + err.message, 'error');
    return false;
  }
}

// Fungsi register (mahasiswa/perusahaan)
export async function firebaseRegister(data, role) {
  const { name, email, phone, password, universitas, semester, jurusan, ipk } = data;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      namaLengkap: name,
      email: email,
      nomorTelepon: phone || '',
      tipeAkun: role,
      createdAt: new Date().toISOString(),
      profile: {
        universitas: universitas || '',
        semester: semester || '',
        jurusan: jurusan || '',
        ipk: ipk || '',
        skills: [],
        minats: [],
        pendidikan: '',
        pengalaman: '',
        prestasi: '',
        cv: null,
        avatar: null
      }
    };

    await set(ref(db, 'users/' + user.uid), userData);
    
    if (role === 'perusahaan') {
      await set(ref(db, `companies/${user.uid}`), {
        nama: name,
        email: email,
        createdAt: new Date().toISOString()
      });
    }

    // Simpan ke localStorage
    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    users.push({
      id: user.uid,
      name: name,
      email: email,
      type: role,
      profile: userData.profile
    });
    localStorage.setItem('magnet_users', JSON.stringify(users));

    await signOut(auth);
    showToast('Pendaftaran berhasil! Silakan masuk.', 'success');
    return { success: true, uid: user.uid };
  } catch (err) {
    showToast('Gagal daftar: ' + err.message, 'error');
    return { success: false };
  }
}

// Login dengan Google
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
      await set(ref(db, 'users/' + user.uid), {
        namaLengkap: user.displayName || '',
        email: user.email,
        tipeAkun: expectedRole,
        createdAt: new Date().toISOString()
      });
    }
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

// Cek session redirect
export function checkSessionAndRedirect() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const snapshot = await get(ref(db, 'users/' + user.uid));
      const role = snapshot.exists() ? snapshot.val().tipeAkun : 'mahasiswa';
      if (!localStorage.getItem('magnet_session')) {
        localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid }));
      }
      const currentPath = window.location.pathname;
      if (currentPath.includes('login') || currentPath.includes('register') || currentPath.endsWith('index.html')) {
        if (role === 'perusahaan') window.location.href = '../Page_Perusahaan/dashboard.html';
        else window.location.href = '../Page_Mahasiswa/dashboard.html';
      }
    }
  });
}

// Sinkron profil dari Firebase ke localStorage
export async function syncProfileFromFirebase(uid) {
  try {
    const snapshot = await get(ref(db, 'users/' + uid));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const profile = userData.profile || {};
      const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
      const idx = users.findIndex(u => u.id === uid);
      if (idx !== -1) {
        users[idx].profile = profile;
        localStorage.setItem('magnet_users', JSON.stringify(users));
      }
      return profile;
    }
    return null;
  } catch (err) {
    console.error('Gagal sync profil:', err);
    return null;
  }
}

// Simpan profil ke Firebase
export async function saveProfileToFirebase(uid, profileData) {
  try {
    await set(ref(db, 'users/' + uid + '/profile'), profileData);
    return true;
  } catch (err) {
    console.error('Gagal simpan profil ke Firebase:', err);
    return false;
  }
}

// Update data perusahaan (opsional)
export async function updateCompanyProfile(uid, data) {
  await set(ref(db, `companies/${uid}`), data, { merge: true });
}