const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/ExecDashboard.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<FilterIcon className="h-3 w-3 ml-1" \/>/g, '');
  content = content.replace(/, Filter as FilterIcon/g, '');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Removed FilterIcon');
