const scheduledDate = '2026-04-15';
const date = new Date(scheduledDate);
console.log('Date:', date.toISOString());
console.log('Local Day:', date.getDay()); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

const BUSINESS_HOURS = {
    1: [], // Lunes: Cerrado
    2: [], // Martes: Cerrado
    3: [{ start: '19:00', end: '23:00' }], // Miércoles
};

const day = date.getDay();
console.log('Hours for day', day, ':', BUSINESS_HOURS[day]);
