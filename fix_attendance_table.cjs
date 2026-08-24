const fs = require('fs');
const file = 'src/components/agent/AgentAttendanceTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the mock 45 min logic
content = content.replace(/const dailyBreakTime = 45; \/\/ 45 mins default\n/g, '');

const breakLogicOld = `
        cell: ({ row }) => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const recordDate = format(parseISO(row.original.date), 'yyyy-MM-dd');
            const breakMinutes = recordDate === today ? dailyBreakTime : (row.original.breakDuration || 0);
            const hours = Math.floor(breakMinutes / 60);
            const mins = Math.round(breakMinutes % 60);
            return \`\${hours}h \${mins}m\`;
        }
`;

const breakLogicNew = `
        cell: ({ row }) => {
            let breakMinutes = row.original.breakDuration || 0;
            if (row.original.currentBreakStart) {
                const start = parseISO(row.original.currentBreakStart);
                breakMinutes += Math.round((new Date().getTime() - start.getTime()) / 60000);
            }
            const hours = Math.floor(breakMinutes / 60);
            const mins = Math.round(breakMinutes % 60);
            return \`\${hours}h \${mins}m\`;
        }
`;
// the indentation might be different, let's just use regex

content = content.replace(/cell: \(\{ row \}\) => \{\s*const today = format\(new Date\(\), 'yyyy-MM-dd'\);\s*const recordDate = format\(parseISO\(row\.original\.date\), 'yyyy-MM-dd'\);\s*const breakMinutes = recordDate === today \? dailyBreakTime : \(row\.original\.breakDuration \|\| 0\);\s*const hours = Math\.floor\(breakMinutes \/ 60\);\s*const mins = Math\.round\(breakMinutes \% 60\);\s*return `\$\{hours\}h \$\{mins\}m`;\s*\}/g, breakLogicNew.trim());

const prodHoursOld = `
      cell: ({ row }) => {
          const today = format(new Date(), 'yyyy-MM-dd');
          const recordDate = format(parseISO(row.original.date), 'yyyy-MM-dd');
          const breakMinutes = recordDate === today ? dailyBreakTime : (row.original.breakDuration || 0);
          const { text, deviation } = calculateProductiveHours(row.original, breakMinutes);
          return (
              <div className="flex items-center gap-2">
                  <span>{text}</span>
                  {deviation && text !== "N/A" && <Badge variant="destructive">Deviation</Badge>}
              </div>
          )
      },
`;
const prodHoursNew = `
      cell: ({ row }) => {
          let breakMinutes = row.original.breakDuration || 0;
          if (row.original.currentBreakStart) {
              const start = parseISO(row.original.currentBreakStart);
              breakMinutes += Math.round((new Date().getTime() - start.getTime()) / 60000);
          }
          const { text, deviation } = calculateProductiveHours(row.original, breakMinutes);
          return (
              <div className="flex items-center gap-2">
                  <span>{text}</span>
                  {deviation && text !== "N/A" && <Badge variant="destructive">Deviation</Badge>}
              </div>
          )
      },
`;

content = content.replace(/cell: \(\{ row \}\) => \{\s*const today = format\(new Date\(\), 'yyyy-MM-dd'\);\s*const recordDate = format\(parseISO\(row\.original\.date\), 'yyyy-MM-dd'\);\s*const breakMinutes = recordDate === today \? dailyBreakTime : \(row\.original\.breakDuration \|\| 0\);\s*const \{ text, deviation \} = calculateProductiveHours\(row\.original, breakMinutes\);\s*return \(\s*<div className="flex items-center gap-2">\s*<span>\{text\}<\/span>\s*\{deviation && text !== "N\/A" && <Badge variant="destructive">Deviation<\/Badge>\}\s*<\/div>\s*\)\s*\}/g, prodHoursNew.trim());

// also update the interface AttendanceRecord to include currentBreakStart
if (!content.includes('currentBreakStart?: string;')) {
    content = content.replace('breakDuration?: number;', 'breakDuration?: number;\n  currentBreakStart?: string;');
}

fs.writeFileSync(file, content, 'utf8');
