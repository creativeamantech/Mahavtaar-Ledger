const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the TH highlighting
  // replace \${sortKey === 'xxx' ? ...} with \${sortConfig.some(s => s.key === 'xxx') ? ...}
  content = content.replace(/\$\{sortKey === '([^']+)' \? 'bg-primary\/5 text-primary' : ''\}/g, "$$${sortConfig.some(s => s.key === '$1') ? 'bg-primary/5 text-primary' : ''}");
  
  // Fix the sortKey usage inside grouped useMemo
  // It's easier to just remove the re-sorting inside grouped since cityData/teamData is already sorted
  // Let's look at the structure: 
  // const sorted = [...items].sort((a, b) => { ... });
  // return { bkt, items: sorted };
  
  // Actually, let's replace the whole grouped calculation dynamically or using regex
});
