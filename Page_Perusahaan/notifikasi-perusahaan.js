document.addEventListener('DOMContentLoaded', () => {
  const chips = document.querySelectorAll('.filter-chips .chip');
  const notifItems = document.querySelectorAll('.notif-item');
  const markAllReadBtn = document.getElementById('markAllReadBtn');

  // --- LOGIKA FILTER KATEGORI ---
  chips.forEach(chip => {
    chip.addEventListener('click', function() {
      // 1. Ubah status active class pada tombol chip
      chips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');

      // 2. Ambil kategori filter dari atribut data-filter
      const filterValue = this.getAttribute('data-filter');

      // 3. Saring item list notifikasi
      notifItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');

        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'flex'; // Tampilkan jika cocok atau pilih semua
        } else {
          item.style.display = 'none'; // Sembunyikan jika tidak cocok
        }
      });
    });
  });

  // --- BONUS: TOMBOL TANDAI SEMUA DIBACA ---
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      const unreadItems = document.querySelectorAll('.notif-item.unread');
      unreadItems.forEach(item => {
        item.classList.remove('unread');
        const blueDot = item.querySelector('.notif-dot-blue');
        if (blueDot) {
          blueDot.remove();
        }
      });
    });
  }
});