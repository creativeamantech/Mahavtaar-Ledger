const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/DataExplorer.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove sorting states
  content = content.replace(/const \[sortKey, setSortKey\] = useState.*?setSortDirection\('asc'\);\n    \}\n  \};\n/s, '');
  content = content.replace(/const \[sortKey, setSortKey\] = useState.*?setSortDirection\('desc'\);\n    \}\n  \};\n/s, '');
  
  // Pivot tables:
  // <th onClick={() => handleSort('city')} className={`\${sortKey === 'city' ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs cursor-pointer hover:bg-muted transition-colors`}>Bucket / City<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 transition-opacity"><ArrowUpDown className="h-3 w-3" /></span></th>
  
  content = content.replace(/<th onClick=\{\(\) => handleSort\('[^']+'\)\} className=\{`\$\{sortKey === '[^']+' \? 'bg-primary\/5 text-primary' : ''\} ([^`]+) cursor-pointer hover:bg-muted transition-colors`\}>([^<]+)<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 transition-opacity"><ArrowUpDown className="h-3 w-3" \/><\/span><\/th>/g, '<th className="$1">$2</th>');

  // DataExplorer.tsx:
  // <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('agreementid')}>Agreement<ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40 hover:opacity-100" /></th>
  content = content.replace(/<th className="([^"]*) cursor-pointer hover:bg-muted transition-colors" onClick=\{\(\) => handleSort\('[^']+'\)\}>([^<]+)<ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40 hover:opacity-100" \/><\/th>/g, '<th className="$1">$2</th>');
  
  content = content.replace(/<th key=\{col\} id=\{`th-\$\{col\}`\} className="([^"]*) cursor-pointer hover:bg-muted transition-colors" onClick=\{\(\) => handleSort\(col\)\}>\{col\}<ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40 hover:opacity-100" \/><\/th>/g, '<th key={col} id={`th-${col}`} className="$1">{col}</th>');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done reverting headers');
