// tambah-lowongan.js - FINAL dengan edit & update
import { auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { saveJob, updateJob, getJobById, getCompanyProfile } from './firebase-company.js';

let companyId = null;
let companyName = '';
let editingJobId = null; // ID lowongan yang sedang diedit (null jika tambah baru)

// Ambil parameter URL
const urlParams = new URLSearchParams(window.location.search);
const jobIdParam = urlParams.get('id');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../Page_Login_Register/login-perusahaan.html';
    return;
  }
  companyId = user.uid;
  const profile = await getCompanyProfile(companyId);
  companyName = profile?.nama || user.displayName || 'Perusahaan';
  
  // Jika mode edit, ambil data lowongan dan isi form
  if (jobIdParam) {
    editingJobId = jobIdParam;
    document.getElementById('formTitle').textContent = 'Edit Lowongan';
    const job = await getJobById(jobIdParam);
    if (job) {
      // Isi form dengan data yang ada
      document.getElementById('namaLowongan').value = job.title || '';
      document.getElementById('namaPerusahaan').value = job.companyName || companyName;
      document.getElementById('kategori').value = job.category || '';
      document.getElementById('lokasi').value = job.location || '';
      document.getElementById('durasi').value = job.duration || '';
      document.getElementById('batasDaftar').value = job.deadline || '';
      document.getElementById('modeKerja').value = job.workMode || '';
      document.getElementById('statusPekerjaan').value = job.type || '';
      document.getElementById('gajiMin').value = job.salaryMin || '';
      document.getElementById('gajiMax').value = job.salaryMax || '';
      document.getElementById('deskripsi').value = job.description || '';
      document.getElementById('persyaratan').value = (job.requirements || []).join('\n');
      document.getElementById('benefit').value = (job.benefits || []).join('\n');
      
      // Isi skill chips
      if (job.skills && job.skills.length) {
        skills.length = 0;
        skills.push(...job.skills);
        renderChips();
      }
    } else {
      alert('Data lowongan tidak ditemukan, akan membuat baru.');
      editingJobId = null;
    }
  }
});

const skills = [];

function renderChips() {
  const container = document.getElementById('skillChips');
  if (!container) return;
  container.innerHTML = skills.map((s, i) => `
    <span class="skill-chip">
      ${s}
      <button onclick="removeSkill(${i})" title="Hapus">&times;</button>
    </span>
  `).join('');
}

function addSkill() {
  const input = document.getElementById('skillInput');
  const val = input.value.trim();
  if (val && !skills.includes(val)) {
    skills.push(val);
    renderChips();
    input.value = '';
  }
  input.focus();
}

function removeSkill(idx) {
  skills.splice(idx, 1);
  renderChips();
}

const skillInput = document.getElementById('skillInput');
if (skillInput) {
  skillInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  });
}

async function saveForm(mode) {
  const title = document.getElementById('namaLowongan').value.trim();
  if (!title) { alert('Nama lowongan harus diisi.'); return; }
  if (!companyId) { alert('Sesi tidak valid, silakan login ulang.'); return; }

  const jobData = {
    title: title,
    companyName: companyName,
    type: document.getElementById('statusPekerjaan').value,
    duration: document.getElementById('durasi').value,
    description: document.getElementById('deskripsi').value,
    salaryMin: parseInt(document.getElementById('gajiMin').value) || 0,
    salaryMax: parseInt(document.getElementById('gajiMax').value) || 0,
    salary: `${document.getElementById('gajiMin').value || 0} – ${document.getElementById('gajiMax').value || 0}`,
    location: document.getElementById('lokasi').value,
    category: document.getElementById('kategori').value,
    skills: [...skills],
    deadline: document.getElementById('batasDaftar').value,
    workMode: document.getElementById('modeKerja').value,
    requirements: document.getElementById('persyaratan').value.split('\n').filter(r => r.trim()),
    benefits: document.getElementById('benefit').value.split('\n').filter(b => b.trim()),
    status: mode === 'publish' ? 'Buka' : 'Draft'
  };

  // Jangan hapus field kosong, biarkan tetap ada

  try {
    let result;
    if (editingJobId) {
      // Update existing job
      result = await updateJob(editingJobId, jobData);
    } else {
      // Create new job
      result = await saveJob(jobData, companyId);
    }
    if (result.ok) {
      alert(mode === 'publish' ? `Lowongan "${title}" berhasil dipublikasikan!` : `Lowongan "${title}" disimpan sebagai draft.`);
      window.location.href = 'dashboard.html';
    } else {
      alert('Gagal menyimpan lowongan.');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan: ' + err.message);
  }
}

renderChips();
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.saveForm = saveForm;