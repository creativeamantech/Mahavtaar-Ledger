const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldMoreTabs = "const MORE_TABS = [";
const newMoreTabs = "const MORE_TABS = [\n  { label: 'Team Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_DASHBOARD },";

content = content.replace(oldMoreTabs, newMoreTabs);
fs.writeFileSync(file, content);
console.log('BottomNav updated');
