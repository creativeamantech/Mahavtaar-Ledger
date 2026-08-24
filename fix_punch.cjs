const fs = require('fs');
const file = 'src/components/agent/AgentLiveDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handlePunchIn
content = content.replace(/breakDuration: 45/, 'breakDuration: 0');

// Add handleBreak functions
const punchOutRegex = /const handlePunchOut = async \(\) => \{[\s\S]*?toast\.success\('Punched out successfully!'\);\n  \};/;
const breakFunctions = `
  const handleBreakStart = async () => {
    if (!attendanceRecord) return;
    setIsPunching(true);
    const updated = { ...attendanceRecord, currentBreakStart: new Date().toISOString() };
    await db.attendance_logs.put(updated);
    setAttendanceRecord(updated);
    setIsPunching(false);
    toast.success('Break started');
  };

  const handleBreakEnd = async () => {
    if (!attendanceRecord || !attendanceRecord.currentBreakStart) return;
    setIsPunching(true);
    const endTime = new Date();
    const startTime = parseISO(attendanceRecord.currentBreakStart);
    const breakMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    const updated = { 
        ...attendanceRecord, 
        breakDuration: (attendanceRecord.breakDuration || 0) + breakMins
    };
    delete updated.currentBreakStart;
    
    await db.attendance_logs.put(updated);
    setAttendanceRecord(updated);
    setIsPunching(false);
    toast.success('Break ended');
  };
`;
if (!content.includes('handleBreakStart')) {
    content = content.replace(punchOutRegex, (match) => match + '\n' + breakFunctions);
}

// Update the UI
const buttonUI = `
              <div className="flex gap-2">
                {!attendanceRecord ? (
                  <Button onClick={handlePunchIn} disabled={isPunching} className="w-full sm:w-auto">Punch In</Button>
                ) : !attendanceRecord.logoutTime ? (
                  <>
                    {!attendanceRecord.currentBreakStart ? (
                        <Button onClick={handleBreakStart} disabled={isPunching} variant="secondary" className="w-full sm:w-auto">Start Break</Button>
                    ) : (
                        <Button onClick={handleBreakEnd} disabled={isPunching} variant="default" className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto">End Break</Button>
                    )}
                    <Button onClick={handlePunchOut} disabled={isPunching} variant="destructive" className="w-full sm:w-auto">Punch Out</Button>
                  </>
                ) : null}
              </div>`;

content = content.replace(/<div>\s*\{\!attendanceRecord \? \([\s\S]*?\) : null\}\s*<\/div>/, buttonUI);

fs.writeFileSync(file, content, 'utf8');
