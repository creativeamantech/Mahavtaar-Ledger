const fs = require('fs');
const file = 'src/pages/Attendance.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /'Break \(mins\)': r\.breakDuration \|\| 0,/;
const replacement = `'Break (mins)': r.breakDuration || 0 + (r.currentBreakStart ? Math.round((new Date().getTime() - parseISO(r.currentBreakStart).getTime()) / 60000) : 0),`;
content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
