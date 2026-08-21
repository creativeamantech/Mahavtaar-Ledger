const fs = require('fs');
const file = 'src/pages/BandExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Thead
content = content.replace(
  /<th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted\/80" onClick=\{[\s\S]*?\}>\s*<div className="flex items-center">Customer Name <SortIcon columnKey="name" \/><\/div>\s*<\/th>/,
  '<th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden sm:table-cell" onClick={() => handleSort(\'name\')}>\n                                <div className="flex items-center">Customer Name <SortIcon columnKey="name" /></div>\n                            </th>'
);
content = content.replace(
  /<th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted\/80" onClick=\{[\s\S]*?\}>\s*<div className="flex items-center">City <SortIcon columnKey="city_count" \/><\/div>\s*<\/th>/,
  '<th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden sm:table-cell" onClick={() => handleSort(\'city_count\')}>\n                                <div className="flex items-center">City <SortIcon columnKey="city_count" /></div>\n                            </th>'
);
content = content.replace(
  /<th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted\/80" onClick=\{[\s\S]*?\}>\s*<div className="flex items-center">Executive <SortIcon columnKey="executive_count" \/><\/div>\s*<\/th>/,
  '<th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden sm:table-cell" onClick={() => handleSort(\'executive_count\')}>\n                                <div className="flex items-center">Executive <SortIcon columnKey="executive_count" /></div>\n                            </th>'
);
content = content.replace(
  /<th className="px-4 py-3 text-right font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted\/80" onClick=\{[\s\S]*?\}>\s*<div className="flex items-center justify-end">EMI <SortIcon columnKey="emi" \/><\/div>\s*<\/th>/,
  '<th className="px-4 py-3 text-right font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden md:table-cell" onClick={() => handleSort(\'emi\')}>\n                                <div className="flex items-center justify-end">EMI <SortIcon columnKey="emi" /></div>\n                            </th>'
);
content = content.replace(
  /<th className="px-4 py-3 text-center font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted\/80" onClick=\{[\s\S]*?\}>\s*<div className="flex items-center justify-center">Allocated <SortIcon columnKey="is_allocated" \/><\/div>\s*<\/th>/,
  '<th className="px-4 py-3 text-center font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden sm:table-cell" onClick={() => handleSort(\'is_allocated\')}>\n                                <div className="flex items-center justify-center">Allocated <SortIcon columnKey="is_allocated" /></div>\n                            </th>'
);

// Tbody
content = content.replace(
  /<td className="px-4 py-2 border-b border-border\/50 text-muted-foreground">\{r\.customer_name \|\| r\.CUSTOMERNAME\}<\/td>/,
  '<td className="px-4 py-2 border-b border-border/50 text-muted-foreground hidden sm:table-cell">{r.customer_name || r.CUSTOMERNAME}</td>'
);
content = content.replace(
  /<td className="px-4 py-2 border-b border-border\/50 text-muted-foreground">\{r\.city\}<\/td>/,
  '<td className="px-4 py-2 border-b border-border/50 text-muted-foreground hidden sm:table-cell">{r.city}</td>'
);
content = content.replace(
  /<td className="px-4 py-2 border-b border-border\/50 text-muted-foreground">\{r\.executive_name \|\| r\['Executive Name'\]\}<\/td>/,
  '<td className="px-4 py-2 border-b border-border/50 text-muted-foreground hidden sm:table-cell">{r.executive_name || r[\'Executive Name\']}</td>'
);
content = content.replace(
  /<td className="px-4 py-2 border-b border-border\/50 text-right text-muted-foreground">\{fmtCur\(r\.emi_amt\)\}<\/td>/,
  '<td className="px-4 py-2 border-b border-border/50 text-right text-muted-foreground hidden md:table-cell">{fmtCur(r.emi_amt)}</td>'
);
content = content.replace(
  /<td className="px-4 py-2 border-b border-border\/50 text-center">\s*\{r\.is_allocated/g,
  '<td className="px-4 py-2 border-b border-border/50 text-center hidden sm:table-cell">\n                                    {r.is_allocated'
);

fs.writeFileSync(file, content);
