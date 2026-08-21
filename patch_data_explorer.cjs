const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="overflow-x-auto scrollbar-thin" ref={tableContainerRef}>',
  '<div className="overflow-auto scrollbar-thin max-h-[calc(100vh-380px)] min-h-[400px]" ref={tableContainerRef}>'
);

// We should also make thethead sticky top 0 work nicely with the sticky left column
// wait, sticky top-0 and sticky left-0 might overlap at the top left corner, usually it needs z-30 for the corner th
// Let's check how the corner TH is defined
// <th className="sticky left-0 z-20 bg-muted border-r border-border px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>

content = content.replace(
  '<th className="sticky left-0 z-20 bg-muted border-r border-border',
  '<th className="sticky left-0 top-0 z-30 bg-muted border-r border-border'
);

content = content.replace(
  '<thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur shadow-sm">',
  '<thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur shadow-sm">'
);

// Also need to make sure the row's first TD is sticky left-0. Wait, it already is:
// <td className="sticky left-0 z-10 bg-card border-r border-border px-2 py-1.5 ...

fs.writeFileSync(file, content);
console.log('Patched');
