const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Route path="/exec-team-perf" element={<ProtectedRoute view={VIEWS.EXEC_DASHBOARD}><ExecTeamPerf /></ProtectedRoute>} />',
  '<Route path="/exec-team-perf" element={<ProtectedRoute view={VIEWS.EXEC_TEAM_PERF}><ExecTeamPerf /></ProtectedRoute>} />'
);

fs.writeFileSync(file, content);
console.log('App.tsx updated');
