const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/BandExplorer.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace each button
  content = content.replace(/<button\s*onClick=\{\(\) => \{ setSortKey\('([^']+)'\); setSortDirection\('asc'\); \}\}\s*className="text-left px-2 py-1\.5 text-xs rounded hover:bg-muted transition-colors"\s*>\s*([^<]+)\s*<\/button>/g, 
  (match, key, label) => {
    return `<div className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded transition-colors cursor-pointer" onClick={() => {
        setSortConfig(prev => {
          const exists = prev.find(s => s.key === '${key}');
          if (exists) return prev.filter(s => s.key !== '${key}');
          return [...prev, { key: '${key}', direction: 'asc' }];
        });
      }}>
        <Checkbox className="pointer-events-none" checked={!!sortConfig.find(s => s.key === '${key}')} />
        <span className="text-xs truncate flex-1">${label.trim()}</span>
      </div>`;
  });
  
  // Also fix the pill logic which tried to use sortOptions.find (which doesn't exist)
  // We can just create a map for labels or just use the key since we lost the labels.
  // Actually, we can use a switch or just format the key.
  const oldPillLogic = /\{sortConfig\.map\(sort => \{\s*const opt = sortOptions\.find\(o => o\.key === sort\.key\);\s*return \(\s*<div key=\{sort\.key\}([\s\S]*?)Sort: \{opt \? opt\.label : sort\.key\}([\s\S]*?)<\/div>\s*\);\s*\}\)\}/g;
  
  content = content.replace(oldPillLogic, `{sortConfig.map(sort => {
    const labels: Record<string, string> = { city: 'City', collection: 'Collection', count: 'Total Count', paidCount: 'Paid Count', totalPOS: 'Total POS', paidPOS: 'Paid POS', pct: 'Paid %', team: 'Team', exec: 'Executive', target: 'Target', ach: 'Achieved', _posVal: 'Principal (POS)', _emiVal: 'EMI', aggr: 'Agreement Number', name: 'Customer Name' };
    return (
      <div key={sort.key}$1Sort: {labels[sort.key] || sort.key}$2</div>
    );
  })}`);

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed buttons in pivots');
