// 1. Import fungsi Firebase
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
// 2. Import koneksi database dari app.js
import { db } from "./app.js"; 

document.addEventListener('DOMContentLoaded', () => {
  const btnSimpan = document.getElementById('btnSimpanLowongan');
  
  btnSimpan.addEventListener('click', async () => {
    // 3. Tangkap nilai dari form HTML
    const title = document.getElementById('inputTitle').value;
    const location = document.getElementById('inputLocation').value;
    const salary = document.getElementById('inputSalary').value;
    const category = document.getElementById('inputCategory').value;
    const description = document.getElementById('inputDescription').value;

    // (Opsional) Ambil nama perusahaan dari session login jika sudah ada
    // const userSession = JSON.parse(localStorage.getItem('magnet_session'));
    const companyName = "PT Tech Inovasi"; // Sementara hardcode untuk tes
    const companyShort = "TI";

    // 4. Validasi sederhana
    if (!title || !description) {
      alert("Judul dan Deskripsi wajib diisi!");
      return;
    }

    try {
      // 5. Tentukan lokasi folder di Firebase ("jobs")
      const jobsRef = ref(db, 'jobs');
      
      // 6. Buat "kamar" kosong dengan ID unik baru
      const lowonganBaruRef = push(jobsRef);

      // 7. Simpan data ke dalam ID unik tersebut
      // Format KEY harus sama persis dengan yang ada di jobs.json mahasiswa!
      await set(lowonganBaruRef, {
        title: title,
        company: companyName,
        companyShort: companyShort,
        location: location,
        salary: salary,
        category: category,
        description: description,
        isNew: true, // Otomatis masuk tab "Baru untukmu"
        postedAt: "Baru saja",
        // Kamu bisa tambahkan array requirements, skills, dll nanti
      });

      alert("Berhasil! Lowongan sudah tayang di aplikasi mahasiswa.");
      
      // Kosongkan form setelah sukses
      document.getElementById('inputTitle').value = '';
      document.getElementById('inputDescription').value = '';

    } catch (error) {
      console.error("Gagal menyimpan lowongan: ", error);
      alert("Terjadi kesalahan sistem.");
    }
  });
});