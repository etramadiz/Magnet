/* ═══════════════════════════════════════════════════════════
   MAGNET – JOBS-DATA.JS
   Data lowongan lengkap, dipakai di semua halaman
════════════════════════════════════════════════════════════ */
const MAGNET_JOBS = [
  {
    id: 1,
    title: 'Jr Quality Assurance (Automation)',
    company: 'PT Adi Data Informatika', companyId: 'adi-data',
    companyShort: 'AD',
    logoColor: '#E53935',
    department: 'Engineering & QA',
    type: 'Full time',
    tipeKey: 'fulltime',
    remoteKey: 'onsite',
    location: 'Jakarta Selatan, DKI Jakarta',
    salaryMin: 5, salaryMax: 6.5,
    salary: 'Rp 5.000.000 – Rp 6.500.000 / bulan',
    durasi: '3-6',
    durasiLabel: '3 – 6 Bulan',
    deadline: '30 Juni 2026',
    quota: 3,
    postedAt: '1 hari lalu',
    isNew: true,
    category: 'it',
    tags: ['BUMN', 'Career development', 'Competitive salary'],
    description: `PT Adi Data Informatika membuka kesempatan bagi mahasiswa/fresh graduate yang ingin bergabung sebagai Jr Quality Assurance (Automation). Kamu akan bekerja bersama tim Engineering untuk memastikan kualitas produk digital kami sesuai standar.

Sebagai bagian dari tim QA, kamu akan:
• Merancang dan mengeksekusi test case untuk fitur baru
• Melakukan pengujian otomatis menggunakan tools seperti Selenium atau Appium
• Berkolaborasi dengan developer untuk menemukan dan melaporkan bug
• Mendokumentasikan hasil pengujian secara sistematis`,
    requirements: [
      'Mahasiswa aktif minimal semester 5 atau fresh graduate jurusan Teknik Informatika / Ilmu Komputer',
      'IPK minimal 3,00 dari skala 4,00',
      'Memiliki pemahaman dasar tentang Software Development Life Cycle (SDLC)',
      'Familiar dengan konsep testing (unit test, integration test, regression test)',
      'Mampu bekerja dalam tim dan memiliki komunikasi yang baik',
      'Diutamakan yang pernah mengikuti magang sebelumnya di bidang IT',
    ],
    skills: ['Manual Testing', 'Selenium', 'JIRA', 'SQL', 'Python (nilai plus)'],
    benefits: ['Uang saku kompetitif', 'Penempatan di BUMN', 'Career development & training', 'Sertifikat magang resmi'],
  },
  {
    id: 2,
    title: 'QA or Tester (Onsite Yogyakarta)',
    company: 'PT. Amalura Multisarana', companyId: 'amalura',
    companyShort: 'AM',
    logoColor: '#1565C0',
    department: 'Quality Assurance',
    type: 'Full time',
    tipeKey: 'fulltime',
    remoteKey: 'onsite',
    location: 'Yogyakarta, DI Yogyakarta',
    salaryMin: 4, salaryMax: 5.5,
    salary: 'Rp 4.000.000 – Rp 5.500.000 / bulan',
    durasi: '3-6',
    durasiLabel: '3 – 6 Bulan',
    deadline: '15 Juni 2026',
    quota: 2,
    postedAt: '2 hari lalu',
    isNew: true,
    category: 'it',
    tags: ['Training provided', 'Onsite', 'Mentoring'],
    description: `PT. Amalura Multisarana adalah perusahaan teknologi yang bergerak di bidang solusi enterprise. Kami membuka posisi QA/Tester untuk mendukung tim development kami di Yogyakarta.

Tanggung jawab utama:
• Melakukan functional testing pada aplikasi web dan mobile
• Membuat laporan bug yang detail dan terstruktur
• Bekerja sama dengan developer untuk proses debugging
• Mengikuti daily standup dan sprint review`,
    requirements: [
      'Mahasiswa aktif semester 5–8 atau fresh graduate',
      'Domisili atau bersedia ditempatkan di Yogyakarta',
      'Memiliki kemampuan analisis yang baik',
      'Teliti, detail-oriented, dan terorganisir',
    ],
    skills: ['Manual Testing', 'Bug Reporting', 'Postman', 'MySQL'],
    benefits: ['Training & mentoring intensif', 'Onsite di kantor Yogyakarta', 'Sertifikat resmi', 'Uang transport'],
  },
  {
    id: 3,
    title: 'UI/UX Designer Intern',
    company: 'Tokopedia', companyId: 'tokopedia',
    companyShort: 'TK',
    logoColor: '#4CAF50',
    department: 'Product Design',
    type: 'Magang',
    tipeKey: 'magang',
    remoteKey: 'hybrid',
    location: 'Jakarta Pusat, DKI Jakarta',
    salaryMin: 2.5, salaryMax: 3.5,
    salary: 'Rp 2.500.000 – Rp 3.500.000 / bulan',
    durasi: '3-6',
    durasiLabel: '3 – 6 Bulan',
    deadline: '20 Juni 2026',
    quota: 5,
    postedAt: '3 hari lalu',
    isNew: false,
    category: 'desain',
    tags: ['Figma', 'Design System', 'Hybrid'],
    description: `Bergabunglah dengan tim Product Design Tokopedia dan jadilah bagian dari proses perancangan pengalaman jutaan pengguna. Kamu akan bekerja langsung dengan senior designer dan product manager.

Kamu akan mengerjakan:
• Merancang wireframe dan prototype untuk fitur baru
• Melakukan user research dan usability testing
• Berkolaborasi dalam pengembangan dan pemeliharaan design system
• Menghasilkan design yang sesuai dengan brand guidelines Tokopedia`,
    requirements: [
      'Mahasiswa aktif jurusan Desain Komunikasi Visual, Desain Produk, atau jurusan relevan',
      'Memiliki portfolio desain UI/UX (wajib dilampirkan)',
      'Menguasai Figma untuk desain dan prototyping',
      'Memiliki pemahaman dasar tentang user-centered design',
      'Mampu bekerja secara hybrid (WFO & WFH)',
    ],
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design System'],
    benefits: ['Uang saku menarik', 'Hybrid working (WFO & WFH)', 'Mentoring dari senior designer', 'Akses ke internal tools Tokopedia', 'Potensi PPT (Pre-Placement Talk)'],
  },
  {
    id: 4,
    title: 'Business Analyst Intern',
    company: 'Gojek', companyId: 'gojek',
    companyShort: 'GJ',
    logoColor: '#00BCD4',
    department: 'Strategy & Operations',
    type: 'Magang',
    tipeKey: 'magang',
    remoteKey: 'remote',
    location: 'Jakarta Selatan (Remote)',
    salaryMin: 2, salaryMax: 3,
    salary: 'Rp 2.000.000 – Rp 3.000.000 / bulan',
    durasi: '1-3',
    durasiLabel: '1 – 3 Bulan',
    deadline: '10 Juni 2026',
    quota: 4,
    postedAt: '4 hari lalu',
    isNew: false,
    category: 'bisnis',
    tags: ['Excel', 'PowerBI', 'Remote'],
    description: `Gojek membuka kesempatan magang sebagai Business Analyst untuk mendukung tim Strategy & Operations. Kamu akan belajar menganalisis data bisnis dan memberikan insight yang berdampak.

Tanggung jawab:
• Menganalisis data operasional untuk mengidentifikasi peluang perbaikan
• Membuat laporan dan dashboard menggunakan Excel / PowerBI
• Mendukung proses perencanaan dan evaluasi program bisnis
• Berpartisipasi dalam rapat lintas tim`,
    requirements: [
      'Mahasiswa semester 5–8 jurusan Bisnis, Ekonomi, Manajemen, atau Teknik Industri',
      'Familiar dengan Microsoft Excel (pivot, VLOOKUP, wajib)',
      'Kemampuan komunikasi yang baik secara tertulis dan lisan',
      'Proaktif, cepat belajar, dan dapat bekerja secara remote',
    ],
    skills: ['Microsoft Excel', 'PowerBI / Tableau', 'SQL (plus)', 'Data Visualization', 'Presentasi'],
    benefits: ['Full remote working', 'Flexible hours', 'Mentoring langsung dari tim Gojek', 'Networking opportunity'],
  },
  {
    id: 5,
    title: 'Frontend Developer (React)',
    company: 'Bukalapak', companyId: 'bukalapak',
    companyShort: 'BL',
    logoColor: '#FF5722',
    department: 'Engineering — Frontend',
    type: 'Magang / Part-time',
    tipeKey: 'parttime',
    remoteKey: 'remote',
    location: 'Bandung, Jawa Barat (Remote)',
    salaryMin: 3, salaryMax: 4.5,
    salary: 'Rp 3.000.000 – Rp 4.500.000 / bulan',
    durasi: '3-6',
    durasiLabel: '3 – 6 Bulan',
    deadline: '5 Juli 2026',
    quota: 3,
    postedAt: '5 hari lalu',
    isNew: false,
    category: 'it',
    tags: ['React', 'TypeScript', 'Remote OK'],
    description: `Bukalapak membuka posisi Frontend Developer untuk mahasiswa/fresh graduate yang ingin berkontribusi pada platform e-commerce terbesar di Indonesia.

Yang akan kamu kerjakan:
• Membangun dan memelihara komponen UI menggunakan React + TypeScript
• Berkolaborasi dengan designer untuk implementasi fitur baru
• Melakukan code review bersama senior engineer
• Menulis unit test untuk komponen yang dibuat`,
    requirements: [
      'Mahasiswa aktif atau fresh graduate jurusan Teknik Informatika / Ilmu Komputer',
      'Menguasai React.js (wajib)',
      'Familiar dengan TypeScript, HTML, CSS',
      'Memahami Git workflow',
      'Mampu bekerja secara remote dan mandiri',
    ],
    skills: ['React.js', 'TypeScript', 'HTML/CSS', 'Git', 'REST API'],
    benefits: ['Remote working', 'Flexible schedule', 'Mentoring dari senior engineer', 'Kemungkinan konversi ke full-time'],
  },
  {
    id: 6,
    title: 'Data Analyst Intern',
    company: 'Shopee Indonesia', companyId: 'shopee',
    companyShort: 'SP',
    logoColor: '#FF6B00',
    department: 'Data & Analytics',
    type: 'Magang',
    tipeKey: 'magang',
    remoteKey: 'hybrid',
    location: 'Jakarta Barat, DKI Jakarta',
    salaryMin: 3.5, salaryMax: 5,
    salary: 'Rp 3.500.000 – Rp 5.000.000 / bulan',
    durasi: '6+',
    durasiLabel: '6 Bulan',
    deadline: '25 Juni 2026',
    quota: 6,
    postedAt: '1 minggu lalu',
    isNew: false,
    category: 'riset',
    tags: ['SQL', 'Python', 'Hybrid'],
    description: `Shopee Indonesia membuka posisi Data Analyst Intern untuk mendukung tim Data & Analytics dalam menghasilkan insight bisnis yang berdampak.

Kamu akan:
• Melakukan analisis data dari berbagai sumber menggunakan SQL dan Python
• Membantu membangun dashboard dan laporan analitik
• Berkolaborasi dengan tim produk, marketing, dan operasi
• Mengidentifikasi tren dan pola dari data yang ada`,
    requirements: [
      'Mahasiswa semester 6 ke atas atau fresh graduate jurusan Statistika, Matematika, Informatika, atau bidang relevan',
      'Menguasai SQL (wajib)',
      'Familiar dengan Python untuk analisis data (pandas, numpy)',
      'Kemampuan visualisasi data yang baik',
    ],
    skills: ['SQL', 'Python (Pandas)', 'Tableau / Looker', 'Excel', 'Statistik Dasar'],
    benefits: ['Uang saku kompetitif', 'Hybrid working', 'Akses data skala besar', 'Sertifikat & surat rekomendasi'],
  },
  {
    id: 7,
    title: 'Digital Marketing Intern',
    company: 'Blibli', companyId: 'blibli',
    companyShort: 'BB',
    logoColor: '#1976D2',
    department: 'Marketing & Growth',
    type: 'Magang',
    tipeKey: 'magang',
    remoteKey: 'onsite',
    location: 'Jakarta Pusat, DKI Jakarta',
    salaryMin: 2, salaryMax: 3,
    salary: 'Rp 2.000.000 – Rp 3.000.000 / bulan',
    durasi: '3-6',
    durasiLabel: '3 – 6 Bulan',
    deadline: '18 Juni 2026',
    quota: 4,
    postedAt: '1 minggu lalu',
    isNew: false,
    category: 'marketing',
    tags: ['Social Media', 'Google Ads', 'Onsite'],
    description: `Blibli mencari mahasiswa yang antusias dan kreatif untuk bergabung sebagai Digital Marketing Intern di tim Marketing & Growth.

Tugas dan tanggung jawab:
• Membantu pengelolaan konten media sosial (Instagram, TikTok, Twitter)
• Menganalisis performa kampanye digital (Google Ads, Meta Ads)
• Mendukung pembuatan materi marketing dan copywriting
• Melakukan riset kompetitor dan tren pasar`,
    requirements: [
      'Mahasiswa aktif jurusan Marketing, Komunikasi, atau Bisnis',
      'Memiliki ketertarikan pada dunia digital marketing',
      'Familiar dengan platform media sosial (Instagram, TikTok, dsb)',
      'Kreatif dan memiliki kemampuan menulis yang baik',
      'Bersedia bekerja onsite di Jakarta',
    ],
    skills: ['Social Media Management', 'Google Analytics', 'Canva', 'Copywriting', 'Meta Ads (plus)'],
    benefits: ['Uang saku + uang transport', 'Onsite di kantor Blibli Jakarta', 'Training digital marketing', 'Networking event'],
  },
];