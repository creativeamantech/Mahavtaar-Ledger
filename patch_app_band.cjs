const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Route path="/band-explorer" element={<ProtectedRoute view={VIEWS.DASHBOARD}><BandExplorer /></ProtectedRoute>} />',
  '<Route path="/band-explorer" element={<ProtectedRoute view={VIEWS.CITY_TEAM_MATRIX}><BandExplorer /></ProtectedRoute>} />'
);

fs.writeFileSync(file, content);
console.log('App.tsx band updated');
