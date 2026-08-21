const fs = require('fs');
const file = 'src/pages/CityPivot.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Total Count<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Total Count</th>'
);
content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Paid Count<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Paid Count</th>'
);
content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">POS Paid Only Count<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">POS Paid Only Count</th>'
);
content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Total POS<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden lg:table-cell">Total POS</th>'
);
content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Paid POS<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Paid POS</th>'
);
content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Needed POS<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Needed POS</th>'
);
content = content.replace(
  /<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">POS Paid Only POS<\/th>/,
  '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">POS Paid Only POS</th>'
);

content = content.replace(
  /<td className="px-3 py-2 text-right">\{sub.count\}<\/td>/,
  '<td className="px-3 py-2 text-right hidden sm:table-cell">{sub.count}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 text-right">\{sub.paid\}<\/td>/,
  '<td className="px-3 py-2 text-right hidden sm:table-cell">{sub.paid}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 text-right text-muted-foreground">\{sub.posPaidOnlyCount\}<\/td>/,
  '<td className="px-3 py-2 text-right text-muted-foreground hidden md:table-cell">{sub.posPaidOnlyCount}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 text-right">\{fmtCur\(sub.totalPOS\)\}<\/td>/,
  '<td className="px-3 py-2 text-right hidden lg:table-cell">{fmtCur(sub.totalPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 text-right">\{fmtCur\(sub.paidPOS\)\}<\/td>/,
  '<td className="px-3 py-2 text-right hidden md:table-cell">{fmtCur(sub.paidPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 text-right text-muted-foreground">\{fmtCur\(sub.neededPOS\)\}<\/td>/,
  '<td className="px-3 py-2 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(sub.neededPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 text-right text-muted-foreground">\{fmtCur\(sub.posPaidOnlyPOS\)\}<\/td>/,
  '<td className="px-3 py-2 text-right text-muted-foreground hidden md:table-cell">{fmtCur(sub.posPaidOnlyPOS)}</td>'
);

// Body rows
content = content.replace(
  /<td className="px-3 py-1.5 text-right">\{item.count\}<\/td>/,
  '<td className="px-3 py-1.5 text-right hidden sm:table-cell">{item.count}</td>'
);
content = content.replace(
  /<td className="px-3 py-1.5 text-right">\{item.paid\}<\/td>/,
  '<td className="px-3 py-1.5 text-right hidden sm:table-cell">{item.paid}</td>'
);
content = content.replace(
  /<td className="px-3 py-1.5 text-right text-muted-foreground">\{item.posPaidOnlyCount\}<\/td>/,
  '<td className="px-3 py-1.5 text-right text-muted-foreground hidden md:table-cell">{item.posPaidOnlyCount}</td>'
);
content = content.replace(
  /<td className="px-3 py-1.5 text-right">\{fmtCur\(item.totalPOS\)\}<\/td>/,
  '<td className="px-3 py-1.5 text-right hidden lg:table-cell">{fmtCur(item.totalPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-1.5 text-right">\{fmtCur\(item.paidPOS\)\}<\/td>/,
  '<td className="px-3 py-1.5 text-right hidden md:table-cell">{fmtCur(item.paidPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-1.5 text-right text-muted-foreground">\{fmtCur\(item.neededPOS\)\}<\/td>/,
  '<td className="px-3 py-1.5 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(item.neededPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-1.5 text-right text-muted-foreground">\{fmtCur\(item.posPaidOnlyPOS\)\}<\/td>/,
  '<td className="px-3 py-1.5 text-right text-muted-foreground hidden md:table-cell">{fmtCur(item.posPaidOnlyPOS)}</td>'
);

// Grand total
content = content.replace(
  /<td className="px-3 py-3 text-right">\{gt.count\}<\/td>/,
  '<td className="px-3 py-3 text-right hidden sm:table-cell">{gt.count}</td>'
);
content = content.replace(
  /<td className="px-3 py-3 text-right">\{gt.paid\}<\/td>/,
  '<td className="px-3 py-3 text-right hidden sm:table-cell">{gt.paid}</td>'
);
content = content.replace(
  /<td className="px-3 py-3 text-right text-muted-foreground">\{gt.posPaidOnlyCount\}<\/td>/,
  '<td className="px-3 py-3 text-right text-muted-foreground hidden md:table-cell">{gt.posPaidOnlyCount}</td>'
);
content = content.replace(
  /<td className="px-3 py-3 text-right">\{fmtCur\(gt.totalPOS\)\}<\/td>/,
  '<td className="px-3 py-3 text-right hidden lg:table-cell">{fmtCur(gt.totalPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-3 text-right">\{fmtCur\(gt.paidPOS\)\}<\/td>/,
  '<td className="px-3 py-3 text-right hidden md:table-cell">{fmtCur(gt.paidPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-3 text-right text-muted-foreground">\{fmtCur\(gt.neededPOS\)\}<\/td>/,
  '<td className="px-3 py-3 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(gt.neededPOS)}</td>'
);
content = content.replace(
  /<td className="px-3 py-3 text-right text-muted-foreground">\{fmtCur\(gt.posPaidOnlyPOS\)\}<\/td>/,
  '<td className="px-3 py-3 text-right text-muted-foreground hidden md:table-cell">{fmtCur(gt.posPaidOnlyPOS)}</td>'
);

fs.writeFileSync(file, content);
