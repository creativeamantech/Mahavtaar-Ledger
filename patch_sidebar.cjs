const fs = require('fs');
const file = 'src/components/layout/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Exec Dashboard')) {
  content = content.replace(
    "{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },",
    "{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },\n      { label: 'Exec Dashboard', icon: LayoutDashboard, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },"
  );
  
  fs.writeFileSync(file, content);
  console.log('Sidebar patched');
}
