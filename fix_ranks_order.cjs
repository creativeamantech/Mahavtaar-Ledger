const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // We want to replace `const sorted = items;`
  // with `const sorted = sortConfig.length > 0 ? items : [...items].sort((a, b) => b.count - a.count);`
  content = content.replace(
      /const sorted = items;/g,
      "const sorted = sortConfig.length > 0 ? items : [...items].sort((a, b) => b.count - a.count);"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated sorting default in ${file}`);
});
