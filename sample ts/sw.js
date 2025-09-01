// sw.js - service worker handles background checks and notifications

let timetable = null;
let TIMES = null;
let leadMinutes = 5;
let checkInterval = null;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Receive schedule from page
self.addEventListener('message', event => {
  const data = event.data || {};
  if(data.action === 'updateSchedule'){
    timetable = data.timetable;
    TIMES = data.times;
    leadMinutes = Number(data.leadMinutes) || 5;
    startChecks();
  }
});

// start periodic checks (once per minute)
function startChecks(){
  if(checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(() => {
    doCheck();
  }, 60*1000);
  // run immediately
  doCheck();
}

function doCheck(){
  if(!timetable || !TIMES) return;
  const now = new Date();
  const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];
  if(dayName === "Sun") return;
  const dayKey = dayName === "Mon" ? "Mon" : dayName;
  const daySched = timetable[dayKey];
  if(!daySched) return;

  const nowMs = now.getTime();
  for(const t of TIMES){
    const slot = daySched[t];
    if(!slot) continue;
    const [hh,mm] = t.split(':').map(Number);
    const classTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0).getTime();
    const notifyAt = classTime - leadMinutes*60000;
    // Only if notifyAt within next minute window
    if(nowMs >= notifyAt && nowMs < notifyAt + 70*1000){
      const key = `${dayKey}_${t}`;
      // Avoid duplicate notifications by checking client localStorage via BroadcastChannel is not possible;
      // We'll still call showNotification (browsers may dedupe identical tags if provided).
      const title = slot.type === "Lunch" ? "Lunch time" : slot.type === "Break" ? "Break time" : `Upcoming: ${slot.subject}`;
      const body = slot.type === "Lunch" || slot.type === "Break" ? `${slot.type} — ${slot.subject}` : `${slot.subject} — ${slot.faculty || 'Faculty'} at ${t}`;
      self.registration.showNotification(title, { body, tag: key, renotify: true });
    }
  }
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      if(clientList.length > 0) return clientList[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
