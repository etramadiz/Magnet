// tambah-lowongan.js

const skills = ['Figma'];

function renderChips() {
  const container = document.getElementById('skillChips');
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

// Allow pressing Enter to add skill
document.getElementById('skillInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
});

function saveForm(mode) {
  const nama = document.getElementById('namaLowongan').value.trim();
  if (!nama) { alert('Nama lowongan harus diisi.'); return; }

  const msg = mode === 'publish'
    ? `Lowongan "${nama}" berhasil dipublikasikan!`
    : `Lowongan "${nama}" disimpan sebagai draft.`;
  alert(msg);
  window.location.href = 'dashboard.html';
}

// Check if editing (URL param ?id=...)
const params = new URLSearchParams(window.location.search);
if (params.get('id')) {
  document.getElementById('formTitle').textContent = 'Edit Lowongan';
}

renderChips();
