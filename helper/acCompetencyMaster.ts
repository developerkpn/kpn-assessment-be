import {
  ACCompetencyCode,
  ACCompetencyEvaluated,
  ACCompetencyInput,
  ACCompetencyMasterItem,
  ACRecommendationType,
} from "@/types/ACReportTypes.js";

export const AC_TARGET_GRADES = [
  "3A",
  "3B",
  "4A",
  "4B",
  "5A",
  "5B",
  "6A",
  "6B",
  "7A",
  "7B",
  "8A",
  "8B",
  "9A",
  "9B",
] as const;

export const AC_COMPETENCY_MASTER: ACCompetencyMasterItem[] = [
  {
    code: "S",
    no: 1,
    cluster: "SIGAP",
    groupTitle: "A. KOMPETENSI CULTURE",
    name: "Synergized Team",
    definition:
      "Dorongan atau kemampuan untuk bekerja sama, bersikap pengertian dan penerimaan terhadap orang lain serta peka terhadap kontribusi orang lain untuk mengumpulkan informasi lebih banyak sehubungan dengan pelaksanaan pekerjaan dan pengambilan keputusan guna mencapai komitmen bersama.",
    keyBehaviors: {
      1: "1) Mampu berpartisipasi aktif dalam kelompok, seperti mengutarakan opini dan pandangan\n2) Mampu mendengarkan opini anggota kelompoknya dengan positif\n3) Mencari informasi terkait pekerjaan yang berguna bagi kelompok",
      2: "1) Secara konsisten mampu mengajak orang lain untuk saling menghargai dan bekerja sama dalam mencapai tujuan bersama\n2) Mampu membagikan informasi yang relevan sehubungan pekerjaan dalam tim\n3) Mampu menunjukkan kepekaan terhadap kebutuhan kerja anggota kelompoknya",
      3: "1) Mampu membantu, mendorong dan membimbing rekan kerja dan orang lain untuk bekerja sama\n2) Mampu menerapkan komunikasi dua arah dalam bekerja\n3) Mampu memberikan motivasi dan mempertahankan semangat timnya",
      4: "1) Mampu menjadi role model dalam membangun dan menerapkan budaya transfer pengetahuan dalam departemen atau divisi yang dipimpin\n2) Mampu menyusun strategi komunikasi, termasuk bahasa non verbal, sehingga mendukung implementasi dan pencapaian strategi kerja bersama\n3) Mampu memberikan apresiasi seperti reward, recognition atas kualitas kerja timnya",
    },
    defaultTraining: "Collaborative Leadership & Team Synergy Workshop",
    coachingOptions: [
      "Diskusi berkala dengan atasan terkait teknik membangun komunikasi dua arah dan fasilitasi aspirasi anggota tim.",
      "Review cara memotivasi anggota tim lintas fungsi agar tetap selaras pada komitmen bersama.",
    ],
    ojtOptions: [
      "Memimpin proyek kolaborasi lintas unit dan memfasilitasi sesi diskusi mingguan bersama anggota tim.",
      "Menjadi fasilitator dalam rapat koordinasi seksi untuk menyatukan perbedaan pandangan operasional.",
    ],
  },
  {
    code: "I",
    no: 2,
    cluster: "SIGAP",
    groupTitle: "A. KOMPETENSI CULTURE",
    name: "Integrity for All Action",
    definition: "Taat dan loyal kepada hukum dan nilai perusahaan, dapat dipercaya dan diandalkan",
    keyBehaviors: {
      1: "1) Mampu memahami peraturan dan kode etik sebagai tanggung jawab pribadi\n2) Mampu mempertahankan komitmen dan disiplin terhadap peraturan dan norma Perusahaan\n3) Mampu menempatkan kepentingan Perusahaan di atas kepentingan pribadi",
      2: "1) Mampu mengajak orang lain agar bertindak selaras dengan nilai-nilai dan prinsip-prinsip etika perusahaan dalam segala situasi dan kondisi\n2) Mampu menerapkan norma-norma secara konsisten dan melakukan pemantauan atas penerapan sikap integritas dalam ruang lingkup kerjanya.\n3) Mampu mengingatkan rekan kerja ketika terdapat tindakan yang berpeluang menyalahi norma, kode etik atau nilai-nilai perusahaan",
      3: "1) Mampu mengedukasi orang lain agar bertindak selaras dengan nilai-nilai dan prinsip-prinsip etika perusahaan dalam segala situasi dan kondisi\n2) Mampu menegur pihak lain yang melanggar norma-norma secara konsisten dan melakukan pemantauan atas penerapan sikap integritas dalam ruang lingkup kerjanya.\n3) Mampu melakukan koreksi atau mengambil tindakan tegas atas penyimpangan kode etik ataupun nilai-nilai yang dilakukan oleh orang lain dalam tataran unit/section",
      4: "1) Mampu memberikan apresiasi atau mengambil tindakan koreksi kepada individu atau tim atas perilaku-perilaku yang berkaitan dengan nilai-nilai dan prinsip-prinsip etika perusahaan dalam tataran departemen/divisi\n2) Mampu menjadi role model dalam menciptakan sistem dan mekanisme kontrol pelaksanaan peraturan dan norma Perusahaan\n3) Mampu secara sistematis dan strategis menciptakan budaya kerja yang mencerminkan dan mengimplementasikan nilai-nilai integritas dan etika di perusahaan",
    },
    defaultTraining: "Conflict Management for Leaders",
    coachingOptions: [
      "Asertif dalam mengedukasi atau melakukan teguran pada pihak-pihak yang melakukan pelanggaran serta menyusun langkah antisipasi agar tidak terjadi pelanggaran berulang.",
      "Pendampingan penyusunan mekanisme monitoring kepatuhan SOP dan kode etik di lingkup unit kerja.",
    ],
    ojtOptions: [
      "Melakukan job shadowing untuk memahami bagaimana atasan bersikap tegas terhadap personel yang melanggar aturan kerja.",
      "Menyusun checklist audit kepatuhan rutin di tim serta menindaklanjuti temuan pelanggaran secara konsisten.",
    ],
  },
  {
    code: "G",
    no: 3,
    cluster: "SIGAP",
    groupTitle: "A. KOMPETENSI CULTURE",
    name: "Growth for Co-Prosperity",
    definition:
      "Dorongan dalam diri untuk menjaga harmonisasi dalam upaya mencapai keberhasilan bersama yang berkelanjutan",
    keyBehaviors: {
      1: "1) Mampu berperan aktif dalam menjaga harmonisasi tim dengan cara menghormati dan menghargai perbedaan pendapat antar rekan kerja serta berusaha memahami sudut pandang orang lain.\n2) Mampu melaksanakan pekerjaan yang ada dengan cara-cara yang sesuai dengan prinsip \"menang bersama\".\n3) Memperlihatkan perilaku kerja yang berorientasi pada keberlangsungan jangka pendek perusahaan.",
      2: "1) Mendorong tim untuk terlibat dalam menciptakan dan memelihara iklim kerja yang harmonis\n2) Memperlihatkan perilaku kerja yang berorientasi pada keberlangsungan jangka panjang perusahaan\n3) Mampu menurunkan rencana perusahaan ke dalam program kerja operasional bagi diri dan tim",
      3: "1) Mampu menjembatani perbedaan pendapat serta mengelola konflik-konflik yang terjadi dalam tim sehingga harmoni tim tetap terjaga.\n2) Mampu mengarahkan dan memastikan tim yang dipimpin senantiasa fokus pada keberhasilan dan kesejahteraan bersama\n3) Mampu mengarahkan dan memastikan tim yang dipimpin memperlihatkan perilaku kerja yang berorientasi pada keberlangsungan jangka panjang bisnis perusahaan.",
      4: "1) Mampu menjadi teladan dan role model dalam hal menjaga harmoni serta dorongan untuk bertumbuh dan sejahtera bersama baik dalam tim yang dipimpin maupun lintas department atau divisi.\n2) Mampu membangun budaya kerja dalam tim yang dipimpin yang mengutamakan keberhasilan dan kesejahteraan bersama bagi seluruh perusahaan beserta para stakeholder-nya serta secara konsisten fokus pada keberlangsungan jangka panjang bisnis perusahaan.\n3) Mampu menginterpretasikan target dan rencana bisnis perusahaan menjadi target dan rencana kerja jangka menengah-panjang yang berorientasi pada keberlangsungan jangka panjang bisnis perusahaan.",
    },
    defaultTraining: "Leading through Conflict",
    coachingOptions: [
      "Arahan mengenai pentingnya menciptakan suasana kerja yang harmonis guna mendukung pencapaian sasaran jangka panjang perusahaan.",
      "Sesi refleksi studi kasus mediasi konflik internal tim bersama atasan langsung.",
    ],
    ojtOptions: [
      "Mengadakan forum diskusi dengan subordinat untuk membahas mengenai performance dan dinamika tugas yang muncul selama ini. Minta ia menilai dirinya sendiri terkait performa dan selaraskan dengan target jangka panjang organisasi.",
      "Menjadi mediator penyelesaian kendala koordinasi antar sub-tim di bagiannya guna menjaga harmoni kerja.",
    ],
  },
  {
    code: "A",
    no: 4,
    cluster: "SIGAP",
    groupTitle: "A. KOMPETENSI CULTURE",
    name: "Adaptive to Change",
    definition:
      "Mengantisipasi dan mengelola perubahan serta memiliki fleksibiltas tinggi untuk menghadapi perubahan melalui inovasi-inovasi terbaru yang dapat menjadi solusi praktis",
    keyBehaviors: {
      1: "1) Mampu mengikuti perubahan berdasarkan bimbingan atau arahan dari atasan\n2) Mampu menyesuaikan diri dalam menghadapi perubahan di tempat kerja\n3) Mampu menyesuaikan cara kerja dengan menerapkan metode/proses yang selaras dengan ketentuan yang berlaku tanpa adanya arahan dari orang lain.",
      2: "1) Mampu mengembangkan kemampuan diri dalam menghadapi perubahan\n2) Secara proaktif mampu membantu orang lain dalam melakukan perubahan\n3) Mampu menyesuaikan prioritas kerja sesuai situasi di lapangan",
      3: "1) Mampu menghadapi perubahan jangka pendek - menengah (1-2 tahun) dengan cara melakukan inovasi praktis, melihat peluang dan cara baru dalam melaksanakan pekerjaannya\n2) Mampu memberikan arahan dan bimbingan untuk menghadapi perubahan yang terjadi serta mensosialisasikan arahan terkait perubahan yang dibutuhkan orang lain dan rekan kerja\n3) Mampu menyelaraskan sumber daya yang ada sehubungan dengan inovasi atau perubahan yang terjadi",
      4: "1) Mampu mengantisipasi perubahan-perubahan yang perlu dilakukan dalam rangka mengimplementasikan strategi manajemen perusahaan jangka menengah-panjang\n2) Mampu menyusun sistematika perubahan yang akan dihadapi oleh departemen atau divisi dan mempertimbangkan efektivitas inovasi.\n3) Mampu mengantisipasi kebutuhan sumber daya yang akan diperlukan dalam rangka menyesuaikan dengan perubahan yang dihadapi (alokasi dana serta atau strategi yang akan dilakukan)",
    },
    defaultTraining: "Leading Change & Practical Workplace Innovation",
    coachingOptions: [
      "Bimbingan cara mengidentifikasi peluang perbaikan proses kerja saat terjadi perubahan kebijakan organisasi.",
      "Diskusi strategi komunikasi perubahan agar anggota tim cepat beradaptasi pada alur baru.",
    ],
    ojtOptions: [
      "Menginisiasi proyek perbaikan alur kerja (process improvement) di unit kerjanya beserta evaluasi dampaknya.",
      "Memimpin transisi implementasi prosedur kerja baru di lingkup seksi/departemen.",
    ],
  },
  {
    code: "P",
    no: 5,
    cluster: "SIGAP",
    groupTitle: "A. KOMPETENSI CULTURE",
    name: "Passion for Excellence",
    definition:
      'Memiliki semangat tinggi untuk mengejar keunggulan dalam mengerjakan segala hal dengan mencari cara terbaik untuk meningkatkan kualitas kerja, hasil kerja yang dihasilkan adalah yang tidak "sekedar cukup"',
    keyBehaviors: {
      1: "1) Mampu mengintrospeksi diri dalam upaya mengidentifikasi kelebihan dan kekurangan dirinya serta melakukan usaha yang efektif untuk mengembangkan diri.\n2) Mampu memeriksa hasil kerja secara mandiri.\n3) Secara konsisten memberikan usaha yang terbaik dalam melaksanakan seluruh tugas yang diberikan.",
      2: "1) Secara proaktif mampu meminta umpan balik dari orang lain terkait hasil kerja dan kekurangan dirinya dalam rangka mengembangkan diri di masa yang akan datang.\n2) Mampu mengelola dan menginternalisasikan umpan balik dari orang lain serta belajar dari kesalahan diri sendiri maupun orang lain dalam rangka meningkatkan hasil kerja atau pengembangan diri\n3) Mampu mempengaruhi rekan-rekan kerja-nya untuk memberikan usaha terbaik ketika menyelesaikan tugas-tugas yang ada.",
      3: "1) Secara konsisten mampu mendorong dan mengarahkan anggota tim yang dipimpin untuk memberikan usaha terbaik dan mencapai hasil kerja yang unggul dan melebihi ekspektasi.\n2) Mampu mendorong anggota tim untuk selalu mencari dan menemukan cara-cara baru dan terbaik dalam melakukan pekerjaan-nya masing-masing.\n3) Mampu memberikan umpan balik yang konstruktif dan berkualitas bagi rekan kerja atau tim yang dipimpin dalam rangka menemukan cara terbaik untuk meningkatkan kualitas kerja dan mencapai hasil kerja yang melebihi ekspektasi",
      4: "1) Mampu menjadi teladan dan role model dalam hal menentukan dan mengejar standar tinggi dan keunggulan dalam melaksanakan tugas-tugas serta melewati batasan-batasan yang ada saat ini.\n2) Secara konsisten mampu mendorong dan mengarahkan anggota tim untuk memberikan usaha dan hasil kerja yang melebihi ekspektasi.\n3) Mampu menciptakan budaya kerja dalam tim yg dipimpin yang selalu memberikan usaha terbaik, secara konsisten berusaha mencari cara terbaik untuk meningkatkan kualitas kerja serta mengutamakan hasil kerja yang melebihi ekspektasi.",
    },
    defaultTraining: "Motivating High Performance Team",
    coachingOptions: [
      "Memberikan bimbingan atau arahan untuk mendorong peningkatan kinerja anggota tim dalam memenuhi berbagai tuntutan pekerjaan untuk peningkatan kinerja tim yang lebih signifikan.",
      "Coaching teknik pemberian constructive feedback berbasis indikator kualitas kerja.",
    ],
    ojtOptions: [
      "Memberikan bimbingan atau arahan untuk mendorong peningkatan kinerja anggota tim dalam memenuhi berbagai tuntutan pekerjaan.",
      "Menetapkan stretch target bulanan pada proyek prioritas unit serta melakukan review kualitas berkala.",
    ],
  },
  {
    code: "MP",
    no: 6,
    cluster: "LEADERSHIP",
    groupTitle: "B. KOMPETENSI LEADERSHIP",
    name: "Manage & Planning",
    definition:
      "Secara efektif merencanakan dan mengorganisir pekerjaan sesuai kebutuhan organisasi dengan menetapkan tujuan dan mengantisipasi kebutuhan dan prioritas.",
    keyBehaviors: {
      1: "1) Mampu mengidentifikasi skala prioritas tugas berdasarkan kepentingan dan tenggat waktu\n2) Mampu menggunakan waktu dengan efektif dan menghindari hal-hal yang tidak berkaitan dengan penyelesaian tugas\n3) Mampu melakukan perencanaan dan pengelolaan tugas untuk diri sendiri",
      2: "1) Mampu menyusun rencana kerja dan target kerja harian untuk tim berdasarkan skala prioritas.\n2) Mampu menentukan dan mengelola sumber daya yang diperlukan untuk mengimplementasikan rencana kerja tersebut.\n3) Memastikan tim bekerja sesuai dengan rencana dan prioritas kerja yang telah disusun dan disepakati dengan hasil yang diharapkan.",
      3: "1) Mampu menyusun rencana kerja jangka pendek-menengah dengan target yang jelas, terukur dan obyektif untuk tim yang dipimpin serta mampu mengusulkan kebutuhan sumber daya yang diperlukan untuk mengimplementasikan rencana kerja tersebut.\n2) Menunjukkan kemampuan mengindentifikasi ekspektasi user internal/eksternal ke dalam kebutuhan sumber daya tim dan menyelaraskannya dalam rencana kerja dan prioritas yang disusun.\n3) Mengarahkan dan memastikan anggota tim bekerja sesuai dengan prioritas yang telah disusun serta mampu menyusun sistem dan mekanisme kontrol sehingga secara simultan mampu menyelesaikan pekerjaan-pekerjaan yang ada tepat waktu dengan hasil sesuai harapan.",
      4: "1) Mampu menyelaraskan rencana bisnis perusahaan menjadi rencana kerja dan target jangka menengah-panjang untuk tim yang dipimpin serta mampu menentukan & memutuskan sumber daya yang diperlukan untuk mengimplementasikan rencana kerja tersebut.\n2) Mampu menangani berbagai proyek yang kompleks dalam waktu yang bersamaan serta menyelesaikan proyek-proyek tersebut tepat waktu dengan hasil sesuai yang diharapkan dan disepakati dengan manajemen dengan cara menyusun sistem monitoring dan evaluasi yang efektif dan efisien.\n3) Mampu memprediksi dan mengidentifikasi berbagai hambatan dan tantangan yang mungkin terjadi di masa yang akan datang dalam rangka pelaksanaan rencana kerja yang telah disusun serta mampu menyesuaikan dan mengoptimalisasi sumber daya yang ada sehingga dapat meminimalisasi resiko bagi perusahaan.",
    },
    defaultTraining: "Operational Planning & Execution Control",
    coachingOptions: [
      "Review berkala bersama atasan dalam menyusun rencana kerja kuartalan yang terukur beserta mitigasi risikonya.",
      "Pendampingan pembuatan mekanisme kontrol progres KPI tim secara berkala.",
    ],
    ojtOptions: [
      "Menyusun workplan semester unit kerja lengkap dengan alokasi sumber daya dan mekanisme tracking mingguan.",
      "Mengelola proyek lintas seksi dari perencanaan timeline hingga evaluasi ketepatan waktu.",
    ],
  },
  {
    code: "DM",
    no: 7,
    cluster: "LEADERSHIP",
    groupTitle: "B. KOMPETENSI LEADERSHIP",
    name: "Decision Making",
    definition:
      "Mampu mendefinisikan setiap keputusan dari berbagai sudut pandang serta mengajak orang lain untuk turut serta mengambil keputusan secara efektif.",
    keyBehaviors: {
      1: "1) Mampu berpartisipasi aktif dalam mengumpulkan informasi dan data yang valid terkait penyelesaian suatu masalah.\n2) Melakukan analisa sederhana untuk mengambil suatu keputusan penyelesaian masalah operasional bagi dirinya sendiri\n3) Mampu berdiskusi secara sederhana dengan tim untuk memvalidasi sebuah keputusan bagi dirinya sendiri dengan memperhatikan sudut pandang pihak lain",
      2: "1) Mampu mengajak tim untuk berpartisipasi aktif dalam mengumpulkan informasi dan data yang valid terkait penyelesaian suatu masalah.\n2) Mampu melakukan analisa bersama dengan tim dalam rangka mengambil suatu keputusan terkait penyelesaian masalah operasional tim.\n3) Mampu menciptakan keterlibatan tim di dalam proses pengambilan dan pelaksanaan keputusan dalam tim.",
      3: "1) Mampu melihat dan menganalisa masalah dan isu jangka pendek-menengah dari berbagai sudut pandang dalam proses pengambilan keputusan di ruang lingkup kerjanya\n2) Mampu mengambil keputusan dengan dampak jangka pendek-menengah dengan menggunakan proyeksi untung rugi dan mempertimbangkan faktor efisiensi dalam proses pengambilan keputusan.\n3) Mampu menciptakan keterlibatan tim atau pihak-pihak terkait di dalam proses pengambilan dan pelaksanaan keputusan dalam section/department yg dipimpin.",
      4: "1) Mampu melihat dan menganalisa isu strategis jangka menengah-panjang dari berbagai sudut pandang\n2) Mampu mengambil keputusan dengan dampak jangka menengah-panjang bagi perusahaan berdasarkan hasil analisa yang mendalam dan menyeluruh.\n3) Mampu membangun budaya di mana setiap anggota tim mau berpartisipasi dan terlibat dalam proses pengambilan keputusan tertentu dalam department/divisi yang dipimpin.",
    },
    defaultTraining: "Analytical Thinking & Managerial Decision Making",
    coachingOptions: [
      "Diskusi analisis untung-rugi (cost-benefit) dan efisiensi sebelum menetapkan keputusan taktis di unit kerja.",
      "Coaching cara melibatkan pemangku kepentingan terkait dalam pengambilan keputusan bersama.",
    ],
    ojtOptions: [
      "Menyusun kertas kerja analisis opsi keputusan beserta proyeksi efisiensi untuk isu operasional unit.",
      "Memimpin rapat pemecahan masalah tim hingga menghasilkan keputusan bersama yang terukur.",
    ],
  },
  {
    code: "DO",
    no: 8,
    cluster: "LEADERSHIP",
    groupTitle: "B. KOMPETENSI LEADERSHIP",
    name: "Developing Others",
    definition:
      "Membuat perencanaan dan mendukung pengembangan kemampuan dan keterampilan individu sehingga mereka dapat memenuhi tanggung jawab pekerjaan/peran saat ini atau di masa datang dengan lebih efektif.",
    pdfDefinition:
      "Membuat perencanaan dan mendukung pengembangan kemampuan dan keterampilan individu sehingga mereka dapat memenuhi tanggung jawab pekerjaan/peran saat ini atau di masa datang dengan lebih efektif. Output : pengembangan diri bukan result kerja",
    keyBehaviors: {
      1: "1) Memiliki keterbukaan dan menunjukkan upaya untuk mengembangkan diri secara mandiri\n2) Mampu mengindentifikasi keterampilan kerja yang dibutuhkan serta melihat kelebihan dan kelemahan diri/orang lain dalam interaksi di sebuah tim dalam mencapai tujuan bersama\n3) Memiliki keinginan untuk berbagi pengetahuan/keterampilan kerja dalam upaya memberikan bantuan langkah-langkah praktis yang memudahkan pekerjaan",
      2: "1) Mampu mengidentifikasi kekuatan dan kelemahan anggota tim dalam rangka menyusun rencana pengembangan secara sederhana\n2) Mampu memberikan umpan balik terhadap pengembangan rekan/tim kerja/subordinat untuk pengembangan diri dalam lingkungan pekerjaan\n3) Mampu secara regular memotivasi dan memastikan anggota tim melaksanakan rencana pengembangan sederhana yang sudah disusun",
      3: "1) Mampu menyusun rencana pengembangan setiap anggota tim sesuai dengan rencana bisnis jangka pendek hingga menengah perusahaan\n2) Mampu menyusun rencana pengembangan berdasarkan kekuatan dan kelemahan anggota tim serta menentukan metode pengembangan yang sesuai (70:20:10)\n3) Mengimplementasikan dan memantau pelaksanaan rencana pengembangan tersebut sehingga dapat memaksimalkan potensi setiap anggota tim",
      4: "1) Mampu menyusun rencana pengembangan setiap anggota tim secara lintas fungsi untuk memastikan keberlangsungan operasional sesuai dengan rencana bisnis jangka menengah hingga panjang perusahaan\n2) Mampu memimpin dengan cara menunjukkan teladan dan dipandang sebagai seorang coach/mentor dan role model yang baik bagi anggota tim\n3) Secara konsisten memberikan umpan balik, bimbingan, arahan dan support yang berkualitas bagi anggota tim dan mampu menyusun rencana pengembangan bagi anggota tim-nya dengan mempertimbangkan kekuatan dan kelemahan tiap individu",
    },
    defaultTraining: "Strategic Team Development Planning",
    coachingOptions: [
      "Menambah referensi untuk mengasah kemampuan dalam menyusun rencana program pengembangan kreatif yang sesuai dengan kebutuhan pengembangan potensi dan kompetensi subordinat.",
      "Sesi evaluasi berkala bersama atasan mengenai efektivitas progres IDP anggota tim.",
    ],
    ojtOptions: [
      "Mengikuti workshop metode pengembangan SDM (70:20:10) dan mencoba menyusun rencana pengembangan subordinat disertai pemantauan pengembangan kemampuan subordinat.",
      "Melaksanakan sesi one-on-one coaching terjadwal setiap bulan kepada anggota tim langsung.",
    ],
  },
  {
    code: "RB",
    no: 9,
    cluster: "LEADERSHIP",
    groupTitle: "B. KOMPETENSI LEADERSHIP",
    name: "Relationship Building",
    definition:
      "Mampu membangun, memperluas, dan memelihara hubungan yang produktif dengan pihak-pihak internal ataupun eksternal di luar organisasi dalam upaya tujuan perusahaan.",
    keyBehaviors: {
      1: "1) Mampu mengenali stakeholder-stakeholder dalam organisasi yang mempengaruhi terhadap pencapaian kerja individu\n2) Mengindentifikasi dan mengevaluasi hubungan kerja yang telah terbangun dan memiliki nilai tambah bagi pencapaian kerja individu\n3) Mampu menempatkan diri dalam rangka membangun hubungan kerja formal maupun informal yang produktif berdasarkan rasa hormat antar individu.",
      2: "1) Proaktif dalam menginisiasi hubungan kerja yang profesional dengan stakeholder-stakeholder dalam organisasi yang berperan penting untuk mencapai tujuan kerja kelompok/tim/unit kerja\n2) Mampu menggunakan empati dalam upaya membangun hubungan kerja yang profesional dan memberikan nilai tambah bagi kedua belah pihak\n3) Mampu menggunakan hubungan kerja yang terbangun bagi diri sendiri dan tim dalam rangka pencapaian tujuan kerja individu anggota tim ataupun anggota tim secara keseluruhan",
      3: "1) Mampu menunjukkan dukungan atau menyempurnakan upaya tim dalam menjaga hubungan kerja yang profesional untuk mencapai tujuan kerja kelompok/tim/unit kerja\n2) Mampu menginisiasi dan memelihara hubungan kerja yang berkelanjutan dalam rangka membangun kepercayaan pihak internal dan/atau eksternal untuk mencapai tujuan perusahaan\n3) Mampu mengindentifikasi kebutuhan perusahaan serta kebutuhan stakeholder dalam ruang lingkup kerja/internal tim dan menerjemahkannya menjadi aksi-aksi nyata untuk membangun hubungan kerja yang mendukung pencapaian tujuan kedua belah pihak",
      4: "1) Mampu menggunakan dan mengoptimalkan hubungan kerja yang telah terbangun untuk mendorong pengambilan keputusan yang memenuhi kebutuhan dan kepentingan bisnis perusahaan\n2) Mampu membangun strategi dan sistem komunikasi yang berkelanjutan dengan pihak internal maupun eksternal bagi tim untuk kepentingan bisnis perusahaan\n3) Membangun & mengoptimalkan jejaring kontak yang dimiliki untuk mengumpulkan informasi, mengidentifikasi peluang strategis dan mencari masukan terhadap permasalahan strategis dengan tujuan untuk mengembangkan bisnis perusahaan/meningkatkan efisiensi dan efektivitas perusahaan/ mempertahankan keunggulan layanan atau untuk mengembangkan reputasi perusahaan.",
    },
    defaultTraining: "Managing Cross-Functional Stakeholder Relationships",
    coachingOptions: [
      "Mengidentifikasi peluang dan proaktif memperluas jaringan atau menciptakan kolaborasi yang memberi nilai tambah.",
      "Arahan strategi pemeliharaan relasi jangka panjang dengan mitra eksternal dan lintas fungsi.",
    ],
    ojtOptions: [
      "Penugasan untuk menciptakan dan menjaga suatu relasi dengan berbagai bagian perusahaan, memperkuat kolaborasi hubungan kerja yang berdampak peningkatan kerja kedua belah pihak.",
      "Menjadi PIC koordinasi hubungan strategis dengan stakeholder eksternal utama pada proyek departemen.",
    ],
  },
];

/**
 * Menghitung Required Proficiency Level (1–4) secara otomatis berdasarkan Golongan Tujuan
 * sesuai rumus resmi Excel Template Structural 2026 KPN Corp:
 * - Culture (SIGAP): Gol 2–3 -> 1, Gol 4 -> 2, Gol 5–7 -> 3, Gol 8–9 -> 4
 * - Leadership: Gol 2–3 -> 1, Gol 4–5 -> 2, Gol 6–7 -> 3, Gol 8–9 -> 4
 */
export const getRequiredLevelsByGrade = (targetGrade: string): Record<ACCompetencyCode, 1 | 2 | 3 | 4> => {
  const digit = parseInt(String(targetGrade || "6A").trim().charAt(0), 10);
  let sigapReq: 1 | 2 | 3 | 4 = 3;
  let leadReq: 1 | 2 | 3 | 4 = 3;

  if (digit <= 3) {
    sigapReq = 1;
    leadReq = 1;
  } else if (digit === 4) {
    sigapReq = 2;
    leadReq = 2;
  } else if (digit === 5) {
    sigapReq = 3;
    leadReq = 2;
  } else if (digit === 6 || digit === 7) {
    sigapReq = 3;
    leadReq = 3;
  } else if (digit >= 8) {
    sigapReq = 4;
    leadReq = 4;
  }

  return {
    S: sigapReq,
    I: sigapReq,
    G: sigapReq,
    A: sigapReq,
    P: sigapReq,
    MP: leadReq,
    DM: leadReq,
    DO: leadReq,
    RB: leadReq,
  };
};

export const evaluateACCompetencies = (
  targetGrade: string,
  inputs: ACCompetencyInput[] = []
): {
  competencies: ACCompetencyEvaluated[];
  passCount: number;
  sigapGapCount: number;
  leadershipGapCount: number;
  autoRecommendationType: ACRecommendationType;
  ruleInfo: string;
} => {
  const reqMap = getRequiredLevelsByGrade(targetGrade);
  const inputByCode = new Map<string, ACCompetencyInput>();
  for (const item of inputs) {
    inputByCode.set(item.competency_code, item);
  }

  let passCount = 0;
  let sigapGapCount = 0;
  let leadershipGapCount = 0;
  let hasScoreOne = false;
  let hasSevereGap = false;

  const competencies: ACCompetencyEvaluated[] = AC_COMPETENCY_MASTER.map((m) => {
    const reqLvl = reqMap[m.code];
    const found = inputByCode.get(m.code);
    const rawActual = Number(found?.actual_level ?? reqLvl);
    const actLvl = Math.min(4, Math.max(1, Math.round(Number.isFinite(rawActual) ? rawActual : reqLvl)));

    // Sesuai formula resmi template Excel KPN: IF(Aktual < Standar, Aktual - Standar, 0)
    const gap = actLvl < reqLvl ? actLvl - reqLvl : 0;
    const isPass = actLvl >= reqLvl;

    if (isPass) {
      passCount++;
    } else if (m.cluster === "SIGAP") {
      sigapGapCount++;
    } else {
      leadershipGapCount++;
    }

    if (actLvl === 1) hasScoreOne = true;
    if (actLvl - reqLvl <= -2) hasSevereGap = true;

    const training = isPass
      ? ""
      : (found?.training_recommendation?.trim() || m.defaultTraining);
    const coaching = isPass
      ? ""
      : (found?.coaching_plan?.trim() || m.coachingOptions[0]);
    const ojt = isPass
      ? ""
      : (found?.ojt_plan?.trim() || m.ojtOptions[0]);

    return {
      no: m.no,
      competency_code: m.code,
      competency_name: m.name,
      cluster: m.cluster,
      group_title: m.groupTitle,
      definition: m.definition,
      key_behavior: m.keyBehaviors[reqLvl],
      required_level: reqLvl,
      actual_level: actLvl,
      gap,
      is_pass: isPass,
      uraian_kompetensi: found?.uraian_kompetensi?.trim() ?? "",
      uraian_gap: isPass ? "-" : (found?.uraian_gap?.trim() || "-"),
      training_recommendation: training,
      coaching_plan: coaching,
      ojt_plan: ojt,
    };
  });

  let autoRecommendationType: ACRecommendationType = "Not Recommended";
  let ruleInfo = "";

  if (!hasScoreOne && !hasSevereGap && passCount >= 7) {
    autoRecommendationType = "Suitable";
    ruleInfo = `Otomatis: Memenuhi ${passCount}/9 kompetensi (maksimal 2 gap -1 & tanpa nilai 1).`;
  } else if (
    !hasScoreOne &&
    !hasSevereGap &&
    (passCount === 5 || passCount === 6) &&
    sigapGapCount <= 2 &&
    leadershipGapCount <= 2
  ) {
    autoRecommendationType = "Need Development";
    ruleInfo = `Otomatis: Memenuhi ${passCount}/9 kompetensi (gap SIGAP ${sigapGapCount}/2 & Leadership ${leadershipGapCount}/2, tanpa nilai 1).`;
  } else {
    autoRecommendationType = "Not Recommended";
    if (hasScoreOne || hasSevereGap) {
      ruleInfo = "Otomatis: Terdapat skor level 1 atau GAP <= -2.";
    } else if (sigapGapCount >= 3) {
      ruleInfo = `Otomatis: Terdapat ${sigapGapCount} gap pada kompetensi nilai SIGAP (maksimal 2).`;
    } else {
      ruleInfo = `Otomatis: Hanya memenuhi ${passCount}/9 standar kompetensi.`;
    }
  }

  return {
    competencies,
    passCount,
    sigapGapCount,
    leadershipGapCount,
    autoRecommendationType,
    ruleInfo,
  };
};
