import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// 1. Cek sesi & role perusahaan
MagnetDB.requireAuth('index.html');
const session = MagnetDB.getSession();
if (!session || session.type !== 'perusahaan') {
  showToast('Hanya akun perusahaan yang bisa menambah lowongan');
  window.location.href = 'dashboard.html';
  throw new Error('Unauthorized');
}

// 2. Ambil data profil perusahaan dari localStorage (jika ada)
const profile = MagnetDB.getProfile();
const companyName = profile?.namaPerusahaan || session.name;
const companyShort = profile?.inisial || companyName.substring(0, 2).toUpperCase();
const logoColor = profile?.warna || '#1D3BD1';

document.addEventListener('DOMContentLoaded', () => {
  restoreSidebarState();
  document.getElementById('btnSimpan').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSimpan');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
      // Kumpulkan data form
      const title = document.getElementById('title').value.trim();
      const department = document.getElementById('department').value.trim();
      const location = document.getElementById('location').value.trim();
      const remoteKey = document.getElementById('remoteKey').value;
      const tipeKey = document.getElementById('tipeKey').value;
      const type = { magang: 'Magang', parttime: 'Part-time', fulltime: 'Full-time' }[tipeKey];
      const category = document.getElementById('category').value;
      const salary = document.getElementById('salary').value.trim();
      const salaryMin = parseFloat(document.getElementById('salaryMin').value);
      const salaryMax = parseFloat(document.getElementById('salaryMax').value);
      const durasi = document.getElementById('durasi').value;
      const durasiLabel = { '1-3': '1 – 3 Bulan', '3-6': '3 – 6 Bulan', '6+': '6 Bulan+' }[durasi];
      const deadline = document.getElementById('deadline').value.trim();
      const quota = parseInt(document.getElementById('quota').value);
      const description = document.getElementById('description').value.trim();
      
      // Skills, requirements, benefits: dari string dipisah koma
      const rawReq = document.getElementById('requirements').value.trim();
      const requirements = rawReq ? rawReq.split(',').map(s => s.trim()).filter(Boolean) : [];
      const rawSkills = document.getElementById('skills').value.trim();
      const skills = rawSkills ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
      const rawBenefits = document.getElementById('benefits').value.trim();
      const benefits = rawBenefits ? rawBenefits.split(',').map(s => s.trim()).filter(Boolean) : [];

      // Data job untuk Firebase
      const jobData = {
        title,
        company: companyName,
        companyId: session.id, // atau companyId dari profil
        companyShort,
        logoColor,
        department,
        type,
        tipeKey,
        remoteKey,
        location,
        salaryMin,
        salaryMax,
        salary,
        durasi,
        durasiLabel,
        deadline,
        quota,
        description,
        requirements,
        skills,
        benefits,
        category,
        tags: skills.slice(0, 3), // ambil 3 skill pertama sebagai tags
        isNew: true,
        postedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        createdBy: session.id // UID perusahaan
      };

      // Simpan ke Firebase
      const jobsRef = ref(db, 'jobs');
      const newJobRef = push(jobsRef);
      await set(newJobRef, jobData);

      showToast('Lowongan berhasil dipublikasikan!');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast('Gagal menyimpan: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Publikasikan Lowongan';
    }
  });
});