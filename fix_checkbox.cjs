const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/BandExplorer.tsx',
  'src/pages/DataExplorer.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make Checkbox pointer-events-none so clicking the div handles it correctly
  content = content.replace(/<Checkbox checked=\{/g, '<Checkbox className="pointer-events-none" checked={');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed checkbox clicking');
