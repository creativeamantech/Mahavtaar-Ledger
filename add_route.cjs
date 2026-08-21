const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import ExecDashboard from \"./pages/ExecDashboard\";";
const newImportStatement = "import ExecDashboard from \"./pages/ExecDashboard\";\nimport ExecTeamPerf from \"./pages/ExecTeamPerf\";";

const routeStatement = "<Route path=\"/exec-dashboard\" element={<ProtectedRoute view={VIEWS.EXEC_DASHBOARD}><ExecDashboard /></ProtectedRoute>} />";
const newRouteStatement = "<Route path=\"/exec-dashboard\" element={<ProtectedRoute view={VIEWS.EXEC_DASHBOARD}><ExecDashboard /></ProtectedRoute>} />\n      <Route path=\"/exec-team-perf\" element={<ProtectedRoute view={VIEWS.EXEC_DASHBOARD}><ExecTeamPerf /></ProtectedRoute>} />";

content = content.replace(importStatement, newImportStatement);
content = content.replace(routeStatement, newRouteStatement);

fs.writeFileSync(file, content);
console.log('App.tsx updated');
