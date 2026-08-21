const fs = require('fs');
const file = 'src/components/layout/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to add the new menu item right after Exec Dashboard
const oldNavItem = "{ label: 'Exec Dashboard', icon: LayoutDashboard, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },";
const newNavItem = "{ label: 'Exec Dashboard', icon: LayoutDashboard, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },\n      { label: 'Team Overall Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_DASHBOARD },";

content = content.replace(oldNavItem, newNavItem);
fs.writeFileSync(file, content);
console.log('Sidebar updated');
