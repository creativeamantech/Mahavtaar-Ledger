const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove glassmorphism from table container and make it a clean card
  content = content.replace(
    /className="overflow-auto scrollbar-thin max-h-\[calc\(100vh-250px\)\] min-h-\[400px\] relative bg-white\/5 dark:bg-black\/20 backdrop-blur-xl border border-white\/10 dark:border-white\/5 rounded-2xl shadow-2xl"/g,
    'className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-card rounded-md border shadow-sm"'
  );
  
  // 1b. Remove redundant wrapping if any
  content = content.replace(
    /className="bg-card border rounded-xl shadow-sm overflow-hidden rounded-xl"/g,
    'className=""'
  );

  // 2. Fix the Table Header to be crisp corporate style
  content = content.replace(
    /className="sticky top-0 z-30 bg-white\/80 dark:bg-black\/80 backdrop-blur-2xl shadow-sm border-b border-white\/10"/g,
    'className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 border-b border-border shadow-sm"'
  );

  // Th styling: remove the complex bg-primary/5 highlighting which looks messy, just keep text highlight
  content = content.replace(
    /className=\{\`\$\{sortConfig\.some\(s => s\.key === '([^']+)'\) \? 'bg-primary\/5 text-primary' : ''\} px-3 py-2\.5 text-(right|left) font-medium text-muted-foreground uppercase tracking-wider text-xs\`\}/g,
    `className={\`\${sortConfig.some(s => s.key === '$1') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-$2 uppercase tracking-wider text-[11px] align-middle\`}`
  );

  // 3. Update the Bucket grouping row
  content = content.replace(
    /className="bg-primary\/10 border-b border-border"[\s\S]*?<td colSpan=\{11\} className="px-3 py-2\.5 font-sans text-\[11px\] font-bold text-primary uppercase tracking-\[0\.1em\]">BUCKET \{bkt\}<\/td>/g,
    `className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-border"
                  >
                    <td colSpan={11} className="px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">BUCKET {bkt}</td>`
  );

  // 4. Update the individual rows (remove forced font-mono, use font-tabular-nums)
  content = content.replace(
    /<tr key=\{item\.(city|exec)\} className="border-b border-border transition-colors hover:bg-muted">/g,
    '<tr key={item.$1} className="border-b border-border transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">'
  );

  // Replace text-right font-mono font-bold tracking-tighter -> text-right font-tabular-nums font-semibold
  content = content.replace(/font-mono font-bold tracking-tighter/g, 'font-tabular-nums font-semibold');
  // Replace font-mono font-medium tracking-tight -> font-tabular-nums
  content = content.replace(/font-mono font-medium tracking-tight/g, 'font-tabular-nums');
  // Replace font-mono font-black tracking-tighter -> font-tabular-nums font-bold
  content = content.replace(/font-mono font-black tracking-tighter/g, 'font-tabular-nums font-bold');
  // Replace font-mono -> font-tabular-nums
  content = content.replace(/font-mono/g, 'font-tabular-nums');

  // Replace text-success / text-info with more corporate colors if needed, but text-success is fine.
  
  // 5. Update the Bucket Subtotal row
  content = content.replace(
    /<tr className="border-b border-\[rgba\(255,255,255,0\.08\)\] bg-black\/5 dark:bg-white\/5 font-medium">/g,
    '<tr className="border-b-2 border-border bg-slate-50/50 dark:bg-slate-900/50 font-medium">'
  );

  // 6. Update the Grand Total Tfoot
  content = content.replace(
    /<tfoot className="bg-card font-bold sticky bottom-0 z-20 shadow-\[0_-4px_15px_rgba\(0,0,0,0\.08\)\] border-t-2 border-border transition-colors">/g,
    '<tfoot className="bg-slate-50 dark:bg-slate-900 font-bold sticky bottom-0 z-20 shadow-md border-t-2 border-slate-300 dark:border-slate-700">'
  );
  
  // DRR pill fix - remove rounding, make it more structured
  content = content.replace(
    /<span className="text-\[10px\] font-tabular-nums font-semibold text-amber-500 bg-amber-500\/10 px-1\.5 py-0\.5 rounded">DRR: \{fmtCur\((.*?)\)\}\/d<\/span>/g,
    `<span className="text-[10px] font-tabular-nums font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.5 rounded-sm shadow-sm">DRR: {fmtCur($1)}/d</span>`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Applied Corporate Theme to ${file}`);
});
