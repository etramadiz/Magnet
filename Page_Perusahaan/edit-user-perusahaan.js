// edit-user-perusahaan.js

function previewLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('logoPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Logo" />`;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const nama = document.getElementById('editNama').value.trim();
  if (!nama) { alert('Nama perusahaan harus diisi.'); return; }

  // Success feedback
  const btn = document.querySelector('.form-actions .btn-primary');
  const orig = btn.innerHTML;
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:15px;height:15px"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg> Tersimpan!';
  btn.style.background = '#2E7D32';
  btn.style.borderColor = '#2E7D32';

  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.style.borderColor = '';
    window.location.href = 'user-perusahaan.html';
  }, 1200);
}
