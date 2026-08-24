const fs = require('fs');
const file = 'src/pages/Attendance.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('currentBreakStart?: string;')) {
    content = content.replace('breakDuration?: number;', 'breakDuration?: number;\n  currentBreakStart?: string;');
}

const breakHoursRegex = /key: 'breakHours',[\s\S]*?render: \(_: any, row: AttendanceRecord\) => \{[\s\S]*?const breakMinutes = row\.breakDuration \|\| 0;/;
const breakHoursReplacement = `key: 'breakHours',
        label: 'Break Hours',
        render: (_: any, row: AttendanceRecord) => {
        let breakMinutes = row.breakDuration || 0;
        if (row.currentBreakStart) {
            const start = parseISO(row.currentBreakStart);
            breakMinutes += Math.round((new Date().getTime() - start.getTime()) / 60000);
        }`;

content = content.replace(breakHoursRegex, breakHoursReplacement);

const calculateProductiveHoursRegex = /const calculateProductiveHours = \(record: AttendanceRecord\) => \{[\s\S]*?const productiveMinutes = totalMinutes - \(record\.breakDuration \|\| 0\);/;
const calculateProductiveHoursReplacement = `const calculateProductiveHours = (record: AttendanceRecord) => {
    if (!record.loginTime || !record.logoutTime) return { text: "N/A", deviation: false, minutes: 0 };
    const totalMinutes = differenceInMinutes(parseISO(record.logoutTime), parseISO(record.loginTime));
    let breakMinutes = record.breakDuration || 0;
    if (record.currentBreakStart) {
        const start = parseISO(record.currentBreakStart);
        breakMinutes += Math.round((new Date().getTime() - start.getTime()) / 60000);
    }
    const productiveMinutes = totalMinutes - breakMinutes;`;

content = content.replace(calculateProductiveHoursRegex, calculateProductiveHoursReplacement);

fs.writeFileSync(file, content, 'utf8');
