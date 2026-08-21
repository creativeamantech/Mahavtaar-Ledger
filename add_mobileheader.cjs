const fs = require('fs');
const file = 'src/components/layout/MobileHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldMap = "'/exec-dashboard': 'Exec Dashboard',";
const newMap = "'/exec-dashboard': 'Exec Dashboard',\n  '/exec-team-perf': 'Team Overall Perf',";

content = content.replace(oldMap, newMap);
fs.writeFileSync(file, content);
console.log('MobileHeader updated');
