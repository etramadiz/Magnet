// firebase-company.js - LENGKAP dengan CRUD Lowongan
import { ref, get, set, update, push, query, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from "../Page_Login_Register/firebase-config.js";

// ==================== PROFIL PERUSAHAAN ====================
export async function getCompanyProfile(uid) {
  const snapshot = await get(ref(db, `companies/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function updateCompanyProfile(uid, data) {
  await set(ref(db, `companies/${uid}`), data, { merge: true });
}

export async function logoutPerusahaan() {
  await signOut(auth);
  localStorage.removeItem('magnet_session');
}

// ==================== LOWONGAN (JOBS) ====================
// Simpan lowongan baru
export async function saveJob(jobData, companyId) {
  const jobsRef = ref(db, 'jobs');
  const newJobRef = push(jobsRef);
  const jobId = newJobRef.key;
  const jobWithMeta = {
    id: jobId,
    companyId: companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'Buka', // default
    ...jobData
  };
  await set(newJobRef, jobWithMeta);
  return { ok: true, jobId, job: jobWithMeta };
}
export async function getJobsByCompany(companyId) {
  const jobsRef = ref(db, 'jobs');
  const snapshot = await get(jobsRef);
  const jobs = [];
  snapshot.forEach(child => {
    const job = { id: child.key, ...child.val() };
    if (job.companyId === companyId) {
      jobs.push(job);
    }
  });
  jobs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  console.log("Filtered jobs for", companyId, jobs);
  return jobs;
}

// Ambil satu lowongan berdasarkan ID
export async function getJobById(jobId) {
  const jobRef = ref(db, `jobs/${jobId}`);
  const snapshot = await get(jobRef);
  return snapshot.exists() ? { id: snapshot.key, ...snapshot.val() } : null;
}

// Update lowongan
export async function updateJob(jobId, jobData) {
  const jobRef = ref(db, `jobs/${jobId}`);
  await update(jobRef, {
    ...jobData,
    updatedAt: new Date().toISOString()
  });
  return { ok: true };
}

// Hapus lowongan
export async function deleteJob(jobId) {
  const jobRef = ref(db, `jobs/${jobId}`);
  await remove(jobRef);
  return { ok: true };
}