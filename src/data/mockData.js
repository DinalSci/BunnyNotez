// Bunny Notes - Default Initial Setup

// Empty initial students by default (starts clean)
export const INITIAL_STUDENTS = [];

// Default System Accounts: 1 Owner (Super Admin) and Subject Admins
export const INITIAL_ADMINS = [
  {
    admin_id: 'OWN001',
    name: 'Bunny Notes Owner',
    email: 'owner@bunnynotes.com',
    password: 'owner123',
    role: 'owner',
    subject: 'All'
  },
];

export const INITIAL_PAPERS = [];
export const INITIAL_MARKS = [];
export const INITIAL_SUBMISSIONS = [];

// Grade calculation helper (Sri Lankan A/L Standard with C = 50+)
export const calculateGrade = (score) => {
  const num = Number(score);
  if (isNaN(num) || score === '' || score === null) return 'N/A';
  if (num >= 75) return 'A';
  if (num >= 65) return 'B';
  if (num >= 50) return 'C'; // Updated: C pass is 50+
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
