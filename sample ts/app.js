// app.js - Student + Admin PWA timetable scheduler

// ---------------- CONFIG (timetable extracted from your image) ----------------
// TIMES (columns)
const TIMES = ["08:00","09:00","10:00","10:30","11:30","12:30","13:30","14:30","15:30"];
// DAYS (rows)
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat"];

// Default faculty map and timetable captured from your uploaded image
const DEFAULT_FACULTY = {
  "SE&PM":"Mrs. Shilpa K C",
  "CN":"Mrs. Poornima B P & Mrs. Shilpa K",
  "TC":"Mrs. Tejaswini N D",
  "DV Lab(B1)/CN Lab(B2)":"Mrs. Akhila C V & Mrs. Swetha",
  "DV Lab(B2)/CN Lab(B1)":"Mrs. Akhila C V & Mrs. Swetha",
  "CV":"Dr. Likewin V",
  "RM&IPR":"Mrs. Afshan Mohammadi",
  "EVS":"New Faculty",
  "NSS":"Mrs. Tejaswini N D",
  "Mini Project":"All Faculty",
  "Library":"Library",
  "Mentoring":"Mentoring",
  "Remedial":"Remedial",
  "Forum Activity":"Forum Activity",
  "-":""
};

// DEFAULT TIMETABLE: days -> time -> {subject, faculty, type}
const DEFAULT = {
  "Mon":{
    "08:00":{subject:"SE&PM", faculty:DEFAULT_FACULTY["SE&PM"], type:"Class"},
    "09:00":{subject:"Library", faculty:DEFAULT_FACULTY["Library"], type:"Break"},
    "10:00":{subject:"Break", faculty:"", type:"Break"},
    "10:30":{subject:"RM&IPR", faculty:DEFAULT_FACULTY["RM&IPR"], type:"Class"},
    "11:30":{subject:"CV", faculty:DEFAULT_FACULTY["CV"], type:"Class"},
    "12:30":{subject:"Lunch", faculty:"", type:"Lunch"},
    "13:30":{subject:"Mentoring", faculty:DEFAULT_FACULTY["Mentoring"], type:"Activity"},
    "14:30":{subject:"NSS", faculty:DEFAULT_FACULTY["NSS"], type:"Activity"},
    "15:30":{subject:"Mini Project", faculty:DEFAULT_FACULTY["Mini Project"], type:"Project"}
  },
  "Tue":{
    "08:00":{subject:"RM&IPR", faculty:DEFAULT_FACULTY["RM&IPR"], type:"Class"},
    "09:00":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "10:00":{subject:"Break", faculty:"", type:"Break"},
    "10:30":{subject:"DV Lab(B2)/CN Lab(B1)", faculty:DEFAULT_FACULTY["DV Lab(B2)/CN Lab(B1)"], type:"Lab"},
    "11:30":{subject:"SE&PM", faculty:DEFAULT_FACULTY["SE&PM"], type:"Class"},
    "12:30":{subject:"Lunch", faculty:"", type:"Lunch"},
    "13:30":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "14:30":{subject:"NSS", faculty:DEFAULT_FACULTY["NSS"], type:"Activity"},
    "15:30":{subject:"Mini Project", faculty:DEFAULT_FACULTY["Mini Project"], type:"Project"}
  },
  "Wed":{
    "08:00":{subject:"CN", faculty:DEFAULT_FACULTY["CN"], type:"Class"},
    "09:00":{subject:"EVS", faculty:DEFAULT_FACULTY["EVS"], type:"Class"},
    "10:00":{subject:"Break", faculty:"", type:"Break"},
    "10:30":{subject:"SE&PM", faculty:DEFAULT_FACULTY["SE&PM"], type:"Class"},
    "11:30":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "12:30":{subject:"Lunch", faculty:"", type:"Lunch"},
    "13:30":{subject:"Remedial", faculty:DEFAULT_FACULTY["Remedial"], type:"Activity"},
    "14:30":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "15:30":{subject:"Mini Project", faculty:DEFAULT_FACULTY["Mini Project"], type:"Project"}
  },
  "Thu":{
    "08:00":{subject:"RM&IPR", faculty:DEFAULT_FACULTY["RM&IPR"], type:"Class"},
    "09:00":{subject:"CV", faculty:DEFAULT_FACULTY["CV"], type:"Class"},
    "10:00":{subject:"Break", faculty:"", type:"Break"},
    "10:30":{subject:"CN", faculty:DEFAULT_FACULTY["CN"], type:"Class"},
    "11:30":{subject:"SE&PM", faculty:DEFAULT_FACULTY["SE&PM"], type:"Class"},
    "12:30":{subject:"Lunch", faculty:"", type:"Lunch"},
    "13:30":{subject:"A", faculty:"", type:"Activity"},
    "14:30":{subject:"SE&PM", faculty:DEFAULT_FACULTY["SE&PM"], type:"Class"},
    "15:30":{subject:"Forum Activity", faculty:DEFAULT_FACULTY["Forum Activity"], type:"Activity"}
  },
  "Fri":{
    "08:00":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "09:00":{subject:"CN", faculty:DEFAULT_FACULTY["CN"], type:"Class"},
    "10:00":{subject:"Break", faculty:"", type:"Break"},
    "10:30":{subject:"SE&PM", faculty:DEFAULT_FACULTY["SE&PM"], type:"Class"},
    "11:30":{subject:"CV", faculty:DEFAULT_FACULTY["CV"], type:"Class"},
    "12:30":{subject:"Lunch", faculty:"", type:"Lunch"},
    "13:30":{subject:"RM&IPR", faculty:DEFAULT_FACULTY["RM&IPR"], type:"Class"},
    "14:30":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "15:30":{subject:"-", faculty:"", type:"Free"}
  },
  "Sat":{
    "08:00":{subject:"DV Lab(B1)/CN Lab(B2)", faculty:DEFAULT_FACULTY["DV Lab(B1)/CN Lab(B2)"], type:"Lab"},
    "09:00":{subject:"RM&IPR", faculty:DEFAULT_FACULTY["RM&IPR"], type:"Class"},
    "10:00":{subject:"Break", faculty:"", type:"Break"},
    "10:30":{subject:"RM&IPR", faculty:DEFAULT_FACULTY["RM&IPR"], type:"Class"},
    "11:30":{subject:"TC", faculty:DEFAULT_FACULTY["TC"], type:"Class"},
    "12:30":{subject:"Lunch", faculty:"", type:"Lunch"},
    "13:30":{subject:"Forum Activity", faculty:DEFAULT_FACULTY["Forum Activity"], type:"Activity"},
    "14:30":{subject:"-", faculty:"", type:"Free"},
    "15:30":{subject:"-", faculty:"", type:"Free"}
  }
};

// ---------- storage keys ----------
const STORAGE_KEY = "timetable_pwa_v1";
const SHOWN_HISTORY = "timetable_pwa_shown_v1";

// ---------- app state ----------
let TIMETABLE = loadTimetable();
let adminMode = false;
let swRegistration = null;
let deferredPrompt = null;

// ---------- render table (days rows, times columns) ----------
const tableWrap = document.getElementById('tableWrap');
function renderTable(){
  const table = document.createElement('table');

  // header
  const thead = document.createElement('thead');
  const htr = document.createElement('tr');
  htr.innerHTML = `<th>Day \\ Time</th>` + TIMES.map(t=>`<th>${formatTimeLabel(t)}</th>`).join('');
  thead.appendChild(htr);
  table.appendChild(thead);

  // body
  const tbody = document.createElement('tbody');
  DAYS.forEach(day=>{
    const tr = document.createElement('tr');
    const th = document.createElement('th'); th.textContent = day; tr.appendChild(th);
    TIMES.forEach(time=>{
      const td = document.createElement('td');
      const slot = TIMETABLE[day][time];
      td.className = slot.type === "Break" ? "break" : slot.type === "Lunch" ? "lunch" : "";
      const inner = document.createElement('div');
      inner.className = "slot";
      inner.innerHTML = `<div class="sub">${slot.subject}</div><div class="fac">${slot.faculty||''}</div>`;
      td.appendChild(inner);
      if(adminMode){
        td.classList.add('editable');
        td.onclick = ()=> editCell(day, time);
      } else {
        td.classList.remove('editable');
        td.onclick = null;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.innerHTML = '';
  tableWrap.appendChild(table);
}
function formatTimeLabel(t){
  const idx = TIMES.indexOf(t);
  const next = TIMES[idx+1] || addOneHour(t);
  return `${t} - ${next}`;
}
function addOneHour(t){
  const [h,m] = t.split(':').map(Number);
  return String((h+1).toString().padStart(2,'0')) + ':00';
}

// ---------- load/save ----------
function loadTimetable(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try { return JSON.parse(raw); } catch(e){}
  }
  const copy = JSON.parse(JSON.stringify(DEFAULT));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  return copy;
}
function saveTimetable(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(TIMETABLE));
  showToast("Timetable saved");
  renderTable();
}

// ---------- admin edit ----------
document.getElementById('btnAdmin').addEventListener('click', ()=>{
  if(adminMode){
    adminMode = false;
    document.getElementById('btnAdmin').textContent = 'Admin Login';
    showToast("Exited admin mode");
    renderTable();
    return;
  }
  const pass = prompt("Enter admin password:");
  if(pass === "admin123"){ // change if you want
    adminMode = true;
    document.getElementById('btnAdmin').textContent = 'Exit Admin';
    showToast("Admin mode enabled — click any cell to edit");
    renderTable();
  } else {
    showToast("Wrong password");
  }
});

function editCell(day, time){
  const slot = TIMETABLE[day][time];
  const newSubject = prompt(`Edit subject for ${day} ${time}:`, slot.subject);
  if(newSubject === null) return;
  const newFaculty = prompt(`Edit faculty for ${day} ${time}:`, slot.faculty);
  if(newFaculty === null) return;
  const newType = prompt(`Type (Class/Break/Lunch/Lab/Project/Activity/Free):`, slot.type || 'Class');
  if(newType === null) return;
  TIMETABLE[day][time] = { subject: newSubject, faculty: newFaculty, type: newType };
  saveTimetable();
  // update service worker schedule immediately
  postScheduleToSW();
}

// ---------- toast ----------
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 3000);
}

// ---------- service worker registration & install prompt ----------
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(reg=>{
    swRegistration = reg;
    console.log('SW registered', reg);
  }).catch(err=>console.warn('SW failed', err));
}
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btnInstall');
  btn.hidden = false;
  btn.onclick = async ()=>{
    btn.hidden = true;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
  };
});

// ---------- notifications & scheduling ----------
// Save shown notifications so we don't repeat
function markShown(key){
  const today = (new Date()).toISOString().slice(0,10);
  const raw = JSON.parse(localStorage.getItem(SHOWN_HISTORY) || "{}");
  raw[today] = raw[today] || {};
  raw[today][key] = true;
  localStorage.setItem(SHOWN_HISTORY, JSON.stringify(raw));
}
function wasShown(key){
  const today = (new Date()).toISOString().slice(0,10);
  const raw = JSON.parse(localStorage.getItem(SHOWN_HISTORY) || "{}");
  return raw[today] && raw[today][key];
}

// get upcoming slots for today (or next N days)
function getUpcomingSlots(daysAhead = 0){
  const out = [];
  const now = new Date();
  for(let d=0; d<=daysAhead; d++){
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()+d);
    const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()];
    if(dayName === "Sun") continue;
    const dayKey = dayName === "Mon" ? "Mon" : dayName;
    if(!TIMETABLE[dayKey]) continue;
    for(const t of TIMES){
      const [hh,mm] = t.split(':').map(Number);
      const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0);
      if(dt.getTime() >= now.getTime()){
        out.push({day: dayKey, time: t, slot: TIMETABLE[dayKey][t], when: dt});
      }
    }
  }
  return out.sort((a,b)=>a.when - b.when);
}

function fireNotification(title, body, tag){
  if(swRegistration && swRegistration.showNotification){
    try{
      swRegistration.showNotification(title, { body, tag, renotify: true });
    }catch(e){
      try{ new Notification(title, {body}); }catch(e2){ console.log('notify fail', e2); }
    }
  } else {
    try{ new Notification(title, {body}); }catch(e){ console.log('notify fail', e); }
  }
  showToast(body);
}

// Post complete schedule to service worker so it can run background checks
function postScheduleToSW(){
  if(!navigator.serviceWorker.controller) return;
  const lead = Number(document.getElementById('leadTime').value) || 5;
  navigator.serviceWorker.controller.postMessage({ action: 'updateSchedule', timetable: TIMETABLE, times: TIMES, leadMinutes: lead });
}

// Check & notify (fallback on client if SW can't)
function checkAndNotifyClient(){
  const lead = Number(document.getElementById('leadTime').value) || 5;
  const now = Date.now();
  const upcoming = getUpcomingSlots(0); // today
  for(const s of upcoming){
    const notifyAt = s.when.getTime() - lead*60000;
    const key = `${s.day}_${s.time}`;
    if(now >= notifyAt && now < (notifyAt + 70*1000) && !wasShown(key)){
      const title = s.slot.type === "Lunch" ? "Lunch time" : s.slot.type === "Break" ? "Break time" : `Upcoming: ${s.slot.subject}`;
      const body = s.slot.type === "Lunch" || s.slot.type === "Break"
        ? `${s.slot.type} — ${s.slot.subject}`
        : `${s.slot.subject} — ${s.slot.faculty || 'Faculty'} at ${s.time}`;
      fireNotification(title, body, key);
      markShown(key);
    }
  }
}

// Start/stop scheduler: we send schedule to SW and also run a client fallback interval
let clientInterval = null;
document.getElementById('btnSchedule').addEventListener('click', ()=>{
  if(clientInterval){
    clearInterval(clientInterval); clientInterval = null;
    document.getElementById('btnSchedule').textContent = 'Start Scheduler';
    showToast('Scheduler stopped');
    return;
  }
  if(Notification.permission !== 'granted'){ Notification.requestPermission().then(p=>{ if(p!=='granted') { showToast('Grant notifications first'); return; } else { startScheduler(); }}); }
  else startScheduler();
});

function startScheduler(){
  // post schedule to SW
  postScheduleToSW();
  // start client fallback every minute
  clientInterval = setInterval(checkAndNotifyClient, 60*1000);
  // run immediate check
  checkAndNotifyClient();
  document.getElementById('btnSchedule').textContent = 'Stop Scheduler';
  showToast('Scheduler running — will notify before sessions');
}

// when leadTime changes, update SW
document.getElementById('leadTime').addEventListener('change', ()=> postScheduleToSW());

// when SW becomes active, send schedule
navigator.serviceWorker && navigator.serviceWorker.addEventListener && navigator.serviceWorker.addEventListener('controllerchange', ()=>{
  postScheduleToSW();
});

// initial render and setup
renderTable();

// automatically request notification permission prompt only when user clicks enable
document.getElementById('btnEnable').addEventListener('click', async ()=>{
  if(!('Notification' in window)){ showToast('Notifications not supported in this browser'); return; }
  const p = await Notification.requestPermission();
  if(p === 'granted'){
    showToast('Notifications enabled');
    // inform service worker as well
    postScheduleToSW();
  } else {
    showToast('Notifications denied');
  }
});
