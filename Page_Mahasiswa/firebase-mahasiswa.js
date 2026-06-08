// firebase-mahasiswa.js
import { db, auth } from '../Page_Login_Register/firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Simpan atau perbarui profil mahasiswa ke Firestore
export async function saveMahasiswaProfile(uid, data) {
  if (!uid) throw new Error('UID tidak ditemukan');
  const userRef = doc(db, "mahasiswa", uid);
  await setDoc(userRef, data, { merge: true });
  const session = MagnetDB.getSession?.();
  if (session && session.id === uid) {
    MagnetDB.saveProfile?.(data);
  }
}

// Ambil profil mahasiswa dari Firestore
export async function getMahasiswaProfile(uid) {
  if (!uid) return null;
  const userRef = doc(db, "mahasiswa", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

// Update sebagian data (opsional)
export async function updateMahasiswaProfile(uid, updates) {
  if (!uid) throw new Error('UID tidak ditemukan');
  const userRef = doc(db, "mahasiswa", uid);
  await updateDoc(userRef, updates);
}

// Observasi perubahan real-time (opsional, untuk dashboard/profil)
export function onMahasiswaProfile(uid, callback) {
  if (!uid) return () => {};
  const userRef = doc(db, "mahasiswa", uid);
  return onSnapshot(userRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}