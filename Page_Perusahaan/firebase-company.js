// firebase-company.js
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from "../Page_Login_Register/firebase-config.js";

// Ambil data profil perusahaan berdasarkan UID
export async function getCompanyProfile(uid) {
  const snapshot = await get(ref(db, `companies/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// Simpan atau update data perusahaan
export async function updateCompanyProfile(uid, data) {
  await set(ref(db, `companies/${uid}`), data, { merge: true });
}

// Logout perusahaan
export async function logoutPerusahaan() {
  await signOut(auth);
  localStorage.removeItem('magnet_session');
}