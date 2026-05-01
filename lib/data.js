'use client';

export const BRANCHES = [
  { id: 'jeddah',   name: 'Jeddah',      full: 'SGH Jeddah',      city: 'Jeddah',         short: 'JED', color: '#0096b4', isHQ: true },
  { id: 'riyadh',   name: 'Riyadh',      full: 'SGH Riyadh',      city: 'Riyadh',         short: 'RIY', color: '#059669' },
  { id: 'madinah',  name: 'Madinah',     full: 'SGH Madinah',     city: 'Madinah',        short: 'MAD', color: '#7c3aed' },
  { id: 'makkah',   name: 'Makkah',      full: 'SGH Makkah',      city: 'Makkah',         short: 'MKH', color: '#0d9488' },
  { id: 'aseer',    name: 'Aseer',       full: 'SGH Aseer',       city: 'Khamis Mushait', short: 'ASR', color: '#d97706' },
  { id: 'dammam',   name: 'Dammam',      full: 'SGH Dammam',      city: 'Dammam',         short: 'DAM', color: '#ea580c' },
  { id: 'hail',     name: 'Hail',        full: 'SGH Hail',        city: 'Hail',           short: 'HAI', color: '#db2777' },
  { id: 'haijamea', name: 'Hai Aljamea', full: 'SGH Hai Aljamea', city: 'Jeddah',         short: 'HAJ', color: '#6366f1' },
];

export const STAFF = [
  { id: 1,  name: 'Sultan Alshehri',      email: 'sultanalshehri@sghgroup.net',  role: 'Network Director',  avatar: 'SA', isHOD: true, branchId: 'jeddah'   },
  { id: 2,  name: 'Ahmad Al-Zahrani',     email: 'ahmad.zahrani@sghgroup.net',   role: 'Senior RT',         avatar: 'AZ',              branchId: 'jeddah'   },
  { id: 3,  name: 'Sara Al-Ghamdi',       email: 'sara.ghamdi@sghgroup.net',     role: 'RT Specialist',     avatar: 'SG',              branchId: 'jeddah'   },
  { id: 4,  name: 'Faisal Al-Otaibi',     email: 'faisal.otaibi@sghgroup.net',   role: 'RT',                avatar: 'FO',              branchId: 'jeddah'   },
  { id: 5,  name: 'Nora Al-Shehri',       email: 'nora.shehri@sghgroup.net',     role: 'RT',                avatar: 'NS',              branchId: 'jeddah'   },
  { id: 6,  name: 'Khalid Al-Dosari',     email: 'khalid.dosari@sghgroup.net',   role: 'Branch RT Lead',    avatar: 'KD',              branchId: 'riyadh'   },
  { id: 7,  name: 'Lama Al-Qahtani',      email: 'lama.qahtani@sghgroup.net',    role: 'Senior RT',         avatar: 'LQ',              branchId: 'riyadh'   },
  { id: 8,  name: 'Turki Al-Anazi',       email: 'turki.anazi@sghgroup.net',     role: 'RT',                avatar: 'TA',              branchId: 'riyadh'   },
  { id: 9,  name: 'Reem Al-Mutairi',      email: 'reem.mutairi@sghgroup.net',    role: 'RT',                avatar: 'RM',              branchId: 'riyadh'   },
  { id: 10, name: 'Omar Al-Harthy',       email: 'omar.harthy@sghgroup.net',     role: 'Branch RT Lead',    avatar: 'OH',              branchId: 'madinah'  },
  { id: 11, name: 'Hasan Al-Madani',      email: 'hasan.madani@sghgroup.net',    role: 'Senior RT',         avatar: 'HM',              branchId: 'madinah'  },
  { id: 12, name: 'Dina Al-Anzi',         email: 'dina.anzi@sghgroup.net',       role: 'RT',                avatar: 'DA',              branchId: 'madinah'  },
  { id: 13, name: 'Mohammed Al-Shahrani', email: 'm.shahrani@sghgroup.net',      role: 'Branch RT Lead',    avatar: 'MS',              branchId: 'aseer'    },
  { id: 14, name: 'Areej Al-Ghamdi',      email: 'areej.ghamdi@sghgroup.net',    role: 'RT Specialist',     avatar: 'AG',              branchId: 'aseer'    },
  { id: 15, name: 'Saleh Al-Qahtani',     email: 'saleh.qahtani@sghgroup.net',   role: 'RT',                avatar: 'SQ',              branchId: 'aseer'    },
  { id: 16, name: 'Ibrahim Al-Otaibi',    email: 'ibrahim.otaibi@sghgroup.net',  role: 'Branch RT Lead',    avatar: 'IO',              branchId: 'dammam'   },
  { id: 17, name: 'Wafa Al-Harbi',        email: 'wafa.harbi@sghgroup.net',      role: 'Senior RT',         avatar: 'WH',              branchId: 'dammam'   },
  { id: 18, name: 'Majed Al-Juaid',       email: 'majed.juaid@sghgroup.net',     role: 'RT',                avatar: 'MJ',              branchId: 'dammam'   },
  { id: 19, name: 'Abdullah Al-Rashidi',  email: 'a.rashidi@sghgroup.net',       role: 'Branch RT Lead',    avatar: 'AR',              branchId: 'hail'     },
  { id: 20, name: 'Hala Al-Shammari',     email: 'hala.shammari@sghgroup.net',   role: 'Senior RT',         avatar: 'HS',              branchId: 'hail'     },
  { id: 21, name: 'Nawaf Al-Enezi',       email: 'nawaf.enezi@sghgroup.net',     role: 'RT',                avatar: 'NE',              branchId: 'hail'     },
  { id: 22, name: 'Yasser Al-Ghamdi',     email: 'yasser.ghamdi@sghgroup.net',   role: 'Branch RT Lead',    avatar: 'YG',              branchId: 'makkah'   },
  { id: 23, name: 'Rana Al-Zahrani',      email: 'rana.zahrani@sghgroup.net',    role: 'Senior RT',         avatar: 'RZ',              branchId: 'makkah'   },
  { id: 24, name: 'Saad Al-Maliki',       email: 'saad.maliki@sghgroup.net',     role: 'RT',                avatar: 'SM',              branchId: 'makkah'   },
  { id: 25, name: 'Bader Al-Harbi',       email: 'bader.harbi@sghgroup.net',     role: 'Branch RT Lead',    avatar: 'BH',              branchId: 'haijamea' },
  { id: 26, name: 'Mona Al-Qahtani',      email: 'mona.qahtani@sghgroup.net',    role: 'Senior RT',         avatar: 'MQ',              branchId: 'haijamea' },
  { id: 27, name: 'Ziad Al-Shehri',       email: 'ziad.shehri@sghgroup.net',     role: 'RT',                avatar: 'ZS',              branchId: 'haijamea' },
];

export const COMPETENCIES = [
  { id: 1, name: 'Mechanical Ventilation – Adult' },
  { id: 2, name: 'HFNC Therapy' },
  { id: 3, name: 'Non-Invasive Ventilation (NIV)' },
  { id: 4, name: 'ABG Interpretation' },
  { id: 5, name: 'Aerosol Therapy & MDI' },
  { id: 6, name: 'Chest Physiotherapy' },
  { id: 7, name: 'Ventilator Weaning Protocol' },
];

export const AREAS_LIST = [
  { id: 'aicu',          name: 'Adult ICU (AICU)',         icon: '🏥' },
  { id: 'picu',          name: 'Pediatric ICU (PICU)',     icon: '👶' },
  { id: 'nicu',          name: 'NICU',                     icon: '🍼' },
  { id: 'imicu',         name: 'Intermediate ICU (IMICU)', icon: '🛏️' },
  { id: 'generalWards',  name: 'General Wards',            icon: '🏨' },
  { id: 'pft',           name: 'PFT Lab',                  icon: '🫁' },
  { id: 'inpatientSleep',name: 'Inpatient Sleep Study',    icon: '😴' },
  { id: 'homeSleep',     name: 'Home Sleep Study',         icon: '🏠' },
  { id: 'rehab',         name: 'Rehabilitation Programs',  icon: '🔄' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const d = (days) => { const t = new Date(); t.setDate(t.getDate() + days); return t.toISOString().split('T')[0]; };

export const daysUntil = (s) => Math.ceil((new Date(s) - new Date()) / 86400000);
export const certStatus = (exp) => { const n = daysUntil(exp); return n < 0 ? 'expired' : n <= 90 ? 'expiring' : 'valid'; };
export const getBranch = (id) => BRANCHES.find(b => b.id === id);
export const getStaff  = (id) => STAFF.find(s => s.id === id);
export const staffOf   = (bid) => bid === 'all' ? STAFF.filter(s => !s.isHOD) : STAFF.filter(s => s.branchId === bid && !s.isHOD);
export const fmt = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const getCurrentShift = () => { const h = new Date().getHours(); if (h >= 7 && h < 15) return 'Morning'; if (h >= 15 && h < 23) return 'Evening'; return 'Night'; };

const SHIFT_PAT = [['M','M','E','E','N','N','O','O'],['E','E','N','N','O','O','M','M'],['N','N','O','O','M','M','E','E'],['O','M','M','E','E','N','O','O']];
const SCHED_DAYS = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
export const genSched = (staffId) => Array.from({ length: SCHED_DAYS }, (_, i) => SHIFT_PAT[staffId % 4][(i + staffId * 2) % 8]);
export const SCHED_MONTH_NAME = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });
export const SCHED_DAYS_COUNT = SCHED_DAYS;

// ─── Seed data ────────────────────────────────────────────────────────────────
const mk = (sid, pat) => COMPETENCIES.map((c, i) => ({ staffId: sid, compId: c.id, status: pat[i % pat.length], date: pat[i % pat.length] === 'completed' ? d(-(i * 40 + 30)) : undefined }));

export const INIT_CERTS = [
  { id:1,staffId:2,type:'BLS',expiryDate:d(400)},{id:2,staffId:3,type:'BLS',expiryDate:d(55)},
  {id:3,staffId:4,type:'BLS',expiryDate:d(-20)},{id:4,staffId:5,type:'BLS',expiryDate:d(300)},
  {id:5,staffId:2,type:'ACLS',expiryDate:d(42)},{id:6,staffId:3,type:'ACLS',expiryDate:d(380)},
  {id:7,staffId:2,type:'PALS',expiryDate:d(250)},{id:8,staffId:5,type:'PALS',expiryDate:d(68)},
  {id:9,staffId:3,type:'NRP',expiryDate:d(600)},
  {id:10,staffId:6,type:'BLS',expiryDate:d(78)},{id:11,staffId:7,type:'BLS',expiryDate:d(500)},
  {id:12,staffId:8,type:'BLS',expiryDate:d(200)},{id:13,staffId:9,type:'BLS',expiryDate:d(-35)},
  {id:14,staffId:6,type:'ACLS',expiryDate:d(-10)},{id:15,staffId:7,type:'ACLS',expiryDate:d(310)},
  {id:16,staffId:8,type:'PALS',expiryDate:d(650)},
  {id:17,staffId:10,type:'BLS',expiryDate:d(320)},{id:18,staffId:11,type:'BLS',expiryDate:d(85)},
  {id:19,staffId:12,type:'BLS',expiryDate:d(-45)},{id:20,staffId:10,type:'ACLS',expiryDate:d(410)},
  {id:21,staffId:11,type:'NRP',expiryDate:d(590)},
  {id:22,staffId:13,type:'BLS',expiryDate:d(275)},{id:23,staffId:14,type:'BLS',expiryDate:d(72)},
  {id:24,staffId:15,type:'BLS',expiryDate:d(-60)},{id:25,staffId:13,type:'ACLS',expiryDate:d(365)},
  {id:26,staffId:14,type:'PALS',expiryDate:d(630)},
  {id:27,staffId:16,type:'BLS',expiryDate:d(480)},{id:28,staffId:17,type:'BLS',expiryDate:d(62)},
  {id:29,staffId:18,type:'BLS',expiryDate:d(700)},{id:30,staffId:16,type:'ACLS',expiryDate:d(340)},
  {id:31,staffId:17,type:'NRP',expiryDate:d(-5)},
  {id:32,staffId:19,type:'BLS',expiryDate:d(180)},{id:33,staffId:20,type:'BLS',expiryDate:d(48)},
  {id:34,staffId:21,type:'BLS',expiryDate:d(-90)},{id:35,staffId:19,type:'ACLS',expiryDate:d(420)},
  {id:36,staffId:20,type:'PALS',expiryDate:d(560)},
  {id:37,staffId:22,type:'BLS',expiryDate:d(310)},{id:38,staffId:23,type:'BLS',expiryDate:d(66)},
  {id:39,staffId:24,type:'BLS',expiryDate:d(-15)},{id:40,staffId:22,type:'ACLS',expiryDate:d(390)},
  {id:41,staffId:23,type:'PALS',expiryDate:d(520)},{id:42,staffId:22,type:'NRP',expiryDate:d(280)},
  {id:43,staffId:25,type:'BLS',expiryDate:d(240)},{id:44,staffId:26,type:'BLS',expiryDate:d(70)},
  {id:45,staffId:27,type:'BLS',expiryDate:d(-30)},{id:46,staffId:25,type:'ACLS',expiryDate:d(360)},
  {id:47,staffId:26,type:'PALS',expiryDate:d(480)},
];

export const INIT_DOCS = [
  {id:1,name:'ICU Ventilator Management Policy',        category:'Policy',   date:'2025-01-10',size:'1.8 MB',icon:'📋',branchId:'all',fileUrl:null},
  {id:2,name:'HFNC Protocol – Respiratory Failure',     category:'Protocol', date:'2025-02-15',size:'2.1 MB',icon:'📄',branchId:'all',fileUrl:null},
  {id:3,name:'Aerosol Therapy SOP',                     category:'SOP',      date:'2024-11-20',size:'890 KB',icon:'📋',branchId:'all',fileUrl:null},
  {id:4,name:'Staff Leave Request Form',                category:'Form',     date:'2024-08-05',size:'120 KB',icon:'📝',branchId:'all',fileUrl:null},
  {id:5,name:'Incident Reporting Form',                 category:'Form',     date:'2024-09-18',size:'145 KB',icon:'📝',branchId:'all',fileUrl:null},
  {id:6,name:'NIV Patient Assessment Checklist',        category:'Checklist',date:'2025-03-01',size:'340 KB',icon:'✅',branchId:'all',fileUrl:null},
  {id:7,name:'Pulmonary Rehabilitation Guidelines',     category:'Guideline',date:'2024-12-10',size:'3.2 MB',icon:'📘',branchId:'all',fileUrl:null},
  {id:8,name:'Equipment Cleaning & Disinfection SOP',   category:'SOP',      date:'2025-01-25',size:'760 KB',icon:'📋',branchId:'all',fileUrl:null},
  {id:9,name:'Jeddah ICU Bed Allocation Protocol',      category:'Protocol', date:'2025-02-01',size:'420 KB',icon:'📄',branchId:'jeddah',fileUrl:null},
  {id:10,name:'Riyadh RT Shift Handover Checklist',     category:'Checklist',date:'2025-01-15',size:'210 KB',icon:'✅',branchId:'riyadh',fileUrl:null},
  {id:11,name:'Madinah Seasonal Asthma SOP',            category:'SOP',      date:'2024-10-01',size:'580 KB',icon:'📋',branchId:'madinah',fileUrl:null},
  {id:12,name:'Aseer Altitude Adjustment Guidelines',   category:'Guideline',date:'2025-03-10',size:'910 KB',icon:'📘',branchId:'aseer',fileUrl:null},
  {id:13,name:'Dammam Industrial Inhalation Protocol',  category:'Protocol', date:'2024-12-20',size:'750 KB',icon:'📄',branchId:'dammam',fileUrl:null},
  {id:14,name:'Hail Branch Quality Audit Form',         category:'Form',     date:'2025-02-28',size:'190 KB',icon:'📝',branchId:'hail',fileUrl:null},
  {id:15,name:'Makkah Hajj Mass Casualty RT Protocol',  category:'Protocol', date:'2025-01-20',size:'1.1 MB',icon:'📄',branchId:'makkah',fileUrl:null},
  {id:16,name:'Hai Aljamea Clinical Protocols 2025',    category:'Protocol', date:'2025-04-01',size:'890 KB',icon:'📄',branchId:'haijamea',fileUrl:null},
];

export const INIT_COMP = [
  {staffId:2,compId:1,status:'completed',date:'2024-10-01'},{staffId:2,compId:2,status:'completed',date:'2024-10-15'},
  {staffId:2,compId:3,status:'completed',date:'2024-11-01'},{staffId:2,compId:4,status:'completed',date:'2024-09-20'},
  {staffId:2,compId:5,status:'pending'},{staffId:2,compId:6,status:'due'},{staffId:2,compId:7,status:'completed',date:'2025-01-10'},
  {staffId:3,compId:1,status:'completed',date:'2025-01-05'},{staffId:3,compId:2,status:'completed',date:'2025-01-20'},
  {staffId:3,compId:3,status:'due'},{staffId:3,compId:4,status:'completed',date:'2024-12-01'},
  {staffId:3,compId:5,status:'completed',date:'2025-02-10'},{staffId:3,compId:6,status:'pending'},{staffId:3,compId:7,status:'pending'},
  {staffId:4,compId:1,status:'due'},{staffId:4,compId:2,status:'pending'},{staffId:4,compId:3,status:'pending'},
  {staffId:4,compId:4,status:'completed',date:'2024-11-15'},{staffId:4,compId:5,status:'completed',date:'2024-12-20'},
  {staffId:4,compId:6,status:'due'},{staffId:4,compId:7,status:'pending'},
  {staffId:5,compId:1,status:'completed',date:'2025-02-01'},{staffId:5,compId:2,status:'completed',date:'2025-02-15'},
  {staffId:5,compId:3,status:'completed',date:'2025-03-01'},{staffId:5,compId:4,status:'completed',date:'2025-01-10'},
  {staffId:5,compId:5,status:'pending'},{staffId:5,compId:6,status:'completed',date:'2024-10-05'},{staffId:5,compId:7,status:'due'},
  ...mk(6,['completed','completed','completed','completed','pending','due','completed']),
  ...mk(7,['completed','completed','pending','completed','completed','pending','pending']),
  ...mk(8,['completed','pending','due','completed','pending','pending','pending']),
  ...mk(9,['pending','pending','due','pending','pending','due','pending']),
  ...mk(10,['completed','completed','completed','completed','completed','pending','completed']),
  ...mk(11,['completed','completed','pending','completed','due','pending','pending']),
  ...mk(12,['due','pending','pending','completed','pending','pending','due']),
  ...mk(13,['completed','completed','completed','pending','completed','completed','pending']),
  ...mk(14,['completed','pending','completed','completed','pending','due','pending']),
  ...mk(15,['pending','due','pending','pending','completed','pending','due']),
  ...mk(16,['completed','completed','completed','completed','completed','completed','completed']),
  ...mk(17,['completed','completed','completed','completed','pending','completed','pending']),
  ...mk(18,['completed','pending','due','completed','pending','pending','pending']),
  ...mk(19,['completed','completed','pending','completed','completed','pending','completed']),
  ...mk(20,['pending','completed','completed','pending','due','completed','pending']),
  ...mk(21,['due','pending','pending','completed','pending','due','pending']),
  ...mk(22,['completed','completed','completed','completed','completed','pending','completed']),
  ...mk(23,['completed','pending','completed','completed','pending','completed','pending']),
  ...mk(24,['due','pending','pending','completed','pending','pending','due']),
  ...mk(25,['completed','completed','pending','completed','completed','pending','completed']),
  ...mk(26,['completed','pending','completed','pending','due','completed','pending']),
  ...mk(27,['pending','due','pending','completed','pending','pending','due']),
];

export const INIT_COURSES = [
  {id:1,name:'Mechanical Ventilation Masterclass',      instructor:'Dr. Wail Tashkandi',   duration:'4h 30m',modules:8,uploaded:'2025-01-15',attendance:[2,3,5,6,7,10,13,16,19,22,25],thumb:'🫁',branchId:'all'},
  {id:2,name:'HFNC & NIV – Evidence-Based Practice',   instructor:'Sultan Alshehri',      duration:'2h 15m',modules:5,uploaded:'2025-02-10',attendance:[2,4,6,8,11,14,17,20,23,26],thumb:'💨',branchId:'all'},
  {id:3,name:'Infection Control in Respiratory Care',  instructor:'Infection Control Team',duration:'1h 45m',modules:4,uploaded:'2025-03-01',attendance:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,25,26],thumb:'🧤',branchId:'all'},
  {id:4,name:'ABG Interpretation Workshop',            instructor:'Sultan Alshehri',      duration:'3h 00m',modules:6,uploaded:'2025-03-20',attendance:[3,5,7,11,14,17,23,26],thumb:'🩸',branchId:'all'},
  {id:5,name:'Jeddah HFNC Competency Refresh',         instructor:'Ahmad Al-Zahrani',     duration:'1h 00m',modules:2,uploaded:'2025-04-01',attendance:[2,3,4,5],              thumb:'🌬️',branchId:'jeddah'},
  {id:6,name:'Riyadh Paediatric Ventilation Update',   instructor:'Khalid Al-Dosari',     duration:'2h 00m',modules:4,uploaded:'2025-02-20',attendance:[6,7,8,9],              thumb:'👶',branchId:'riyadh'},
  {id:7,name:'Madinah Hajj Season Respiratory Prep',   instructor:'Omar Al-Harthy',       duration:'1h 30m',modules:3,uploaded:'2025-03-05',attendance:[10,11,12],             thumb:'🕌',branchId:'madinah'},
  {id:8,name:'Dammam Occupational Lung Disease SOP',   instructor:'Ibrahim Al-Otaibi',    duration:'1h 15m',modules:3,uploaded:'2025-03-15',attendance:[16,17,18],             thumb:'🏭',branchId:'dammam'},
  {id:9,name:'Makkah Hajj Mass Casualty RT',           instructor:'Yasser Al-Ghamdi',     duration:'2h 00m',modules:4,uploaded:'2025-02-25',attendance:[22,23,24],             thumb:'🕋',branchId:'makkah'},
  {id:10,name:'Hai Aljamea Orientation & Protocols',   instructor:'Bader Al-Harbi',       duration:'1h 30m',modules:3,uploaded:'2025-04-10',attendance:[25,26],                thumb:'🎯',branchId:'haijamea'},
];

export const INIT_MEETINGS = [
  {id:1,title:'Network Monthly Meeting – March 2025',date:'2025-03-15',time:'09:00 AM',attendees:[2,3,6,7,10,13,16,19,22,25],branchId:'all',signatures:[2,6,10,22],
   mom:`MINUTES OF MEETING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDepartment : Respiratory Services – SGH Network (All 8 Branches)\nDate       : 15 March 2025  |  Time: 09:00 AM\nChaired by : Sultan Alshehri, Network Director of Respiratory Services\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. ATTENDANCE\nJeddah: Ahmad Al-Zahrani · Sara Al-Ghamdi\nRiyadh: Khalid Al-Dosari · Lama Al-Qahtani\nMadinah: Omar Al-Harthy\nMakkah: Yasser Al-Ghamdi\nAseer: Mohammed Al-Shahrani\nDammam: Ibrahim Al-Otaibi\nHail: Abdullah Al-Rashidi\nHai Aljamea: Bader Al-Harbi\n\n2. AGENDA & DISCUSSION\n2.1  Home Sleep Study Pilot – Network Rollout\n2.2  Certificate Compliance – 7 expired across network.\n2.3  Hai Aljamea branch onboarding update.\n\n3. ACTION ITEMS\nRenew expired certificates | Branch Leads | 30 Mar 2025\nComplete coverage mapping  | All Branches | 31 Mar 2025\nHai Aljamea staff enrollment | Bader H. | 15 Apr 2025\n\n4. NEXT MEETING: 12 April 2025 · 09:00 AM\nMinutes recorded by: Sultan Alshehri`},
  {id:2,title:'Jeddah Department Meeting – March 2025',date:'2025-03-20',time:'10:00 AM',attendees:[2,3,4,5],branchId:'jeddah',signatures:[2,3],
   mom:`MINUTES OF MEETING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBranch     : SGH Jeddah\nDate       : 20 March 2025  |  Time: 10:00 AM\nChaired by : Sultan Alshehri\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. ATTENDANCE: Ahmad Al-Zahrani · Sara Al-Ghamdi · Faisal Al-Otaibi · Nora Al-Shehri\n\n2. DISCUSSION\n2.1  ICU storeroom inspection – 3 zones non-compliant.\n2.2  BLS renewals for Ahmad (42d) and Nora (68d) – urgent.\n\nMinutes recorded by: Sultan Alshehri`},
];

export const INIT_STAFF_META = [
  {staffId:2, sghId:'SGH-JED-001',contractStart:'2022-03-01',contractEnd:d(85), resp:{admin:false,logistics:true, education:false},onDuty:true},
  {staffId:3, sghId:'SGH-JED-002',contractStart:'2023-06-01',contractEnd:d(400),resp:{admin:false,logistics:false,education:true}, onDuty:true},
  {staffId:4, sghId:'SGH-JED-003',contractStart:'2021-09-01',contractEnd:d(55), resp:{admin:true, logistics:false,education:false},onDuty:false},
  {staffId:5, sghId:'SGH-JED-004',contractStart:'2024-01-01',contractEnd:d(550),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:6, sghId:'SGH-RIY-001',contractStart:'2022-07-01',contractEnd:d(200),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:7, sghId:'SGH-RIY-002',contractStart:'2023-03-01',contractEnd:d(380),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:8, sghId:'SGH-RIY-003',contractStart:'2023-11-01',contractEnd:d(75), resp:{admin:false,logistics:true, education:false},onDuty:false},
  {staffId:9, sghId:'SGH-RIY-004',contractStart:'2024-05-01',contractEnd:d(600),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:10,sghId:'SGH-MAD-001',contractStart:'2021-12-01',contractEnd:d(300),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:11,sghId:'SGH-MAD-002',contractStart:'2023-08-01',contractEnd:d(450),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:12,sghId:'SGH-MAD-003',contractStart:'2024-02-01',contractEnd:d(50), resp:{admin:false,logistics:false,education:false},onDuty:false},
  {staffId:13,sghId:'SGH-ASR-001',contractStart:'2022-05-01',contractEnd:d(340),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:14,sghId:'SGH-ASR-002',contractStart:'2023-10-01',contractEnd:d(500),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:15,sghId:'SGH-ASR-003',contractStart:'2024-04-01',contractEnd:d(65), resp:{admin:false,logistics:false,education:false},onDuty:false},
  {staffId:16,sghId:'SGH-DAM-001',contractStart:'2022-09-01',contractEnd:d(420),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:17,sghId:'SGH-DAM-002',contractStart:'2023-12-01',contractEnd:d(380),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:18,sghId:'SGH-DAM-003',contractStart:'2024-06-01',contractEnd:d(80), resp:{admin:false,logistics:true, education:false},onDuty:false},
  {staffId:19,sghId:'SGH-HAI-001',contractStart:'2023-01-01',contractEnd:d(260),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:20,sghId:'SGH-HAI-002',contractStart:'2024-03-01',contractEnd:d(440),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:21,sghId:'SGH-HAI-003',contractStart:'2024-07-01',contractEnd:d(88), resp:{admin:false,logistics:false,education:false},onDuty:false},
  {staffId:22,sghId:'SGH-MKH-001',contractStart:'2022-11-01',contractEnd:d(310),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:23,sghId:'SGH-MKH-002',contractStart:'2023-07-01',contractEnd:d(470),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:24,sghId:'SGH-MKH-003',contractStart:'2024-08-01',contractEnd:d(45), resp:{admin:false,logistics:false,education:false},onDuty:false},
  {staffId:25,sghId:'SGH-HAJ-001',contractStart:'2025-01-01',contractEnd:d(350),resp:{admin:true, logistics:true, education:true}, onDuty:true},
  {staffId:26,sghId:'SGH-HAJ-002',contractStart:'2025-01-15',contractEnd:d(410),resp:{admin:false,logistics:false,education:false},onDuty:true},
  {staffId:27,sghId:'SGH-HAJ-003',contractStart:'2025-02-01',contractEnd:d(70), resp:{admin:false,logistics:true, education:false},onDuty:false},
];

export const INIT_VACATIONS = [
  {id:1,staffId:3, start:'2026-05-01',end:'2026-05-14',status:'approved',type:'Annual',   days:14},
  {id:2,staffId:7, start:'2026-04-25',end:'2026-05-05',status:'approved',type:'Annual',   days:11},
  {id:3,staffId:11,start:'2026-06-01',end:'2026-06-10',status:'pending', type:'Annual',   days:10},
  {id:4,staffId:5, start:'2026-05-15',end:'2026-05-21',status:'approved',type:'Emergency',days:7},
  {id:5,staffId:14,start:'2026-07-01',end:'2026-07-15',status:'pending', type:'Annual',   days:15},
  {id:6,staffId:17,start:'2026-05-10',end:'2026-05-17',status:'approved',type:'Annual',   days:8},
  {id:7,staffId:23,start:'2026-05-05',end:'2026-05-12',status:'approved',type:'Emergency',days:8},
  {id:8,staffId:26,start:'2026-05-20',end:'2026-05-30',status:'pending', type:'Annual',   days:11},
];

export const INIT_FOLDERS = [
  {id:1,staffId:4, date:'2025-12-10',type:'Warning',     note:'Late arrival without prior notification. First formal warning issued per HR policy.',severity:'medium'},
  {id:2,staffId:8, date:'2025-11-22',type:'Negligence',  note:'Failed to complete mandatory daily equipment check.',severity:'high'},
  {id:3,staffId:9, date:'2026-01-15',type:'Delay',       note:'Delayed ICU response by 25 minutes. Root cause: unclear handover.',severity:'low'},
  {id:4,staffId:2, date:'2025-10-05',type:'Commendation',note:'Exceptional leadership during mass casualty simulation. Commended by Medical Director.',severity:'positive'},
  {id:5,staffId:12,date:'2026-02-01',type:'Warning',     note:'Missed mandatory BLS renewal training session without valid excuse.',severity:'medium'},
  {id:6,staffId:21,date:'2026-03-10',type:'Negligence',  note:'Equipment returned unclean post-procedure. Patient safety concern raised.',severity:'high'},
  {id:7,staffId:6, date:'2025-11-30',type:'Commendation',note:'Led successful CBAHI preparation for Riyadh branch. Audit passed with distinction.',severity:'positive'},
  {id:8,staffId:15,date:'2025-09-18',type:'Delay',       note:'Report submission 3 days overdue. Verbal warning issued.',severity:'low'},
];

export const INIT_COVERAGE = {
  jeddah:  {aicu:true, picu:true, nicu:true, imicu:true, generalWards:true,pft:true, inpatientSleep:true, homeSleep:true, rehab:true},
  riyadh:  {aicu:true, picu:true, nicu:false,imicu:true, generalWards:true,pft:true, inpatientSleep:false,homeSleep:false,rehab:false},
  madinah: {aicu:true, picu:false,nicu:false,imicu:true, generalWards:true,pft:false,inpatientSleep:false,homeSleep:true, rehab:false},
  makkah:  {aicu:true, picu:true, nicu:true, imicu:true, generalWards:true,pft:false,inpatientSleep:true, homeSleep:false,rehab:false},
  aseer:   {aicu:true, picu:false,nicu:false,imicu:false,generalWards:true,pft:false,inpatientSleep:false,homeSleep:false,rehab:false},
  dammam:  {aicu:true, picu:true, nicu:false,imicu:true, generalWards:true,pft:true, inpatientSleep:false,homeSleep:true, rehab:false},
  hail:    {aicu:true, picu:false,nicu:false,imicu:false,generalWards:true,pft:false,inpatientSleep:false,homeSleep:false,rehab:false},
  haijamea:{aicu:true, picu:true, nicu:false,imicu:true, generalWards:true,pft:false,inpatientSleep:false,homeSleep:false,rehab:false},
};

export const INIT_WORKLOAD = {
  jeddah:  {aicu:{beds:12,vent:9},picu:{beds:8,vent:5},nicu:{beds:10,vent:6},imicu:{beds:16,vent:4},generalWards:{beds:40,vent:2}},
  riyadh:  {aicu:{beds:10,vent:7},picu:{beds:6,vent:3},nicu:{beds:0,vent:0}, imicu:{beds:12,vent:3},generalWards:{beds:32,vent:1}},
  madinah: {aicu:{beds:8,vent:5}, picu:{beds:0,vent:0},nicu:{beds:0,vent:0}, imicu:{beds:10,vent:2},generalWards:{beds:28,vent:1}},
  makkah:  {aicu:{beds:14,vent:10},picu:{beds:8,vent:4},nicu:{beds:8,vent:4},imicu:{beds:18,vent:5},generalWards:{beds:45,vent:3}},
  aseer:   {aicu:{beds:6,vent:4}, picu:{beds:0,vent:0},nicu:{beds:0,vent:0}, imicu:{beds:0,vent:0}, generalWards:{beds:20,vent:1}},
  dammam:  {aicu:{beds:10,vent:7},picu:{beds:6,vent:3},nicu:{beds:0,vent:0}, imicu:{beds:12,vent:3},generalWards:{beds:30,vent:2}},
  hail:    {aicu:{beds:5,vent:3}, picu:{beds:0,vent:0},nicu:{beds:0,vent:0}, imicu:{beds:0,vent:0}, generalWards:{beds:15,vent:1}},
  haijamea:{aicu:{beds:8,vent:5}, picu:{beds:6,vent:3},nicu:{beds:0,vent:0}, imicu:{beds:10,vent:2},generalWards:{beds:25,vent:1}},
};

export const INIT_LOGISTICS = {
  jeddah:  {ventilators:18,hfnc:12,transportVent:3},
  riyadh:  {ventilators:14,hfnc:8, transportVent:2},
  madinah: {ventilators:10,hfnc:6, transportVent:2},
  makkah:  {ventilators:16,hfnc:10,transportVent:3},
  aseer:   {ventilators:8, hfnc:4, transportVent:1},
  dammam:  {ventilators:12,hfnc:7, transportVent:2},
  hail:    {ventilators:6, hfnc:3, transportVent:1},
  haijamea:{ventilators:11,hfnc:6, transportVent:2},
};
