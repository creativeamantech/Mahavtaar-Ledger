const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<td className="px-4 py-3 font-semibold">\{row.city\}<\/td>/,
  '<td className="px-4 py-3 font-semibold hidden sm:table-cell">{row.city}</td>'
);
content = content.replace(
  /<td className=`px-4 py-3 text-center font-black \$\{isFirstForExec \? 'text-primary bg-primary\/5 rounded-md' : 'text-transparent'\}`>/,
  '<td className={`px-4 py-3 text-center font-black hidden md:table-cell ${isFirstForExec ? \'text-primary bg-primary/5 rounded-md\' : \'text-transparent\'}`}>'
);

content = content.replace(
  /<td className="px-6 py-4 text-right font-medium text-info">\{fmtCur\(row.pos\)\}<\/td>/,
  '<td className="px-6 py-4 text-right font-medium text-info hidden sm:table-cell">{fmtCur(row.pos)}</td>'
);

fs.writeFileSync(file, content);
