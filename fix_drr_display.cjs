const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace THs
  content = content.replace(
    /<th[\s\S]*?key === 'target'[\s\S]*?Needed POS<\/th>[\s\S]*?<th[\s\S]*?key === 'targetDate'[\s\S]*?Target Date<\/th>[\s\S]*?<th[\s\S]*?key === 'dailyRequiredPOS'[\s\S]*?Daily Required POS<\/th>/,
    `<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Needed / DRR</th>`
  );

  // Replace item row TDs
  content = content.replace(
    /<td className="px-3 py-2 text-right">\{item\.target <= 0 \? <span className="text-\[10px\] font-bold text-success uppercase">Achieved<\/span> : <span className="text-destructive font-mono font-bold tracking-tight">\{fmtCur\(item\.target\)\}<\/span>\}<\/td>[\s\S]*?<td className="px-3 py-2 text-right text-xs text-muted-foreground">\{item\.targetDate \|\| "-"\}<\/td>[\s\S]*?<td className="px-3 py-2 text-right font-mono font-bold tracking-tight text-amber-600">\{fmtCur\(item\.dailyRequiredPOS \|\| 0\)\}<\/td>/g,
    `<td className="px-3 py-2 text-right">
       {item.target <= 0 ? (
         <span className="text-[10px] font-bold text-success uppercase bg-success/10 px-2 py-1 rounded-md">Achieved</span>
       ) : (
         <div className="flex flex-col items-end gap-1">
           <span className="text-destructive font-mono font-bold tracking-tight">{fmtCur(item.target)}</span>
           <span className="text-[10px] font-mono font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">DRR: {fmtCur(item.dailyRequiredPOS || 0)}/d</span>
         </div>
       )}
     </td>`
  );

  // Replace subtotal row TDs
  content = content.replace(
    /<td className="px-3 py-2 text-right">\{sub\.target <= 0 \? <span className="text-\[10px\] font-bold text-success uppercase">Achieved<\/span> : <span className="text-destructive font-mono font-bold tracking-tight">\{fmtCur\(sub\.target\)\}<\/span>\}<\/td>[\s\S]*?<td className="px-3 py-2 text-right text-xs text-muted-foreground">-<\/td>[\s\S]*?<td className="px-3 py-2 text-right font-mono font-bold tracking-tight text-amber-600">\{fmtCur\(sub\.dailyRequiredPOS \|\| 0\)\}<\/td>/g,
    `<td className="px-3 py-2 text-right">
       {sub.target <= 0 ? (
         <span className="text-[10px] font-bold text-success uppercase bg-success/10 px-2 py-1 rounded-md">Achieved</span>
       ) : (
         <div className="flex flex-col items-end gap-1">
           <span className="text-destructive font-mono font-bold tracking-tight">{fmtCur(sub.target)}</span>
           <span className="text-[10px] font-mono font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">DRR: {fmtCur(sub.dailyRequiredPOS || 0)}/d</span>
         </div>
       )}
     </td>`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated DRR display in ${file}`);
});
