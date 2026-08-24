const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove handleSort logic
  content = content.replace(/const \[sortKey, setSortKey\] = useState.*?setSortDirection\('desc'\);\n    \}\n  \};\n/s, '');
  
  // Revert <th> tags
  content = content.replace(/<th onClick=\{\(\) => handleSort\('[^']+'\)\} className=\{`\$\{sortKey === '[^']+' \? 'bg-primary\/5 text-primary' : ''\} ([^`]+)`\}>([^<]+)<span[^>]*><ArrowUpDown[^>]*\/><\/span><\/th>/g, '<th className="$1">$2</th>');
  
  // Also remove ArrowUpDown import if it's unused
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Reverted headers in', file);
}
