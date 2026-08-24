const fs = require('fs');

const files = [
  { file: 'src/pages/CityPivot.tsx', type: 'City' },
  { file: 'src/pages/TeamPivot.tsx', type: 'Executive' },
  { file: 'src/pages/ExecTeamPerf.tsx', type: 'Executive' }
];

files.forEach(({file, type}) => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix header
  const headerReplacement = `<thead className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-sm border-b border-white/10">
            <tr>
              <th  className={\`\${sortConfig.some(s => s.key === '${type === 'City' ? 'city' : 'exec'}') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Bucket / ${type}</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'collection') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Collection</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'count') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Total Count</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'paid') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Paid Count</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'posPaidOnlyCount') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>POS Paid Only Count</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'totalPOS') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Total POS</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'paidPOS') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Paid POS</th>
              <th  className={\`\${sortConfig.some(s => s.key === 'target') ? 'bg-primary/5 text-primary' : ''} px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs\`}>Needed / DRR</th>
`;

  // Regex to match anything from '<table...>' to 'Needed / DRR</th>'
  // and replace with '<table ...>' + headerReplacement
  content = content.replace(
    /<table className="w-full font-sans text-xs min-w-\[1000px\]">[\s\S]*?Needed \/ DRR<\/th>/,
    `<table className="w-full font-sans text-xs min-w-[1000px]">\n          ${headerReplacement}`
  );

  // Fix the footer (tfoot)
  content = content.replace(
    /<tfoot[\s\S]*?<\/tfoot>/,
    `<tfoot className="bg-card font-bold sticky bottom-0 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] border-t-2 border-border transition-colors">
            <tr>
              <td className="px-3 py-2 text-center"></td>
              <td className="px-3 py-2.5 font-bold uppercase text-primary cursor-pointer hover:underline" onClick={() => navigateToExplorer({})}>Grand Total</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-success cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.collection)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{grandTotal.count}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{grandTotal.paid}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{grandTotal.posPaidOnlyCount}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.totalPOS)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{fmtCur(grandTotal.paidPOS)}</td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-destructive font-mono font-bold tracking-tight">{fmtCur(grandTotal.target)}</span>
                  <span className="text-[10px] font-mono font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">DRR: {fmtCur(grandTotal.dailyRequiredPOS || 0)}/d</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-muted-foreground">{fmtCur(grandTotal.posPaidOnlyPOS)}</td>
              <td className={"px-3 py-2.5 text-right font-data font-bold " + pctColor(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0)}>
                {fmtPct(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0)}
              </td>
            </tr>
          </tfoot>`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed table structure in ${file}`);
});
