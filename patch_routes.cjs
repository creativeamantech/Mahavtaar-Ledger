const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ExecDashboard')) {
  content = content.replace(
    'import Dashboard from "./pages/Dashboard";',
    'import Dashboard from "./pages/Dashboard";\nimport ExecDashboard from "./pages/ExecDashboard";'
  );
  
  content = content.replace(
    '<Route path="/dashboard" element={<ProtectedRoute view={VIEWS.DASHBOARD}><Dashboard /></ProtectedRoute>} />',
    '<Route path="/dashboard" element={<ProtectedRoute view={VIEWS.DASHBOARD}><Dashboard /></ProtectedRoute>} />\n      <Route path="/exec-dashboard" element={<ProtectedRoute view={VIEWS.EXEC_DASHBOARD}><ExecDashboard /></ProtectedRoute>} />'
  );
  
  fs.writeFileSync(file, content);
  console.log('App.tsx patched');
}
