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

export const STAFF = [];

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

// ─── Empty initial state — all data entered by admin ─────────────────────────
export const INIT_CERTS       = [];
export const INIT_DOCS        = [];
export const INIT_COMP        = [];
export const INIT_COURSES     = [];
export const INIT_MEETINGS    = [];
export const INIT_STAFF_META  = [];
export const INIT_VACATIONS   = [];
export const INIT_FOLDERS     = [];

const emptyBranch = { aicu:false,picu:false,nicu:false,imicu:false,generalWards:false,pft:false,inpatientSleep:false,homeSleep:false,rehab:false };
export const INIT_COVERAGE = {
  jeddah:   { ...emptyBranch },
  riyadh:   { ...emptyBranch },
  madinah:  { ...emptyBranch },
  makkah:   { ...emptyBranch },
  aseer:    { ...emptyBranch },
  dammam:   { ...emptyBranch },
  hail:     { ...emptyBranch },
  haijamea: { ...emptyBranch },
};

const emptyWorkload = { aicu:{beds:0,vent:0},picu:{beds:0,vent:0},nicu:{beds:0,vent:0},imicu:{beds:0,vent:0},generalWards:{beds:0,vent:0} };
export const INIT_WORKLOAD = {
  jeddah:   { ...emptyWorkload },
  riyadh:   { ...emptyWorkload },
  madinah:  { ...emptyWorkload },
  makkah:   { ...emptyWorkload },
  aseer:    { ...emptyWorkload },
  dammam:   { ...emptyWorkload },
  hail:     { ...emptyWorkload },
  haijamea: { ...emptyWorkload },
};

export const INIT_LOGISTICS = {
  jeddah:   {ventilators:0,hfnc:0,transportVent:0},
  riyadh:   {ventilators:0,hfnc:0,transportVent:0},
  madinah:  {ventilators:0,hfnc:0,transportVent:0},
  makkah:   {ventilators:0,hfnc:0,transportVent:0},
  aseer:    {ventilators:0,hfnc:0,transportVent:0},
  dammam:   {ventilators:0,hfnc:0,transportVent:0},
  hail:     {ventilators:0,hfnc:0,transportVent:0},
  haijamea: {ventilators:0,hfnc:0,transportVent:0},
};
