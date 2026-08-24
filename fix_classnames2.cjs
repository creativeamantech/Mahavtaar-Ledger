const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace className="${...}" with className={`...`}
  content = content.replace(/className="\$\{([^}]+)\}([^"]*)"/g, 'className={`$1$2`}');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed classNames');
