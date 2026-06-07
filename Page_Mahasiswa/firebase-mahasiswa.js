import { db } from '../Page_Login_Register/firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export async function saveMahasiswaProfile(uid, data) {
  await setDoc(doc(db, "mahasiswa", uid), data, { merge: true });
}

export async function getMahasiswaProfile(uid) {
  const snap = await getDoc(doc(db, "mahasiswa", uid));
  return snap.exists() ? snap.data() : null;
}