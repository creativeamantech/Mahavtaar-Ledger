const fs = require('fs');
const file = 'src/components/agent/AgentLiveDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /attendanceRecord\?\.logoutTime \? \(\s*<Badge variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1"\/> Shift Completed<\/Badge>\s*\) : attendanceRecord\?\.loginTime \? \(\s*<Badge variant="default" className="bg-success text-white animate-pulse">Active Shift<\/Badge>\s*\) : null/;

const replacement = `attendanceRecord?.logoutTime ? (
                <Badge variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1"/> Shift Completed</Badge>
              ) : attendanceRecord?.currentBreakStart ? (
                <Badge variant="secondary" className="bg-amber-500 text-white animate-pulse hover:bg-amber-600">On Break</Badge>
              ) : attendanceRecord?.loginTime ? (
                <Badge variant="default" className="bg-success text-white animate-pulse hover:bg-success/90">Active Shift</Badge>
              ) : null`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
