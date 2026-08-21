const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

// City Stats Table
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Total<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell">Total</th>'
);
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-primary">Allocated<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-primary hidden sm:table-cell">Allocated</th>'
);
content = content.replace(
  /<td className="px-6 py-4 text-center font-data font-bold">\{stat.total\}<\/td>/,
  '<td className="px-6 py-4 text-center font-data font-bold hidden sm:table-cell">{stat.total}</td>'
);
content = content.replace(
  /<td className="px-6 py-4 text-center font-data text-primary font-bold">\{stat.allocated\}<\/td>/,
  '<td className="px-6 py-4 text-center font-data text-primary font-bold hidden sm:table-cell">{stat.allocated}</td>'
);

// Current Allocations Table
content = content.replace(
  /<th className="px-4 py-3 font-bold">City<\/th>/,
  '<th className="px-4 py-3 font-bold hidden sm:table-cell">City</th>'
);
content = content.replace(
  /<th className="px-4 py-3 font-bold text-center">Total<\/th>/,
  '<th className="px-4 py-3 font-bold text-center hidden md:table-cell">Total</th>'
);
content = content.replace(
  /<td className="px-4 py-2 font-semibold">\{row.city\}<\/td>/,
  '<td className="px-4 py-2 font-semibold hidden sm:table-cell">{row.city}</td>'
);
content = content.replace(
  /<td className="px-4 py-2 text-center font-data font-bold">\{row.count\}<\/td>/,
  '<td className="px-4 py-2 text-center font-data font-bold hidden md:table-cell">{row.count}</td>'
); // wait, it was Total POS? No, it's "Total" (which is actually just the grand total count in the context maybe? No, let's leave count alone)

// Daily Report Table
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">City<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">City</th>'
);
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Total POS Assigned<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right hidden sm:table-cell">Total POS Assigned</th>'
);
content = content.replace(
  /<td className="px-6 py-4 text-muted-foreground">\{row.city\}<\/td>/,
  '<td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{row.city}</td>'
);
content = content.replace(
  /<td className="px-6 py-4 text-right font-data text-primary font-bold">\{fmtCur\(row.pos\)\}<\/td>/,
  '<td className="px-6 py-4 text-right font-data text-primary font-bold hidden sm:table-cell">{fmtCur(row.pos)}</td>'
);

fs.writeFileSync(file, content);
