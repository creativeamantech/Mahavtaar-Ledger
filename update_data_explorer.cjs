const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// The thead part
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold">State<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold hidden sm:table-cell">State</th>'
);
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold">City<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold hidden sm:table-cell">City</th>'
);
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold">Executive<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold hidden sm:table-cell">Executive</th>'
);
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold text-right">POS<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right hidden md:table-cell">POS</th>'
);
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold text-right">EMI<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right hidden sm:table-cell">EMI</th>'
);
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold text-right">ECS<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right hidden sm:table-cell">ECS</th>'
);
content = content.replace(
  /<th className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold text-right">Status<\/th>/,
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right hidden sm:table-cell">Status</th>'
);

// The tbody part
content = content.replace(
  /<td className="px-2 py-1.5 text-muted-foreground">\{r.state \|\| r.State \|\| '-'}<\/td>/g,
  '<td className="px-2 py-1.5 text-muted-foreground hidden sm:table-cell">{r.state || r.State || \'-\'}</td>'
);
content = content.replace(
  /<td className="px-2 py-1.5 text-muted-foreground">\{r.city \|\| r.City \|\| '-'}<\/td>/g,
  '<td className="px-2 py-1.5 text-muted-foreground hidden sm:table-cell">{r.city || r.City || \'-\'}</td>'
);
content = content.replace(
  /<td className="px-2 py-1.5 text-muted-foreground">\{r.executive_name \|\| r\['Executive Name'\] \|\| '-'}<\/td>/g,
  '<td className="px-2 py-1.5 text-muted-foreground hidden sm:table-cell">{r.executive_name || r[\'Executive Name\'] || \'-\'}</td>'
);
content = content.replace(
  /<td className="px-2 py-1.5 text-right font-bold text-foreground">\{fmtCur\(Number\(r.principal_outstanding\) \|\| 0\)}<\/td>/g,
  '<td className="px-2 py-1.5 text-right font-bold text-foreground hidden md:table-cell">{fmtCur(Number(r.principal_outstanding) || 0)}</td>'
);
content = content.replace(
  /<td className="px-2 py-1.5 text-right text-muted-foreground">\{fmtCur\(Number\(r.emi_amt\) \|\| 0\)}<\/td>/g,
  '<td className="px-2 py-1.5 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(Number(r.emi_amt) || 0)}</td>'
);
content = content.replace(
  /<td className="px-2 py-1.5 text-right text-muted-foreground">\{fmtCur\(Number\(r.ecs \?\? r.ECS\) \|\| 0\)}<\/td>/g,
  '<td className="px-2 py-1.5 text-right text-muted-foreground hidden sm:table-cell">{fmtCur(Number(r.ecs ?? r.ECS) || 0)}</td>'
);
content = content.replace(
  /<td className="px-2 py-1.5 text-right">\s*\{isPaid/g,
  '<td className="px-2 py-1.5 text-right hidden sm:table-cell">\n                        {isPaid'
);

fs.writeFileSync(file, content);
