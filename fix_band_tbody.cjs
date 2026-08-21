const fs = require('fs');
const file = 'src/pages/BandExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<td className="px-4 py-3 truncate max-w-\[200px\]">\{row._name\}<\/td>/,
  '<td className="px-4 py-3 truncate max-w-[200px] hidden md:table-cell">{row._name}</td>'
);
content = content.replace(
  /<td className="px-4 py-3">\{row._city\}<\/td>/,
  '<td className="px-4 py-3 hidden sm:table-cell">{row._city}</td>'
);
content = content.replace(
  /<td className="px-4 py-3 text-right text-muted-foreground">\{fmtCur\(row._emiVal\)\}<\/td>/,
  '<td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(row._emiVal)}</td>'
);

content = content.replace(
  /<td colSpan=\{3\} className="px-4 py-3 text-right">Grand Total \(Click to view all\)<\/td>/,
  '<td colSpan={2} className="px-4 py-3 text-right sm:hidden">Grand Total</td><td colSpan={3} className="px-4 py-3 text-right hidden sm:table-cell md:hidden">Grand Total</td><td colSpan={4} className="px-4 py-3 text-right hidden md:table-cell">Grand Total (Click to view all)</td>'
);

content = content.replace(
  /<td className="px-4 py-3 text-right text-muted-foreground">\{fmtCur\(bandData.reduce\(\(sum, r\) => sum \+ r\._emiVal, 0\)\)\}<\/td>/,
  '<td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(bandData.reduce((sum, r) => sum + r._emiVal, 0))}</td>'
);

fs.writeFileSync(file, content);
