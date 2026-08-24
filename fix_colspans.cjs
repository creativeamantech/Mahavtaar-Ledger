const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Change colSpan={10} or {13} to {11} (since we have 11 columns)
  content = content.replace(/colSpan=\{10\}/g, 'colSpan={11}');
  content = content.replace(/colSpan=\{12\}/g, 'colSpan={11}');
  content = content.replace(/colSpan=\{13\}/g, 'colSpan={11}');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed colspans in ${file}`);
});
