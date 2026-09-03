import { DatabaseSchema, ARTIST_TYPES } from '../types';

export const DEFAULT_DATABASE_SCHEMA: DatabaseSchema = {
  version: 1,
  sectionTitles: {
    biodata: 'BIODATA',
    measurements: 'MEASUREMENTS',
    appeal: 'APPEAL',
    scoring: 'SCORE',
    attributes: 'ATTRIBUTES',
    specialty: 'SPECIALTY',
    appearance: 'APPEARANCE',
    impression: 'IMPRESSION',
  },
  fields: {
    // Biodata
    name: {
      id: 'name',
      category: 'biodata',
      label: 'FULL NAME',
      shortDescription: 'Identitas nama lengkap resmi atau nama panggung talent dalam basis data.',
      editorGuidelines: 'First Name wajib diisi dengan huruf kapital. Last Name dikosongkan jika artis hanya memiliki nama tunggal (single name).'
    },
    rank: {
      id: 'rank',
      category: 'biodata',
      label: 'RANK',
      shortDescription: 'Peringkat posisi artis secara keseluruhan pada sistem berdasarkan perolehan Overall Rating tertinggi.',
      editorGuidelines: 'Dihitung secara otomatis berdasarkan perbandingan nilai Overall Rating dengan seluruh artis lain di database.'
    },
    country: {
      id: 'country',
      category: 'biodata',
      label: 'COUNTRY',
      shortDescription: 'Negara asal atau kebangsaan talent beserta bendera visual resmi.',
      editorGuidelines: 'Pilihan tunggal. Jika negara belum tersedia, gunakan tombol "+ Tambah Negara Baru" untuk mendaftarkan nama dan kode bendera ISO.'
    },
    bornDate: {
      id: 'bornDate',
      category: 'biodata',
      label: 'BORN',
      shortDescription: 'Tanggal kelahiran untuk menghitung usia saat ini dan usia saat debut secara otomatis.',
      editorGuidelines: 'Format YYYY-MM-DD. Menghitung usia kronologis secara otomatis.'
    },
    debutDate: {
      id: 'debutDate',
      category: 'biodata',
      label: 'DEBUT',
      shortDescription: 'Tanggal awal memulai karier atau karya pertama yang tercatat.',
      editorGuidelines: 'Format YYYY-MM-DD. Digunakan untuk menghitung usia debut dan jam terbang industri.'
    },
    heightCm: {
      id: 'heightCm',
      category: 'biodata',
      label: 'HEIGHT',
      shortDescription: 'Tinggi badan talent dalam satuan centimeter (cm).',
      editorGuidelines: 'Masukkan angka dalam satuan centimeter (misal: 168).'
    },
    typeCode: {
      id: 'typeCode',
      category: 'biodata',
      label: 'BODY TYPE',
      shortDescription: 'Klasifikasi 2-huruf kombinasi tinggi (Short/Average/Tall) dan postur (Skinny/Slim/Average/Chubby/Overweight).',
      editorGuidelines: 'Pilih kode tipe (misal AK = Sedang Kurus, SL = Pendek Ramping, TL = Tinggi Ramping).'
    },
    artistStatus: {
      id: 'artistStatus',
      category: 'biodata',
      label: 'STATUS ARTIS',
      shortDescription: 'Status jenjang karier dan klasifikasi profesi artis: Amatir atau Profesional.',
      editorGuidelines: 'Pilihan tunggal. Tentukan apakah artis berstatus Amatir (pemula/independen) atau Profesional (resmi/berlisensi).'
    },

    // Measurements
    cupSize: {
      id: 'cupSize',
      category: 'measurements',
      label: 'CUP SIZE',
      shortDescription: 'Ukuran volume cup payudara standar internasional (A hingga J Cup).',
      editorGuidelines: 'Pilihan tunggal standar cup internasional.'
    },
    bustCm: {
      id: 'bustCm',
      category: 'measurements',
      label: 'BUST SIZE',
      shortDescription: 'Ukuran lingkar dada penuh dalam satuan centimeter (cm).',
      editorGuidelines: 'Satuan cm, digunakan dalam perhitungan indeks proporsi tubuh.'
    },
    waistCm: {
      id: 'waistCm',
      category: 'measurements',
      label: 'WAIST SIZE',
      shortDescription: 'Ukuran lingkar pinggang terkecil dalam satuan centimeter (cm).',
      editorGuidelines: 'Satuan cm, menentukan rasio kelangsingan lekuk tubuh (WHR).'
    },
    hipCm: {
      id: 'hipCm',
      category: 'measurements',
      label: 'HIP SIZE',
      shortDescription: 'Ukuran lingkar pinggul terlebar dalam satuan centimeter (cm).',
      editorGuidelines: 'Satuan cm, menentukan rasio siluet jam pasir.'
    },
    proportionalRating: {
      id: 'proportionalRating',
      category: 'measurements',
      label: 'PROPORTIONAL RATING',
      shortDescription: 'Indeks estetika keseimbangan rasio Waist-to-Hip dan Bust-to-Waist (skala 60–99).',
      editorGuidelines: 'Dihitung secara otomatis berdasarkan formula deviasi rasio keemasan (golden ratio).'
    },

    // Attributes & Specialty
    attributes: {
      id: 'attributes',
      category: 'attributes',
      label: 'ATTRIBUTES',
      shortDescription: 'Tag karakteristik khusus. Jika terisi minimal 1, artis berstatus "Special" (Banner #00BCD5 Cyan). Jika kosong, berstatus "Standard" (Banner #FECDD2 Pink).',
      editorGuidelines: 'Tambahkan tag khusus (misal: "High Fashion", "Sultry Eyes"). Kosongkan untuk mengklasifikasikan sebagai Standard.'
    },
    specialty: {
      id: 'specialty',
      category: 'attributes',
      label: 'SPECIALTY',
      shortDescription: 'Genre, bidang fokus, atau keunggulan spesifik performa talent.',
      editorGuidelines: 'Pilih atau ketik keahlian khusus talent (misal: "Runway", "Editorial", "Cosplay").'
    },

    // Appeal
    maturity: {
      id: 'maturity',
      category: 'appeal',
      label: 'MATURITY',
      shortDescription: 'Kategori aura kematangan tampilan visual: Teen/Young, MILF/Mature, atau Cougar.',
      editorGuidelines: 'Pilih tingkat kematangan visual sesuai kriteria wajah, gestur, dan kesan usia panggung.'
    },
    vibe: {
      id: 'vibe',
      category: 'appeal',
      label: 'VIBE',
      shortDescription: 'Suasana atau energi emosional utama (Girl Next Door, Innocent, Bad Girl, atau GFE).',
      editorGuidelines: 'Pilih persona yang paling mendominasi interaksi di depan kamera.'
    },
    style: {
      id: 'style',
      category: 'appeal',
      label: 'STYLE',
      shortDescription: 'Karakteristik busana, riasan wajah, dan penataan rambut talent.',
      editorGuidelines: 'Pilih style representatif: Elegant, Gothic/Alt, Sporty, atau Bohemian.'
    },
    bodyShape: {
      id: 'bodyShape',
      category: 'appeal',
      label: 'BODY SHAPE',
      shortDescription: 'Klasifikasi struktur siluet fisik: Petite, Slim, Athletic, Curvy, Thick, atau Voluptuous.',
      editorGuidelines: 'Pilih bentuk siluet sesuai lekukan dan komposisi massa tubuh.'
    },

    // Scoring
    appearanceScore: {
      id: 'appearanceScore',
      category: 'scoring',
      label: 'APPEARANCE SCORE',
      shortDescription: 'Nilai gabungan estetika visual fisik (Face, Skin, Breast, Butt, V, Thigh & Calve) dengan bobot 60% terhadap Overall Rating.',
      editorGuidelines: 'Nilai gabungan 6 atribut fisik terstandarisasi skala 1-99.'
    },
    impressionScore: {
      id: 'impressionScore',
      category: 'scoring',
      label: 'IMPRESSION SCORE',
      shortDescription: 'Nilai gabungan performa, vokal, chemistry, aura, dan daya tarik panggung dengan bobot 40% terhadap Overall Rating.',
      editorGuidelines: 'Nilai gabungan 6 atribut impresi & karisma terstandarisasi skala 1-99.'
    },
    overallRating: {
      id: 'overallRating',
      category: 'scoring',
      label: 'OVERALL RATING',
      shortDescription: 'Nilai peringkat akhir terstandar: Round(Appearance × 60% + Impression × 40%) skala 1–99.',
      editorGuidelines: 'Formula tertimbang utama penentu posisi pada Leaderboard.'
    }
  },

  countries: [
    { name: 'Moldova', code: 'MD' },
    { name: 'Japan', code: 'JP' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'United States', code: 'US' },
    { name: 'Russia', code: 'RU' },
    { name: 'France', code: 'FR' },
    { name: 'Brazil', code: 'BR' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Thailand', code: 'TH' },
    { name: 'China', code: 'CN' },
    { name: 'Spain', code: 'ES' },
    { name: 'Italy', code: 'IT' },
    { name: 'Germany', code: 'DE' },
    { name: 'Australia', code: 'AU' },
    { name: 'Canada', code: 'CA' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Netherlands', code: 'NL' },
  ],

  artistTypes: ARTIST_TYPES,
  artistStatusCategory: {
    title: 'Status Artis',
    icon: '🏷️',
    shortDescription: 'Klasifikasi status jenjang profesi artis (Amatir / Profesional).',
    options: [
      {
        id: 'amatir',
        name: 'Amatir',
        description: 'Talent pendatang baru atau independen tanpa kontrak agensi resmi.',
        guidelines: 'Pilih untuk artis pemula atau non-agensi.'
      },
      {
        id: 'profesional',
        name: 'Profesional',
        description: 'Talent berlisensi resmi industri dengan jam terbang dan kontrak profesional.',
        guidelines: 'Pilih untuk artis profesional berpengalaman.'
      }
    ]
  },

  appealCategories: {
    maturity: {
      title: 'Maturity',
      icon: '🧬',
      shortDescription: 'Klasifikasi kematangan tampilan visual dan usia aura panggung.',
      options: [
        {
          id: 'teen_young',
          name: 'Teen / Young',
          description: 'Penampilan muda, segar, dan lugu dengan kesan usia belasan hingga awal 20-an.',
          guidelines: 'Wajah bulat/oval dengan pipi berisi, kulit sangat mulus tanpa kerutan, mata besar dan polos, tubuh mungil/ramping, aura lugu dan segar, kesan usia 18–22 tahun.'
        },
        {
          id: 'milf_mature',
          name: 'MILF / Mature',
          description: 'Penampilan matang dan percaya diri dengan tubuh berisi dan aura berpengalaman.',
          guidelines: 'Garis rahang tegas, bibir penuh, kulit kencang tapi terlihat matang, tubuh berisi/berlekuk (pinggul lebar, payudara terisi), aura percaya diri dan berpengalaman, kesan usia 30–45 tahun.'
        },
        {
          id: 'cougar',
          name: 'Cougar',
          description: 'Penampilan matang dengan aura agresif, dominan, dan predator.',
          guidelines: 'Mirip MILF tapi aura lebih agresif dan predator, makeup lebih tajam, gaya berpakaian lebih terbuka dan berani, kesan usia 35–50 tahun.'
        }
      ]
    },
    vibe: {
      title: 'Vibe',
      icon: '🎭',
      shortDescription: 'Energi psikologis, ekspresi emosional, dan persona interaksi.',
      options: [
        {
          id: 'gnd',
          name: 'Girl Next Door (GND)',
          description: 'Penampilan ramah, hangat, dan mudah didekati seperti tetangga sebelah.',
          guidelines: 'Senyuman ramah dan hangat, ekspresi terbuka/tidak dibuat-buat, tatapan lembut, gaya natural tanpa makeup berlebihan, terasa akrab dan bersahabat.'
        },
        {
          id: 'innocent',
          name: 'Innocent / Polos',
          description: 'Penampilan lugu dan menggemaskan dengan ekspresi malu atau polos.',
          guidelines: 'Mata lebar dengan alis terangkat sedikit, ekspresi sedikit bingung atau malu-malu, sering menunduk atau tersenyum tipis, terlihat polos.'
        },
        {
          id: 'bad_girl',
          name: 'Bad Girl / Rebel',
          description: 'Penampilan berani dan cuek dengan tatapan tajam dan aura misterius/berbahaya.',
          guidelines: 'Tatapan tajam dan meremehkan, sering menyeringai atau ekspresi berani, gaya rambut berantakan atau warna mencolok, aura cuek.'
        },
        {
          id: 'gfe',
          name: 'Girlfriend Experience (GFE)',
          description: 'Penampilan intim dan penuh kasih seperti pasangan/pacar sungguhan.',
          guidelines: 'Tatapan penuh kasih dan perhatian intim, senyuman manis personal, kontak mata lekat seolah mengenal penonton secara mendalam.'
        }
      ]
    },
    style: {
      title: 'Style',
      icon: '👗',
      shortDescription: 'Estetika busana, riasan wajah (makeup), dan tata rambut.',
      options: [
        {
          id: 'elegant',
          name: 'Elegant / Glamour',
          description: 'Penampilan mewah dan berkelas dengan makeup tegas dan rambut tertata rapi.',
          guidelines: 'Rambut tertata rapi (bergelombang/sanggul), makeup tegas (bibir merah, smokey eye), aksesoris mewah, aura kelas atas.'
        },
        {
          id: 'gothic',
          name: 'Gothic / Alt',
          description: 'Penampilan gelap dan edgy dengan tato, tindik, dan gaya alternatif.',
          guidelines: 'Rambut gelap/neon, tato terlihat jelas di lengan/dada, tindik (hidung/alis/bibir), makeup hitam tebal di mata, aura misterius.'
        },
        {
          id: 'sporty',
          name: 'Sporty / Active',
          description: 'Penampilan aktif dan bugar, minim makeup, dengan tubuh atletis.',
          guidelines: 'Rambut diikat ponytail, sedikit/tanpa makeup, kulit segar berkilau, tubuh kencang berotot, aura energik.'
        },
        {
          id: 'boho',
          name: 'Bohemian / Natural',
          description: 'Penampilan alami dan santai, makeup minimalis, dengan gaya bebas mengalir.',
          guidelines: 'Rambut alami bergelombang/keriting tanpa styling berat, makeup earthy tone minimal, gaya santai, aura bebas.'
        }
      ]
    },
    bodyShape: {
      title: 'Body Shape',
      icon: '🏋️',
      shortDescription: 'Struktur rangka tulang, massa otot, dan distribusi lekuk fisik.',
      options: [
        {
          id: 'petite',
          name: 'Petite / Mungil',
          description: 'Perawakan kecil dan mungil dengan rangka tulang halus (<155 cm).',
          guidelines: 'Tinggi badan < 155cm, bahu sempit, tulang kecil, postur kompak dan lincah.'
        },
        {
          id: 'slim',
          name: 'Slim / Langsing',
          description: 'Tubuh ramping dan proporsional dengan kesan ringan dan elegan.',
          guidelines: 'Lemak tubuh rendah tanpa definisi otot mencolok, pinggang terlihat jelas, anggota tubuh jenjang.'
        },
        {
          id: 'athletic',
          name: 'Athletic / Berotot',
          description: 'Tubuh kencang dan berotot dengan kesan kuat dan terlatih.',
          guidelines: 'Otot perut terlihat jelas (sixpack/tone), lengan dan paha berotot kencang, tidak ada lemak berlebih.'
        },
        {
          id: 'curvy',
          name: 'Curvy / Jam Pasir',
          description: 'Siluet angka 8 dengan lekukan tegas antara pinggang, pinggul, dan dada.',
          guidelines: 'Pinggang jauh lebih ramping dibanding pinggul dan dada, siluet lekukan tegas dan proporsional.'
        },
        {
          id: 'thick',
          name: 'Thick / Padat Berisi',
          description: 'Tubuh padat dan bervolume kencang pada area paha dan pinggul.',
          guidelines: 'Paha besar dan padat, bokong padat terisi, pinggang tetap ramping, terasa padat kencang.'
        },
        {
          id: 'voluptuous',
          name: 'Voluptuous / Berisi',
          description: 'Tubuh montok dan penuh dengan lekukan lembut alami.',
          guidelines: 'Payudara dan bokong bervolume besar, paha berisi, pinggang terlihat dengan aura montok lembut.'
        }
      ]
    }
  },

  attributeCategories: {
    primaryTrait: {
      title: 'Primary Trait',
      icon: '✨',
      shortDescription: 'Karakteristik visual dan aura pesona utama yang mendefinisikan artis.',
      options: [
        {
          id: 'high_fashion',
          name: 'High Fashion',
          description: 'Penampilan modeling kelas tinggi dengan siluet tajam dan ekspresi editorial.',
          guidelines: 'Garis wajah tegas, tatapan intens, postur elegan khas panggung catwalk internasional.'
        },
        {
          id: 'sultry_eyes',
          name: 'Sultry Eyes',
          description: 'Tatapan mata memikat yang tajam, sensual, dan menggoda di depan kamera.',
          guidelines: 'Sorot mata tajam bernuansa sensual, kontak kamera yang dalam dan memikat.'
        },
        {
          id: 'idol_aura',
          name: 'Idol Aura',
          description: 'Pesona bintang idola yang memancarkan energi ceria, manis, dan magnetis.',
          guidelines: 'Senyuman memikat yang ramah, visual fotogenik ala idol, aura cerah dan positif.'
        },
        {
          id: 'classic_elegance',
          name: 'Classic Elegance',
          description: 'Keanggunan klasik abadi dengan proporsi wajah simetris dan pembawaan anggun.',
          guidelines: 'Postur tegak berkelas, riasan natural elegan, ekspresi tenang berwibawa.'
        },
        {
          id: 'exotic_beauty',
          name: 'Exotic Beauty',
          description: 'Kecantikan eksotis dengan fitur khas memikat yang membedakannya dari lainnya.',
          guidelines: 'Fitur wajah berkarakter kuat, warna kulit atau mata khas, daya tarik visual unik.'
        },
        {
          id: 'gothic_charm',
          name: 'Gothic Charm',
          description: 'Daya tarik misterius, gelap, dan edgy dengan karakter alternatif yang memikat.',
          guidelines: 'Gaya visual gelap atau misterius, ekspresi dingin memikat, aura misteri.'
        },
        {
          id: 'fitness_model',
          name: 'Fitness Model',
          description: 'Definisi estetika bugar, atletis, dan berotot proporsional.',
          guidelines: 'Tubuh kencang dan bugar, postur atletis, aura percaya diri tinggi.'
        }
      ]
    },
    bodyTrait: {
      title: 'Body Feature',
      icon: '💎',
      shortDescription: 'Ciri fisik khusus dan keunikan tubuh yang menjadi daya tarik visual.',
      options: [
        {
          id: 'porcelain_skin',
          name: 'Porcelain Skin',
          description: 'Kulit halus bersinar tanpa cela dengan tekstur mulus porselen.',
          guidelines: 'Warna kulit merata, kilau alami, pori-pori halus, tekstur sangat mulus.'
        },
        {
          id: 'natural_curves',
          name: 'Natural Curves',
          description: 'Lekukan tubuh alami yang harmonis antara pinggang, dada, dan pinggul.',
          guidelines: 'Proporsi lekuk tubuh alami tanpa kesan berlebihan, siluet feminin seimbang.'
        },
        {
          id: 'tattooed_pierced',
          name: 'Tattooed & Pierced',
          description: 'Aksen seni tato dan tindik yang estetik dan mempertegas karakter visual.',
          guidelines: 'Tato artistik di bagian tubuh strategis, tindik estetik yang memperkuat persona.'
        },
        {
          id: 'busty_appeal',
          name: 'Busty Appeal',
          description: 'Bentuk dada bervolume menonjol yang menjadi daya tarik utama.',
          guidelines: 'Proporsi dada besar yang menonjol dan kencang sesuai proporsi tubuh.'
        },
        {
          id: 'petite_powerhouse',
          name: 'Petite Powerhouse',
          description: 'Postur mungil dengan daya tarik karismatik dan energi panggung kuat.',
          guidelines: 'Tinggi badan di bawah rata-rata namun dengan proporsi tubuh rapat dan presisi.'
        },
        {
          id: 'athletic_tone',
          name: 'Athletic Tone',
          description: 'Otot tubuh kencang terlatih dengan definisi fisik jelas.',
          guidelines: 'Garis otot perut atau paha yang terbentuk rapi, postur tegak dan bertenaga.'
        },
        {
          id: 'silky_long_hair',
          name: 'Silky Long Hair',
          description: 'Rambut panjang indah berkilau yang menyempurnakan keanggunan visual.',
          guidelines: 'Rambut panjang lebat terawat, berkilau sehat saat bergerak di depan kamera.'
        }
      ]
    },
    charmPoint: {
      title: 'Charm Point',
      icon: '🌟',
      shortDescription: 'Titik pesona khas yang menjadi tanda pengenal dan pemikat utama.',
      options: [
        {
          id: 'fox_eyes',
          name: 'Fox / Cat Eyes',
          description: 'Bentuk sudut mata terangkat seperti rubah/kucing yang tajam dan memikat.',
          guidelines: 'Sudut mata luar sedikit terangkat, tatapan tajam dan memikat saat menatap kamera.'
        },
        {
          id: 'plump_lips',
          name: 'Plump Lips',
          description: 'Bibir penuh, bervolume, dan sensual.',
          guidelines: 'Bentuk bibir penuh alami dengan proporsi simetris yang sensual.'
        },
        {
          id: 'deep_dimples',
          name: 'Deep Dimples',
          description: 'Lesung pipi manis yang tampak jelas saat tersenyum.',
          guidelines: 'Lesung pipi dalam di satu atau kedua sisi wajah yang menambah pesona manis.'
        },
        {
          id: 'beauty_mark',
          name: 'Beauty Mark / Mole',
          description: 'Tahi lalat pemikat di area wajah atau tubuh yang ikonik.',
          guidelines: 'Tahi lalat di dekat mata, bibir, pipi, atau bahu yang menjadi ciri khas visual.'
        },
        {
          id: 'radiant_smile',
          name: 'Radiant Smile',
          description: 'Senyuman cerah memikat hati dengan susunan gigi rapi.',
          guidelines: 'Senyuman hangat yang memancarkan aura kegembiraan dan keramahan.'
        },
        {
          id: 'hourglass_waist',
          name: 'Hourglass Waistline',
          description: 'Garis pinggang ramping yang menonjolkan lekukan jam pasir ekstrem.',
          guidelines: 'Rasio pinggang sangat kecil terhadap pinggul sehingga lekuk tubuh sangat tegas.'
        }
      ]
    }
  },

  specialtyCategories: {
    mainSpecialty: {
      title: 'Main Specialty',
      icon: '🏆',
      shortDescription: 'Bidang keahlian dan fokus utama berkarier dalam industri.',
      options: [
        {
          id: 'editorial_fashion',
          name: 'Editorial & High Fashion',
          description: 'Pemotretan majalah mode dan kampanye visual mewah kelas tinggi.',
          guidelines: 'Keahlian berpose artistik, pemahaman busana tinggi, ekspresi editorial.'
        },
        {
          id: 'runway_catwalk',
          name: 'Runway & Catwalk',
          description: 'Peragaan busana panggung profesional dengan langkah catwalk terlatih.',
          guidelines: 'Postur tegak, tempo jalan stabil, pembawaan busana panggung meyakinkan.'
        },
        {
          id: 'glamour_lingerie',
          name: 'Glamour & Lingerie',
          description: 'Modeling busana mewah, pakaian dalam elegan, dan pemotretan glamor.',
          guidelines: 'Keahlian menonjolkan estetika tubuh dan pakaian dalam dengan elegan tanpa kesan vulgar.'
        },
        {
          id: 'commercial_ads',
          name: 'Commercial & Ads',
          description: 'Iklan komersial, brand ambassador, dan promosi produk publik.',
          guidelines: 'Ekspresi ramah publik, komunikasi visual persuasif, fleksibilitas konsep iklan.'
        },
        {
          id: 'cosplay_thematic',
          name: 'Cosplay & Thematic',
          description: 'Kostum tematik, adaptasi karakter fantasi, dan pemotretan konsep imajinatif.',
          guidelines: 'Keahlian penjiwaan karakter fiksi, detail kostum tinggi, gestur tematik akurat.'
        },
        {
          id: 'cinematic_acting',
          name: 'Cinematic Acting',
          description: 'Akting panggung dramatis, video musik, dan karya visual bergerak bernarasi.',
          guidelines: 'Penjiwaan naskah emosional, mimik wajah dinamis di depan kamera video bergerak.'
        }
      ]
    },
    performanceGenre: {
      title: 'Performance Genre',
      icon: '🎬',
      shortDescription: 'Gaya pembawaan, dinamika emosional, dan karakter performa.',
      options: [
        {
          id: 'sensual_passionate',
          name: 'Sensual & Passionate',
          description: 'Pembawaan penuh gairah, emosi mendalam, dan intensitas visual tinggi.',
          guidelines: 'Ekspresi penuh hasrat, interaksi intim, tempo emosional mendalam.'
        },
        {
          id: 'romantic_soft',
          name: 'Romantic & Soft',
          description: 'Pembawaan lembut, manis, hangat, dan bernuansa romantis personal.',
          guidelines: 'Tatapan lembut berkasih, senyum manis personal, pembawaan tenang hangat.'
        },
        {
          id: 'energetic_playful',
          name: 'Energetic & Playful',
          description: 'Pembawaan dinamis, ceria, interaktif, dan penuh semangat menghibur.',
          guidelines: 'Gerakan lincah dinamis, tawa ceria, interaksi interaktif spontan.'
        },
        {
          id: 'dramatic_expressive',
          name: 'Dramatic & Expressive',
          description: 'Penjiwaan ekspresif dengan intensitas emosional dan panggung tinggi.',
          guidelines: 'Ekspresi dramatis kuat, bahasa tubuh ekspresif, dampak visual membekas.'
        },
        {
          id: 'subtle_elegant',
          name: 'Subtle & Elegant',
          description: 'Ekspresi tenang, berwibawa, anggun, dan memikat secara halus.',
          guidelines: 'Gestur minimalis anggun, daya pikat subtle tanpa gerakan berlebihan.'
        }
      ]
    },
    visualTheme: {
      title: 'Visual Theme',
      icon: '🎨',
      shortDescription: 'Konsep tata visual, estetika pencahayaan, dan latar panggung unggulan.',
      options: [
        {
          id: 'studio_glam',
          name: 'Studio Glam',
          description: 'Tata cahaya studio mewah, latar kontras tajam, dan estetika premium.',
          guidelines: 'Pencahayaan studio terarah (key/fill light), latar bersih mewah, detail visual tajam.'
        },
        {
          id: 'cinematic_film',
          name: 'Cinematic Film',
          description: 'Nuansa sinematik dengan gradasi warna artistik layaknya film layar lebar.',
          guidelines: 'Color grading artistik, komposisi sinematik, sudut kamera dramatis.'
        },
        {
          id: 'outdoor_natural',
          name: 'Outdoor & Natural',
          description: 'Latar alam terbuka dengan pencahayaan matahari alami dan suasana segar.',
          guidelines: 'Lokasi pantai/taman/pegunungan, sinar matahari natural, suasana bebas.'
        },
        {
          id: 'urban_streetwear',
          name: 'Urban & Streetwear',
          description: 'Gaya modern perkotaan yang berani, dinamis, dan berjiwa muda.',
          guidelines: 'Latar jalanan kota/arsitektur modern, busana streetwear trendi, pose dinamis.'
        },
        {
          id: 'vintage_retro',
          name: 'Vintage & Retro',
          description: 'Estetika klasik nostalgia era 70-an hingga 90-an dengan palet warna hangat.',
          guidelines: 'Aksen properti vintage, tekstur film analog/grain, palet warna nostalgia hangat.'
        }
      ]
    }
  },

  cupSizes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],

  presetAttributes: [
    'High Fashion',
    'Sultry Eyes',
    'Fitness Model',
    'Tattooed & Pierced',
    'Gothic Charm',
    'Idol Aura',
    'Classic Elegance',
    'Exotic Beauty',
    'Busty Appeal',
    'Petite Powerhouse',
  ],

  presetSpecialties: [
    'Editorial',
    'Runway',
    'Commercial',
    'Cosplay',
    'Glamour',
    'Acting',
    'Fitness & Wellness',
    'Music Video',
    'Artistic Nude',
    'Social Media Influencer',
  ],

  scoringTraits: {
    appearance: [
      {
        key: 'face',
        label: 'FACE',
        category: 'appearance',
        weight: 0.25,
        weightLabel: '25%',
        shortDescription: 'Menilai keindahan struktur tulang wajah, kesimetrisan, tatapan mata, dan proporsi fitur wajah.',
        rubricGuide: {
          sTier: '90–99: Wajah luar biasa simetris, fitur sangat menonjol dan memikat kamera.',
          aTier: '80–89: Sangat menarik, proporsi wajah harmonis dan fotogenik.',
          bTier: '70–79: Menarik standar industri modeling dengan fitur seimbang.',
          cTier: '< 70: Wajah rata-rata atau kurang menonjol di kamera.'
        }
      },
      {
        key: 'skin',
        label: 'SKIN',
        category: 'appearance',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai kehalusan tekstur kulit, keseragaman warna, kilau sehat, dan kebersihan visual.',
        rubricGuide: {
          sTier: '90–99: Kulit porselen sempurna, mulus tanpa cela, berkilau sehat.',
          aTier: '80–89: Kulit bersih, kencang, dan terawat sangat baik.',
          bTier: '70–79: Kondisi kulit standar baik dengan sedikit ketidakrataan wajar.',
          cTier: '< 70: Kulit kusam atau memiliki banyak bekas noda.'
        }
      },
      {
        key: 'breast',
        label: 'BREAST',
        category: 'appearance',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai bentuk estetika, kekencangan, dan proporsi keserasian terhadap siluet tubuh.',
        rubricGuide: {
          sTier: '90–99: Bentuk dan proporsi sempurna, posisi kencang ideal terhadap torso.',
          aTier: '80–89: Sangat proporsional dan memiliki bentuk menarik.',
          bTier: '70–79: Bentuk dan ukuran rata-rata proporsional.',
          cTier: '< 70: Kurang proporsional terhadap rangka tubuh.'
        }
      },
      {
        key: 'butt',
        label: 'BUTT',
        category: 'appearance',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai bentuk lekukan, kepenuhan volume, dan kekencangan siluet bokong dari samping & belakang.',
        rubricGuide: {
          sTier: '90–99: Siluet bulat sempurna, sangat padat dan terangkat alami.',
          aTier: '80–89: Volume dan kekencangan di atas rata-rata.',
          bTier: '70–79: Bentuk proporsional standar dengan lekuk yang jelas.',
          cTier: '< 70: Rata atau kurang tonus otot.'
        }
      },
      {
        key: 'v',
        label: 'V',
        category: 'appearance',
        weight: 0.10,
        weightLabel: '10%',
        shortDescription: 'Menilai kerapian, kebersihan estetika, dan keindahan penampilan area intim.',
        rubricGuide: {
          sTier: '90–99: Tampilan estetika sangat rapi, bersih, dan menarik visual.',
          aTier: '80–89: Terawat dan bersih dengan estetika baik.',
          bTier: '70–79: Standar higienis dan terawat.',
          cTier: '< 70: Kurang terawat.'
        }
      },
      {
        key: 'thighCalve',
        label: 'THIGH & CALVE',
        category: 'appearance',
        weight: 0.20,
        weightLabel: '20%',
        shortDescription: 'Menilai kelangsingan, kelurusan, tonus otot, dan proporsi panjang kaki secara keseluruhan.',
        rubricGuide: {
          sTier: '90–99: Kaki jenjang sempurna, lekuk paha dan betis proporsional elegan.',
          aTier: '80–89: Kaki kencang, ramping, dan memiliki proporsi menarik.',
          bTier: '70–79: Proporsi kaki seimbang dengan postur tubuh.',
          cTier: '< 70: Kurang proporsional atau tonus otot kurang baik.'
        }
      }
    ],
    impression: [
      {
        key: 'voice',
        label: 'VOICE',
        category: 'impression',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai daya tarik vokal, artikulasi, kehangatan nada bicara, dan sensualitas suara.',
        rubricGuide: {
          sTier: '90–99: Suara sangat merdu, menggoda, dan memiliki daya hipnotis audio tinggi.',
          aTier: '80–89: Intonasi jelas, artikulatif, dan menyenangkan didengar.',
          bTier: '70–79: Kualitas vokal standar yang baik dan jelas.',
          cTier: '< 70: Vokal datar, canggung, atau kurang terdengar alami.'
        }
      },
      {
        key: 'expression',
        label: 'EXPRESSION',
        category: 'impression',
        weight: 0.20,
        weightLabel: '20%',
        shortDescription: 'Menilai keluwesan mimik wajah, variasi ekspresi emosional, dan kenikmatan natural.',
        rubricGuide: {
          sTier: '90–99: Mimik wajah sangat ekspresif, kontak mata hidup, reaksi terasa murni.',
          aTier: '80–89: Ekspresi emosional beragam dan tidak kaku.',
          bTier: '70–79: Ekspresi cukup baik meski sesekali terkesan terarah.',
          cTier: '< 70: Mimik wajah kaku atau monoton.'
        }
      },
      {
        key: 'sexAppeal',
        label: 'SEX APPEAL',
        category: 'impression',
        weight: 0.20,
        weightLabel: '20%',
        shortDescription: 'Menilai intensitas daya tarik sensual bawaan dan kemampuan memikat hasrat penonton.',
        rubricGuide: {
          sTier: '90–99: Daya pikat sensual luar biasa magnetis tanpa kesan dipaksakan.',
          aTier: '80–89: Sangat atraktif dan memiliki gestur tubuh menggoda.',
          bTier: '70–79: Memiliki daya tarik yang baik dan percaya diri.',
          cTier: '< 70: Kurang memancarkan pesona sensual.'
        }
      },
      {
        key: 'authenticity',
        label: 'AUTHENTICITY',
        category: 'impression',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai seberapa natural, jujur, dan tidak dibuat-buat performa talent di depan kamera.',
        rubricGuide: {
          sTier: '90–99: Terasa 100% tulus, spontan, dan tidak seperti sedang berakting.',
          aTier: '80–89: Natural dan santai dalam pembawaan karakter.',
          bTier: '70–79: Cukup alami dengan sedikit kesan skenario.',
          cTier: '< 70: Terasa sangat dibuat-buat atau mekanis.'
        }
      },
      {
        key: 'chemistry',
        label: 'CHEMISTRY',
        category: 'impression',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai kemampuan membangun koneksi harmonis dan interaksi hangat dengan lawan main / penonton.',
        rubricGuide: {
          sTier: '90–99: Sinergi interaksi luar biasa intens dan saling mengisi secara alami.',
          aTier: '80–89: Interaksi hidup, responsif, dan kooperatif.',
          bTier: '70–79: Kerja sama standar profesional yang berjalan lancar.',
          cTier: '< 70: Interaksi dingin atau terasa terpisah.'
        }
      },
      {
        key: 'aura',
        label: 'AURA',
        category: 'impression',
        weight: 0.15,
        weightLabel: '15%',
        shortDescription: 'Menilai pancaran karisma istimewa, kehadiran panggung, dan faktor pembeda unik (X-Factor).',
        rubricGuide: {
          sTier: '90–99: Karisma luar biasa yang langsung mendominasi layar dan tak terlupakan.',
          aTier: '80–89: Memiliki pesona khas yang kuat dan berkesan.',
          bTier: '70–79: Kehadiran panggung yang solid dan percaya diri.',
          cTier: '< 70: Karisma standar, belum memiliki ciri khas kuat.'
        }
      }
    ]
  },

  scoringWeights: {
    appearanceWeight: 60,
    impressionWeight: 40,
  },

  pageTexts: {
    home: {
      title: 'TALENT RATING PRO',
      subtitle: 'Database & Sistem Penilaian Artis Terstruktur',
      badge: 'PRO',
      description: 'Sistem komprehensif untuk mendata, mengkategorikan, dan menilai profil artis secara terstandar.',
      buttons: {
        search: 'Cari Artis',
        guidelines: 'Panduan',
        add: 'Tambah Artis',
        viewAll: 'Lihat Semua'
      },
      labels: {
        appTitle: 'TALENT RATING PRO',
        statusActive: 'Database Aktif'
      }
    },
    artistList: {
      title: 'Daftar Katalog Artis',
      subtitle: 'Koleksi Kartu & Profil Model Terdaftar',
      badge: 'Katalog',
      description: 'Filter dan urutkan kartu artis berdasarkan status, nilai overall, penampilan, impresi, atau proporsi.',
      buttons: {
        tabAll: 'Semua',
        tabSpecial: 'Special',
        tabStandard: 'Standard',
        sortLabel: 'Sortir Card',
        addNew: 'Buat Entri Artis Baru'
      },
      labels: {
        emptyTitle: 'Tidak Ada Artis Ditemukan',
        emptyDesc: 'Coba ubah kata kunci pencarian atau buat entri artis baru.'
      }
    },
    artistDetail: {
      title: 'Profil & Detail Lengkap Artis',
      subtitle: 'Kartu Penilaian & Pengukuran Tubuh Presisi',
      badge: 'Detail Artis',
      description: 'Informasi biodata terperinci, rasio tubuh, klasifikasi daya tarik, dan rincian perolehan skor.',
      buttons: {
        back: 'Kembali',
        edit: 'Edit Data Artis',
        delete: 'Hapus Entri',
        compare: 'Bandingkan Artis',
        download: 'Unduh Kartu (PNG)'
      },
      sections: {
        biodata: 'BIODATA',
        measurements: 'MEASUREMENTS',
        appeal: 'APPEAL CLASSIFICATION',
        attributes: 'ATTRIBUTES',
        specialty: 'SPECIALTY',
        scoring: 'SCORING BREAKDOWN'
      }
    },
    ranking: {
      title: 'Leaderboard & Peringkat Artis',
      subtitle: 'Papan Skor Terstandar & Tangga Juara',
      badge: 'Leaderboard',
      description: 'Peringkat posisi teratas berdasarkan akumulasi Overall Rating, Appearance, Impression, dan Proportional Rating.',
      buttons: {
        overall: 'Overall Rating',
        appearance: 'Appearance',
        impression: 'Impression',
        proportional: 'Proportional'
      },
      labels: {
        podiumTitle: 'Top 3 Podium (Fixed)',
        podiumSubtitle: '1 (Kiri) • 2 (Tengah) • 3 (Kanan)',
        remainingTitle: 'Daftar Rank 4 & Seterusnya'
      }
    },
    compare: {
      title: 'HEAD-TO-HEAD ARTIST COMPARISON',
      subtitle: 'Analisis Komparasi Profil & Skor Dua Artis',
      badge: 'Head-to-Head',
      description: 'Perbandingan visual metrik demi metrik secara presisi antara dua profil artis dalam satu layar.',
      buttons: {
        back: 'Kembali',
        swap: 'TUKAR POSISI (SWAP)',
        compareByLabel: 'COMPARE BY (Pilih Kriteria):'
      },
      labels: {
        slot1: 'Slot 1 (Kiri)',
        slot2: 'Slot 2 (Kanan)',
        versus: 'VS',
        statusPrefix: 'Status Komparasi'
      }
    },
    create: {
      title: 'BUAT ARTIS BARU',
      subtitle: 'Entri Data & Standar Penilaian Model Baru',
      badge: 'Entri Baru',
      description: 'Semua bidang bersifat opsional kecuali FIRST NAME. Nilai dihitung secara otomatis secara real-time.',
      buttons: {
        cancel: 'BATAL',
        submit: 'SIMPAN & BUAT ARTIS'
      },
      labels: {
        mandatoryNotice: 'Semua bidang bersifat opsional kecuali FIRST NAME.'
      }
    },
    edit: {
      title: 'MODE EDIT ENTRI ARTIS',
      subtitle: 'Pembaruan Data & Penyesuaian Nilai Artis',
      badge: 'Mode Edit',
      description: 'Perbarui biodata, pengukuran tubuh, klasifikasi daya pikat, maupun skor penilaian artis.',
      buttons: {
        cancel: 'BATAL',
        submit: 'SIMPAN PERUBAHAN ARTIS'
      },
      labels: {
        savePrompt: 'Pastikan data telah sesuai sebelum menyimpan perubahan.'
      }
    }
  }
};
