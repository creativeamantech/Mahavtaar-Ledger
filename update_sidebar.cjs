const fs = require('fs');

let sidebarCode = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf-8');

sidebarCode = sidebarCode.replace(
  `{ label: 'Data Explorer', icon: Database, path: '/explorer', view: VIEWS.DATA_EXPLORER },`,
  `{ label: 'Data Explorer', icon: Database, path: '/explorer', view: VIEWS.DATA_EXPLORER },\n      { label: 'Assignment', icon: Users, path: '/assignment', view: VIEWS.ASSIGNMENT },`
);

fs.writeFileSync('src/components/layout/AppSidebar.tsx', sidebarCode);
console.log("Updated AppSidebar with Assignment link");
