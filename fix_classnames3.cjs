const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\{\`(sortKey === '[^']+' \? 'bg-primary\/5 text-primary' : '') ([^`]+)\`\}/g, 'className={`\\${$1} $2`}');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed classNames correctly');
