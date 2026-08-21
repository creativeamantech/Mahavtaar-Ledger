const fs = require('fs');
const file = 'src/pages/BandExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<td colSpan=\{2\} className="px-4 py-3 text-right sm:hidden">Grand Total<\/td><td colSpan=\{3\} className="px-4 py-3 text-right hidden sm:table-cell md:hidden">Grand Total<\/td><td colSpan=\{4\} className="px-4 py-3 text-right hidden md:table-cell">Grand Total \(Click to view all\)<\/td>/,
  '<td colSpan={1} className="px-4 py-3 text-right sm:hidden">Total</td><td colSpan={2} className="px-4 py-3 text-right hidden sm:table-cell md:hidden">Total</td><td colSpan={3} className="px-4 py-3 text-right hidden md:table-cell">Grand Total (Click to view all)</td>'
);

fs.writeFileSync(file, content);
