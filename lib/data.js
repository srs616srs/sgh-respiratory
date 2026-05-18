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
  { id: 1,  name: 'Patient Assessment' },
  { id: 2,  name: 'Arterial Puncture for Blood Gas Analysis' },
  { id: 3,  name: 'Blood Gas Sampling Arterial Line' },
  { id: 4,  name: 'Chest Physiotherapy' },
  { id: 5,  name: 'Ventilator Management' },
  { id: 6,  name: 'Tracheostomy Tube Replacement' },
  { id: 7,  name: 'Suctioning of Artificial Airway' },
  { id: 8,  name: 'Mechanical Ventilation Setting Adjustments' },
  { id: 9,  name: 'Extubation of Artificial Airway' },
  { id: 10, name: 'Oral Endotracheal Intubation' },
  { id: 11, name: 'Mechanical Ventilator System Set-Up' },
  { id: 12, name: 'Non-Invasive Positive Pressure Ventilation BiPAP' },
  { id: 13, name: 'High Frequency Chest Wall Oscillation' },
  { id: 14, name: 'High Flow Humidified Oxygen' },
  { id: 15, name: 'Incentive Spirometry' },
  { id: 16, name: 'Neonatal Pediatric Patient Ventilator System Check' },
  { id: 17, name: 'Oxygen Therapy' },
];

export const AREAS_LIST = [
  { id: 'aicu',            name: 'AICU',                    icon: '🏥' },
  { id: 'picu',            name: 'PICU',                    icon: '👶' },
  { id: 'nicu',            name: 'NICU',                    icon: '🍼' },
  { id: 'sicu',            name: 'SICU',                    icon: '🫀' },
  { id: 'imcu',            name: 'IMCU',                    icon: '🛏️' },
  { id: 'ccu',             name: 'CCU',                     icon: '❤️' },
  { id: 'ltc',             name: 'LTC',                     icon: '🏡' },
  { id: 'er',              name: 'ER',                      icon: '🚨' },
  { id: 'pft',             name: 'PFT',                     icon: '🫁' },
  { id: 'inpatientSleep',  name: 'In-patient Sleep Tests',  icon: '😴' },
  { id: 'homeSleep',       name: 'Home-based Sleep Test',   icon: '🏠' },
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
export const INIT_SCHEDULES   = {};   // { branchId: { zones: ['Z1','Z2',...], staff: { staffId: { zone:'Z1', days:['D','N','O',...] } } } }
export const INIT_TRAINING_REQUESTS = [];  // { id, staffId, branchId, text, status:'pending'|'read', createdAt }
export const INIT_DOC_ACKS    = [];   // { docId, staffId }
export const INIT_LOGISTICS_TYPES = [
  { id: 'ventilators',   label: 'Ventilators',          icon: '🫀', sub: 'Mechanical ventilators (invasive)' },
  { id: 'hfnc',          label: 'HFNC Devices',         icon: '💨', sub: 'High-Flow Nasal Cannula units' },
  { id: 'transportVent', label: 'Transport Ventilators', icon: '🚑', sub: 'Portable / transport ventilators' },
];

const emptyBranch = { aicu:false,picu:false,nicu:false,sicu:false,imcu:false,ccu:false,ltc:false,er:false,pft:false,inpatientSleep:false,homeSleep:false };
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

const emptyWorkload = { aicu:{beds:0,vent:0},picu:{beds:0,vent:0},nicu:{beds:0,vent:0},sicu:{beds:0,vent:0},imcu:{beds:0,vent:0},ccu:{beds:0,vent:0},ltc:{beds:0,vent:0},er:{beds:0,vent:0} };
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
