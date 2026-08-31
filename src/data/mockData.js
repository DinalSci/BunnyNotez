// Bunny Notes - Default Initial Mock Data
export const INITIAL_STUDENTS = [
  {
    index_no: 'BN001',
    name: 'Kasun Perera',
    email: 'kasun@gmail.com',
    password: 'password123',
    role: 'student',
    phone: '0771234567',
    batch: '2026 A/L',
    joined_date: '2026-01-15'
  },
  {
    index_no: 'BN002',
    name: 'Nethmi Silva',
    email: 'nethmi@gmail.com',
    password: 'password123',
    role: 'student',
    phone: '0719876543',
    batch: '2026 A/L',
    joined_date: '2026-01-18'
  },
  {
    index_no: 'BN003',
    name: 'Dilshan Bandara',
    email: 'dilshan@gmail.com',
    password: 'password123',
    role: 'student',
    phone: '0751122334',
    batch: '2026 A/L',
    joined_date: '2026-02-01'
  }
];

export const INITIAL_ADMINS = [
  {
    admin_id: 'ADM001',
    name: 'Danushka Sir (Admin)',
    email: 'admin@bunnynotes.com',
    password: 'admin123',
    role: 'admin',
    subject: 'Biology'
  },
  {
    admin_id: 'ADM002',
    name: 'Tharindu Sir (Admin)',
    email: 'tharindu@bunnynotes.com',
    password: 'admin123',
    role: 'admin',
    subject: 'Chemistry'
  },
  {
    admin_id: 'ADM003',
    name: 'Nuwan Sir (Admin)',
    email: 'nuwan@bunnynotes.com',
    password: 'admin123',
    role: 'admin',
    subject: 'Physics'
  }
];

export const INITIAL_PAPERS = [
  // Biology
  {
    id: 'BIO-01',
    subject: 'Biology',
    paper_name: 'Biology Model Paper 01 - Cell & Genetics',
    description: 'Structured Essay & MCQ coverage on Unit 01-03.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-09-10 23:59',
    status: 'active',
    created_at: '2026-08-25',
    max_marks: 100
  },
  {
    id: 'BIO-02',
    subject: 'Biology',
    paper_name: 'Biology Speed Paper 02 - Plant Physiology',
    description: 'Plant water relations, photosynthesis & transport.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-08-15 23:59',
    status: 'closed',
    created_at: '2026-08-01',
    max_marks: 100
  },
  {
    id: 'BIO-03',
    subject: 'Biology',
    paper_name: 'Biology Unit Test 03 - Animal Physiology & Nervous System',
    description: 'Covers human digestion, circulation and coordination.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-07-25 23:59',
    status: 'closed',
    created_at: '2026-07-15',
    max_marks: 100
  },

  // Chemistry
  {
    id: 'CHEM-01',
    subject: 'Chemistry',
    paper_name: 'Chemistry Full Paper 01 - General & Physical Chemistry',
    description: 'Chemical calculations, equilibrium and electrochemistry.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-09-12 23:59',
    status: 'active',
    created_at: '2026-08-26',
    max_marks: 100
  },
  {
    id: 'CHEM-02',
    subject: 'Chemistry',
    paper_name: 'Chemistry Organic Synthesis & Reactions Part 02',
    description: 'Alkyl halides, alcohols, carbonyls & conversions.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-08-18 23:59',
    status: 'closed',
    created_at: '2026-08-05',
    max_marks: 100
  },
  {
    id: 'CHEM-03',
    subject: 'Chemistry',
    paper_name: 'Chemistry Inorganic Chemistry & d-block Trends',
    description: 'Qualitative analysis, complex ions & oxidation states.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-07-28 23:59',
    status: 'closed',
    created_at: '2026-07-20',
    max_marks: 100
  },

  // Physics
  {
    id: 'PHY-01',
    subject: 'Physics',
    paper_name: 'Physics Mechanics & Gravitation Paper 01',
    description: 'Rotational dynamics, equilibrium, circular motion.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-09-14 23:59',
    status: 'active',
    created_at: '2026-08-27',
    max_marks: 100
  },
  {
    id: 'PHY-02',
    subject: 'Physics',
    paper_name: 'Physics Waves & Optics Paper 02',
    description: 'Doppler effect, sound intensity, resonance & refraction.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-08-20 23:59',
    status: 'closed',
    created_at: '2026-08-10',
    max_marks: 100
  },
  {
    id: 'PHY-03',
    subject: 'Physics',
    paper_name: 'Physics Current Electricity & Magnetic Fields',
    description: 'Kirchhoff laws, potentiometer & electromagnetic induction.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    deadline: '2026-07-30 23:59',
    status: 'closed',
    created_at: '2026-07-22',
    max_marks: 100
  }
];

export const INITIAL_MARKS = [
  // BN001 (Kasun)
  {
    id: 'M-001',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Biology',
    paper_id: 'BIO-03',
    paper_name: 'Biology Unit Test 03 - Animal Physiology & Nervous System',
    score: 84,
    grade: 'A',
    rank: 3,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Excellent structured answers! Pay a bit more attention to heart cycle diagrams.',
    evaluated_at: '2026-07-28'
  },
  {
    id: 'M-002',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Biology',
    paper_id: 'BIO-02',
    paper_name: 'Biology Speed Paper 02 - Plant Physiology',
    score: 78,
    grade: 'A',
    rank: 4,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Good work on water potential calculations.',
    evaluated_at: '2026-08-19'
  },
  {
    id: 'M-003',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Chemistry',
    paper_id: 'CHEM-03',
    paper_name: 'Chemistry Inorganic Chemistry & d-block Trends',
    score: 68,
    grade: 'B',
    rank: 6,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Review transition metal coordination compounds.',
    evaluated_at: '2026-07-30'
  },
  {
    id: 'M-004',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Chemistry',
    paper_id: 'CHEM-02',
    paper_name: 'Chemistry Organic Synthesis & Reactions Part 02',
    score: 74,
    grade: 'B',
    rank: 5,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Great improvement in Grignard reagents mechanisms!',
    evaluated_at: '2026-08-22'
  },
  {
    id: 'M-005',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Physics',
    paper_id: 'PHY-03',
    paper_name: 'Physics Current Electricity & Magnetic Fields',
    score: 62,
    grade: 'C',
    rank: 8,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Need more practice on Potentiometer calibration questions.',
    evaluated_at: '2026-08-02'
  },
  {
    id: 'M-006',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Physics',
    paper_id: 'PHY-02',
    paper_name: 'Physics Waves & Optics Paper 02',
    score: 66,
    grade: 'B',
    rank: 6,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Decent performance. Doppler frequency shifts need careful sign convention.',
    evaluated_at: '2026-08-24'
  },

  // BN002 (Nethmi - Top Ranker)
  {
    id: 'M-007',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Biology',
    paper_id: 'BIO-03',
    paper_name: 'Biology Unit Test 03 - Animal Physiology & Nervous System',
    score: 92,
    grade: 'A',
    rank: 1,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Outstanding! Perfect score in essay part!',
    evaluated_at: '2026-07-28'
  },
  {
    id: 'M-008',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Biology',
    paper_id: 'BIO-02',
    paper_name: 'Biology Speed Paper 02 - Plant Physiology',
    score: 88,
    grade: 'A',
    rank: 1,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Top-tier analytical reasoning.',
    evaluated_at: '2026-08-19'
  },
  {
    id: 'M-009',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Chemistry',
    paper_id: 'CHEM-03',
    paper_name: 'Chemistry Inorganic Chemistry & d-block Trends',
    score: 85,
    grade: 'A',
    rank: 1,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Superb clarity in flame test colors and precipitate analysis.',
    evaluated_at: '2026-07-30'
  },
  {
    id: 'M-010',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Chemistry',
    paper_id: 'CHEM-02',
    paper_name: 'Chemistry Organic Synthesis & Reactions Part 02',
    score: 90,
    grade: 'A',
    rank: 1,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Perfect synthesis pathways!',
    evaluated_at: '2026-08-22'
  },
  {
    id: 'M-011',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Physics',
    paper_id: 'PHY-03',
    paper_name: 'Physics Current Electricity & Magnetic Fields',
    score: 82,
    grade: 'A',
    rank: 1,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Great problem solving in electromagnetism.',
    evaluated_at: '2026-08-02'
  },
  {
    id: 'M-012',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Physics',
    paper_id: 'PHY-02',
    paper_name: 'Physics Waves & Optics Paper 02',
    score: 86,
    grade: 'A',
    rank: 1,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Excellent wave interference derivation.',
    evaluated_at: '2026-08-24'
  },

  // BN003 (Dilshan)
  {
    id: 'M-013',
    index_no: 'BN003',
    student_name: 'Dilshan Bandara',
    subject: 'Biology',
    paper_id: 'BIO-03',
    paper_name: 'Biology Unit Test 03 - Animal Physiology & Nervous System',
    score: 52,
    grade: 'S',
    rank: 12,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Keep studying resource book definitions carefully.',
    evaluated_at: '2026-07-28'
  },
  {
    id: 'M-014',
    index_no: 'BN003',
    student_name: 'Dilshan Bandara',
    subject: 'Biology',
    paper_id: 'BIO-02',
    paper_name: 'Biology Speed Paper 02 - Plant Physiology',
    score: 58,
    grade: 'C',
    rank: 9,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Good improvement from last week. Keep it up!',
    evaluated_at: '2026-08-19'
  },
  {
    id: 'M-015',
    index_no: 'Dilshan Bandara',
    index_no: 'BN003',
    student_name: 'Dilshan Bandara',
    subject: 'Chemistry',
    paper_id: 'CHEM-03',
    paper_name: 'Chemistry Inorganic Chemistry & d-block Trends',
    score: 45,
    grade: 'S',
    rank: 14,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Need to memorize cation separation flowcharts.',
    evaluated_at: '2026-07-30'
  },
  {
    id: 'M-016',
    index_no: 'BN003',
    student_name: 'Dilshan Bandara',
    subject: 'Chemistry',
    paper_id: 'CHEM-02',
    paper_name: 'Chemistry Organic Synthesis & Reactions Part 02',
    score: 52,
    grade: 'S',
    rank: 11,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Understand electrophilic addition mechanisms.',
    evaluated_at: '2026-08-22'
  },
  {
    id: 'M-017',
    index_no: 'BN003',
    student_name: 'Dilshan Bandara',
    subject: 'Physics',
    paper_id: 'PHY-03',
    paper_name: 'Physics Current Electricity & Magnetic Fields',
    score: 48,
    grade: 'S',
    rank: 13,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Practice circuit reduction and node voltage problems.',
    evaluated_at: '2026-08-02'
  },
  {
    id: 'M-018',
    index_no: 'BN003',
    student_name: 'Dilshan Bandara',
    subject: 'Physics',
    paper_id: 'PHY-02',
    paper_name: 'Physics Waves & Optics Paper 02',
    score: 54,
    grade: 'S',
    rank: 10,
    marked_paper_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    feedback: 'Progressing well. Master resonance tube calculations.',
    evaluated_at: '2026-08-24'
  }
];

export const INITIAL_SUBMISSIONS = [
  {
    id: 'SUB-101',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Biology',
    paper_id: 'BIO-01',
    paper_name: 'Biology Model Paper 01 - Cell & Genetics',
    file_name: 'Biology_Biology_Model_Paper_01_BN001.pdf',
    submitted_at: '2026-08-28 14:30',
    status: 'Pending Marking',
    file_size: '3.4 MB',
    drive_url: 'https://drive.google.com/sample_submission_BN001.pdf'
  },
  {
    id: 'SUB-102',
    index_no: 'BN002',
    student_name: 'Nethmi Silva',
    subject: 'Biology',
    paper_id: 'BIO-01',
    paper_name: 'Biology Model Paper 01 - Cell & Genetics',
    file_name: 'Biology_Biology_Model_Paper_01_BN002.pdf',
    submitted_at: '2026-08-28 16:15',
    status: 'Pending Marking',
    file_size: '4.1 MB',
    drive_url: 'https://drive.google.com/sample_submission_BN002.pdf'
  },
  {
    id: 'SUB-103',
    index_no: 'BN001',
    student_name: 'Kasun Perera',
    subject: 'Chemistry',
    paper_id: 'CHEM-01',
    paper_name: 'Chemistry Full Paper 01 - General & Physical Chemistry',
    file_name: 'Chemistry_Chemistry_Full_Paper_01_BN001.pdf',
    submitted_at: '2026-08-29 10:20',
    status: 'Pending Marking',
    file_size: '2.8 MB',
    drive_url: 'https://drive.google.com/sample_submission_chem_BN001.pdf'
  }
];

// Grade calculation helper
export const calculateGrade = (score) => {
  const num = Number(score);
  if (isNaN(num)) return 'N/A';
  if (num >= 75) return 'A';
  if (num >= 65) return 'B';
  if (num >= 55) return 'C';
  if (num >= 35) return 'S';
  return 'F';
};

export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'B':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'C':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'S':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'F':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};
