const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the TH highlighting
  content = content.replace(/\$\{sortKey === '([^']+)' \? 'bg-primary\/5 text-primary' : ''\}/g, "$$${sortConfig.some(s => s.key === '$1') ? 'bg-primary/5 text-primary' : ''}");

  // We need to replace the entire `const sorted = [...items].sort((a, b) => { ... });` block
  // with `const sorted = items;`
  // We can use a regex that matches from `const sorted = [...items].sort(` to `});` just before `// Attach rank to items for display`
  
  const regex = /const sorted = \[\.\.\.items\]\.sort\(\(a, b\) => \{[\s\S]*?return sortDirection === 'asc' \? valA - valB : valB - valA;\n         \}\);/g;
  
  if (content.match(regex)) {
    content = content.replace(regex, "const sorted = items;");
    console.log(`Replaced sorting logic in ${file}`);
  } else {
    // If exact regex doesn't match, maybe some variations. Let's try a safer string replacement
    const parts = content.split('const sorted = [...items].sort((a, b) => {');
    if (parts.length > 1) {
       const before = parts[0];
       // Find the end of the sort callback. It's right before `// Attach rank` or `return [bkt,`
       const afterPart = parts[1];
       const endMatch = afterPart.indexOf('// Attach rank');
       if (endMatch !== -1) {
           content = before + 'const sorted = items;\n         ' + afterPart.substring(endMatch);
           console.log(`String replaced sorting logic in ${file}`);
       } else {
           console.log(`Could not find end of sort block in ${file}`);
       }
    } else {
       console.log(`Could not find start of sort block in ${file}`);
    }
  }

  fs.writeFileSync(file, content, 'utf8');
});
