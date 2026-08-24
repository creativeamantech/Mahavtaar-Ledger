const fs = require('fs');
const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\$\$\{/g, '${');
  fs.writeFileSync(file, content, 'utf8');
});
