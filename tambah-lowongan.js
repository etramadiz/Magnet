import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Cek login & role perusahaan
const session = JSON.parse(localStorage.getItem('magnet_session'));
if (!session) window.location.href = 'index.html';
const users = JSON.parse(localStorage.getItem('magnet_users') || '[]');
const currentUser = users.find(u => u.id === session.userId);
if (!currentUser || currentUser.type !== 'perusahaan') {
  alert('Hanya perusahaan yang bisa menambah lowongan');
  window.location.href = 'dashboard.html';
}

document.getElementById('formLowongan').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  const jobData = {
    title: document.getElementById('title').value,
    location: document.getElementById('location').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    salary: document.getElementById('salary').value,
    durasi: document.getElementById('duration').value,
    deadline: document.getElementById('deadline').value,
    // Data perusahaan dari profil
    company: currentUser.profile?.namaPerusahaan || currentUser.name,
    companyShort: currentUser.profile?.inisial || currentUser.name.substring(0,2).toUpperCase(),
    logoColor: currentUser.profile?.warna || '#1D3BD1',
    isNew: true,
    postedAt: new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}),
    tags: [],
    requirements: [],
    skills: [],
    benefits: []
  };

  try {
    const jobsRef = ref(db, 'jobs');
    const newJobRef = push(jobsRef);
    await set(newJobRef, jobData);
    alert('Lowongan berhasil dipublikasikan!');
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Gagal: ' + error.message);
    btn.disabled = false;
    btn.textContent = 'Publikasikan Lowongan';
  }
});