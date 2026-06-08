// auth-firebase.js
import { auth, googleProvider, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged          // 🔥 IMPORT YANG HILANG
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Fungsi toast sederhana (fallback jika tidak ada toast global)
function showToast(msg, type = 'info') {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
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
export { auth, db, googleProvider, onAuthStateChanged };

// ========== FUNGSI LOGIN/REGISTER ==========
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

    // Ambil nama dari database jika ada
    let userName = user.displayName || user.email;
    if (snapshot.exists() && snapshot.val().namaLengkap) {
      userName = snapshot.val().namaLengkap;
    }

    // ✅ Ambil profile dari node mahasiswa atau users
    const mahasiswaSnap = await get(ref(db, `mahasiswa/${user.uid}`));
    let profileData = mahasiswaSnap.exists() ? mahasiswaSnap.val() : {};
    if (!profileData || Object.keys(profileData).length === 0) {
      profileData = userData.profile || {};
    }

    const localUser = {
      id: user.uid,
      name: userName,
      email: user.email,
      type: role,
      profile: profileData
    };

    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    const idx = users.findIndex(u => u.id === user.uid);
    if (idx !== -1) users[idx] = localUser;
    else users.push(localUser);
    localStorage.setItem('magnet_users', JSON.stringify(users));
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid, type: role }));

    await syncProfileFromFirebase(user.uid);
    showToast(`Halo, ${localUser.name}!`, 'success');

    // ✅ JANGAN redirect di sini – biarkan onAuthStateChanged yang handle
    return true;
  } catch (err) {
    showToast('Login gagal: ' + err.message, 'error');
    return false;
  }
}

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
        minat: [],
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

//google login

export async function firebaseGoogleLogin(expectedRole) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const snapshot = await get(ref(db, 'users/' + user.uid));
    let role = expectedRole;
    let userName = user.displayName || user.email; // fallback

    if (snapshot.exists()) {
      role = snapshot.val().tipeAkun;
      if (role !== expectedRole) {
        showToast(`Akun Google ini sudah terdaftar sebagai ${role}.`, 'error');
        await signOut(auth);
        return false;
      }
      // Gunakan nama dari database jika ada
      if (snapshot.val().namaLengkap) {
        userName = snapshot.val().namaLengkap;
      }
    } else {
      await set(ref(db, 'users/' + user.uid), {
        namaLengkap: user.displayName || '',
        email: user.email,
        tipeAkun: expectedRole,
        createdAt: new Date().toISOString(),
        profile: {}
      });
    }

    // Sinkronkan profil dari node mahasiswa
    const mahasiswaSnapshot = await get(ref(db, `mahasiswa/${user.uid}`));
    let profileData = mahasiswaSnapshot.exists() ? mahasiswaSnapshot.val() : {};

    const localUser = {
      id: user.uid,
      name: userName,
      email: user.email,
      type: role,
      profile: profileData
    };

    let users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    const idx = users.findIndex(u => u.id === user.uid);
    if (idx !== -1) users[idx] = localUser;
    else users.push(localUser);
    localStorage.setItem('magnet_users', JSON.stringify(users));
    localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid, type: role }));

    showToast(`Halo, ${localUser.name}!`, 'success');
    return true;
  } catch (err) {
    showToast('Gagal login dengan Google: ' + err.message, 'error');
    return false;
  }
}

export async function syncProfileFromFirebase(uid) {
  try {
    // Ambil dari node mahasiswa (profil lengkap)
    const mahasiswaSnap = await get(ref(db, `mahasiswa/${uid}`));
    let profile = mahasiswaSnap.exists() ? mahasiswaSnap.val() : {};
    
    // Jika tidak ada, coba dari node users (fallback)
    if (!profile || Object.keys(profile).length === 0) {
      const userSnap = await get(ref(db, `users/${uid}`));
      if (userSnap.exists()) {
        profile = userSnap.val().profile || {};
      }
    }
    
    // Update localStorage
    const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
    const idx = users.findIndex(u => u.id === uid);
    
    if (idx !== -1) {
      // Jika user sudah ada di lokal, perbarui datanya
      users[idx].profile = profile;
      if (profile.name) users[idx].name = profile.name;
      if (profile.avatar) users[idx].avatar = profile.avatar; // <-- Memastikan foto ikut terupdate
    } else {
      // 🔥 PERBAIKAN: Jika user BELUM ADA di lokal (misal cache habis dibersihkan), buat data baru!
      const newUser = {
        id: uid,
        name: profile.name || 'Pengguna',
        avatar: profile.avatar || null,
        type: 'mahasiswa', // tipe default
        profile: profile
      };
      users.push(newUser);
    }
    
    localStorage.setItem('magnet_users', JSON.stringify(users));
    
    // Update MagnetDB juga jika fungsi tersedia
    if (window.MagnetDB) MagnetDB.saveProfile(profile);
    
    return profile;
  } catch (err) {
    console.error('Gagal sync profil:', err);
    return null;
  }
}

export async function saveProfileToFirebase(uid, profileData) {
  try {
    // Simpan ke node mahasiswa (Realtime Database)
    await set(ref(db, `mahasiswa/${uid}`), profileData);
    // Juga update ke users/profile untuk kompatibilitas
    await set(ref(db, 'users/' + uid + '/profile'), profileData);
    return true;
  } catch (err) {
    console.error('Gagal simpan profil ke Firebase:', err);
    return false;
  }
}

export function checkSessionAndRedirect() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snapshot = await get(ref(db, 'users/' + user.uid));
      const role = snapshot.exists() ? snapshot.val().tipeAkun : 'mahasiswa';
      
      if (!localStorage.getItem('magnet_session')) {
        localStorage.setItem('magnet_session', JSON.stringify({ userId: user.uid, type: role }));
      }

      // 🔥 TAMBAHAN WAJIB: Sinkronkan profil ke array magnet_users sebelum pindah halaman
      await syncProfileFromFirebase(user.uid);

      const currentPath = window.location.pathname;
      // Hanya redirect jika sedang di halaman login/register/index
      if (currentPath.includes('login') || currentPath.includes('register') || currentPath.endsWith('index.html')) {
        if (role === 'perusahaan') {
          if (!currentPath.includes('Page_Perusahaan')) {
            window.location.href = '../Page_Perusahaan/dashboard.html';
          }
        } else {
          if (!currentPath.includes('Page_Mahasiswa')) {
            window.location.href = '../Page_Mahasiswa/dashboard.html';
          }
        }
      }
    }
  });
}

// ========== FUNGSI GLOBAL UNTUK HTML (GOOGLE AUTH) ==========
window.googleAuthMahasiswa = async () => {
  const success = await firebaseGoogleLogin('mahasiswa');
  if (success) window.location.href = '../Page_Mahasiswa/dashboard.html';
};

window.googleAuthPerusahaan = async () => {
  const success = await firebaseGoogleLogin('perusahaan');
  if (success) window.location.href = '../Page_Perusahaan/dashboard.html';
};

// Update data perusahaan (opsional)
export async function updateCompanyProfile(uid, data) {
  await set(ref(db, `companies/${uid}`), data, { merge: true });
}