import { db } from './firebase-config.js';
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

export async function fetchAllJobs() {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, 'jobs'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    // Ubah object menjadi array dan tambahkan properti id dari key
    const jobsArray = Object.entries(data).map(([key, value]) => ({
      id: key,  // string, misal "job1"
      ...value
    }));
    // Urutkan mungkin berdasarkan postedAt atau isNew
    return jobsArray;
  }
  return [];
}

export async function getJobById(id) {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `jobs/${id}`));
  if (snapshot.exists()) {
    return { id, ...snapshot.val() };
  }
  return null;
}