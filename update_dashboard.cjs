const fs = require('fs');
const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<th className="px-4 py-2 font-semibold text-right">POS Amount<\/th>/,
  '<th className="px-4 py-2 font-semibold text-right hidden sm:table-cell">POS Amount</th>'
);
content = content.replace(
  /<th className="px-4 py-2 font-semibold text-right">Unpaid<\/th>/,
  '<th className="px-4 py-2 font-semibold text-right hidden sm:table-cell">Unpaid</th>'
);
content = content.replace(
  /<td className="px-4 py-2 text-right">\{fmtCur\(b.posAmount\)\}<\/td>/,
  '<td className="px-4 py-2 text-right hidden sm:table-cell">{fmtCur(b.posAmount)}</td>'
);
content = content.replace(
  /<td className="px-4 py-2 text-right text-muted-foreground">\{b.unpaidCount\}<\/td>/,
  '<td className="px-4 py-2 text-right text-muted-foreground hidden sm:table-cell">{b.unpaidCount}</td>'
);

fs.writeFileSync(file, content);
