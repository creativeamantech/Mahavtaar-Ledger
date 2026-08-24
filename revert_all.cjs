const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/DataExplorer.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Strip state definitions
  content = content.replace(/const \[sortKey, setSortKey\] = useState.*?setSortDirection\('asc'\);\n    \}\n  \};\n/s, '');
  content = content.replace(/const \[sortKey, setSortKey\] = useState.*?setSortDirection\('desc'\);\n    \}\n  \};\n/s, '');
  
  // Strip onClick and cursor-pointer from th tags
  // Replace: <th onClick={() => handleSort('city')} className={`\${sortKey === 'city' ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs cursor-pointer hover:bg-muted transition-colors`}>
  // Replace: <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('agreementid')}>
  
  content = content.replace(/onClick=\{\(\) => handleSort\('[^']+'\)\}/g, '');
  content = content.replace(/onClick=\{\(\) => handleSort\(col\)\}/g, '');
  
  content = content.replace(/className=\{`\$\{sortKey === '[^']+' \? 'bg-primary\/5 text-primary' : ''\} ([^`]+)`\}/g, 'className="$1"');
  
  content = content.replace(/ cursor-pointer hover:bg-muted transition-colors/g, '');
  
  content = content.replace(/<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 transition-opacity"><ArrowUpDown className="h-3 w-3" \/><\/span>/g, '');
  content = content.replace(/<ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40 hover:opacity-100" \/>/g, '');

  // For DataExplorer, change sortedRecords back to filteredRecords
  const sortLogicRegex = /const sortedRecords = useMemo.*?\[filteredRecords, sortKey, sortDirection\]\);/s;
  content = content.replace(sortLogicRegex, '');
  
  content = content.replace(/\[sortedRecords, page, itemsPerPage\]/g, '[filteredRecords, page, itemsPerPage]');
  content = content.replace(/sortedRecords\.slice/g, 'filteredRecords.slice');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done reverting all headers');
