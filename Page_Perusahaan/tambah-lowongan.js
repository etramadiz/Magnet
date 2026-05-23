// tambah-lowongan.js - FINAL
import { auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { saveJob, getCompanyProfile } from './firebase-company.js';

let companyId = null;
let companyName = '';

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../Page_Login_Register/login-perusahaan.html';
    return;
  }
  companyId = user.uid;
  // Ambil nama perusahaan dari profil Firebase
  const profile = await getCompanyProfile(companyId);
  companyName = profile?.nama || user.displayName || 'Perusahaan';
  console.log("Company loaded:", companyName, "ID:", companyId);
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

  // Ambil data dari form
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

  console.log("Data sebelum dikirim:", {
    title, 
    description: jobData.description, 
    requirements: jobData.requirements, 
    skills: jobData.skills, 
    benefits: jobData.benefits
  });

  // Hapus field yang nilainya kosong/null/undefined
  Object.keys(jobData).forEach(key => {
    if (jobData[key] === undefined || jobData[key] === null || jobData[key] === '') {
      delete jobData[key];
    }
  });

  try {
    const result = await saveJob(jobData, companyId);
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

// Cek mode edit (jika ada parameter id)
const params = new URLSearchParams(window.location.search);
if (params.get('id')) {
  document.getElementById('formTitle').textContent = 'Edit Lowongan';
  // TODO: load existing job data from Firebase
}

renderChips();
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.saveForm = saveForm;