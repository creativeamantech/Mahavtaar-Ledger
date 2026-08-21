const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('import CityTeamMatrix from "./pages/CityTeamMatrix";\n', '');
app = app.replace('      <Route path="/matrix" element={<ProtectedRoute view={VIEWS.CITY_TEAM_MATRIX}><CityTeamMatrix /></ProtectedRoute>} />\n', '');
fs.writeFileSync('src/App.tsx', app);

// AppSidebar.tsx
let sidebar = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf-8');
sidebar = sidebar.replace("      { label: 'City × Team', icon: Grid3X3, path: '/matrix', view: VIEWS.CITY_TEAM_MATRIX },\n", '');
fs.writeFileSync('src/components/layout/AppSidebar.tsx', sidebar);

// BottomNav.tsx (just in case it's there)
let bottom = fs.readFileSync('src/components/layout/BottomNav.tsx', 'utf-8');
if (bottom.includes('/matrix')) {
  // It's probably in a map somewhere, let's just leave it or handle it if we grep it.
}

console.log('Matrix page removed from routing and sidebar.');
