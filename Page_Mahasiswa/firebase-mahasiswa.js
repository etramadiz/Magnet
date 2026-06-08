// firebase-mahasiswa.js
import { db, auth } from '../Page_Login_Register/firebase-config.js';
import { ref, push, set, get, update, query, onValue, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Simpan atau perbarui profil mahasiswa ke Firestore
export async function saveMahasiswaProfile(uid, data) {
  if (!uid) throw new Error('UID tidak ditemukan');
  const userRef = ref(db, `mahasiswa/${uid}`);
  await set(userRef, data);
  const session = MagnetDB.getSession?.();
  if (session && session.id === uid) {
    MagnetDB.saveProfile?.(data);
  }
}

// Ambil profil mahasiswa dari Firestore
export async function getMahasiswaProfile(uid) {
  if (!uid) return null;
  const userRef = ref(db, `mahasiswa/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
}

// Update sebagian data (opsional)
export async function updateMahasiswaProfile(uid, updates) {
  if (!uid) throw new Error('UID tidak ditemukan');
  const userRef = ref(db, `mahasiswa/${uid}`);
  await update(userRef, updates);
}

// Simpan lamaran ke Firebase Realtime Database
export async function saveApplicationToFirebase(application) {
  const appsRef = ref(db, 'applications');
  const newAppRef = push(appsRef);
  const appWithId = {
    ...application,
    id: newAppRef.key,
    createdAt: new Date().toISOString()
  };
  await set(newAppRef, appWithId);
  return newAppRef.key;
}

// Ambil lamaran berdasarkan ID
export async function getApplicationById(appId) {
  const appRef = ref(db, `applications/${appId}`);
  const snapshot = await get(appRef);
  return snapshot.exists() ? { id: snapshot.key, ...snapshot.val() } : null;
}

// Ambil semua lamaran untuk user tertentu
export async function getApplicationsForUser(userId) {
  const appsRef = ref(db, 'applications');
  const q = query(appsRef, orderByChild('userId'), equalTo(userId));
  const snapshot = await get(q);
  const apps = [];
  snapshot.forEach(child => {
    apps.push({ id: child.key, ...child.val() });
  });
  apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  return apps;
}