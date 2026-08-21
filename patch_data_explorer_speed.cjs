const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Sticky headers and first column
content = content.replace(
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>',
  '<th className="sticky left-0 z-20 bg-muted border-r border-border px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>'
);

content = content.replace(
  '<td className="px-2 py-1.5 text-primary font-bold cursor-pointer hover:underline" onClick={() => setSelectedRecord(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || \'-\'}</td>',
  '<td className="sticky left-0 z-10 bg-card border-r border-border px-2 py-1.5 text-primary font-bold cursor-pointer hover:underline" onClick={() => setSelectedRecord(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || \'-\'}</td>'
);

// We can also lower pagination items if it was 100
content = content.replace(/const ITEMS_PER_PAGE = 100;/g, 'const ITEMS_PER_PAGE = 50;');

fs.writeFileSync(file, content);
