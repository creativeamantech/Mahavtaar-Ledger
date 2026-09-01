const fs = require('fs');

function processFile(file, isTeam) {
  let code = fs.readFileSync(file, 'utf-8');
  
  // 1. Remove BucketFilter imports
  code = code.replace(/import \{ BucketFilter, FloatingBucketFilter \} from '\.\.\/components\/BucketFilter';\n/, '');
  code = code.replace(/import \{ BucketFilter \} from '\.\.\/components\/BucketFilter';\n/, '');
  
  // 2. Modify columns
  const entityLabel = isTeam ? 'Executive' : 'City';
  const entityKey = isTeam ? 'exec' : 'city';
  
  const columnsRegex = /const columns: PivotColumn\[\] = useMemo\(\(\) => \[[\s\S]*?\]\, \[\]\);/;
  const newColumns = `const columns: PivotColumn[] = useMemo(() => [
    { key: 'globalRank', label: '#', align: 'center', width: 45, minWidth: 45 },
    { key: '${entityKey}', label: '${entityLabel}', align: 'left', width: 150, minWidth: 150 },
    { key: 'collection', label: 'Collection (DAC)', align: 'right', width: 110, minWidth: 110 },
    { key: 'count', label: 'Total Count', align: 'right', width: 90, minWidth: 90 },
    { key: 'paid', label: 'Paid Count', align: 'right', width: 90, minWidth: 90 },
    { key: 'totalPOS', label: 'Total POS', align: 'right', width: 110, minWidth: 110 },
    { key: 'paidPOS', label: 'Paid POS', align: 'right', width: 110, minWidth: 110 },
    { key: 'target', label: 'Target Needed', align: 'right', width: 110, minWidth: 110 },
    { key: 'pct', label: 'Recovery %', align: 'right', width: 100, minWidth: 100 },
  ], []);`;
  code = code.replace(columnsRegex, newColumns);
  
  // 3. Remove posPaidOnlyCount and posPaidOnlyPOS from grandTotal calculation
  code = code.replace(/posPaidOnlyCount: acc\.posPaidOnlyCount \+ \(cur\.posPaidOnlyCount \|\| 0\),\s*/g, '');
  code = code.replace(/posPaidOnlyPOS: acc\.posPaidOnlyPOS \+ \(cur\.posPaidOnlyPOS \|\| 0\),\s*/g, '');
  code = code.replace(/posPaidOnlyCount: 0,\s*/g, '');
  code = code.replace(/posPaidOnlyPOS: 0,\s*/g, '');

  // 4. Remove Bucket Filter rendering and KPI Strip
  const stripRegex = /\{\/\* Global Bucket Filter Strip \*\/\}[\s\S]*?\{\/\* Search & Sort Pill Strip \*\/\}/;
  code = code.replace(stripRegex, '{/* Search & Sort Pill Strip */}');
  
  // 5. Replace grid with a single table
  const fullGridRegex = /\{\/\* Bucket Wise Tables \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/AppLayout>/;
  
  const entityCell = isTeam 
    ? `onClick={() => navigateToExplorer({ exec: item.exec, bucket: bkt })}`
    : `onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}`;

  const newGrid = `{/* Single Enterprise Data Grid */}
        <div className="flex-1 min-h-0 bg-card border border-border/80 shadow-xs rounded-xl flex flex-col overflow-hidden relative">
          <div className="overflow-auto flex-1 scrollbar-thin">
            <table className="w-full table-fixed min-w-[900px] text-xs">
              <colgroup>
                {columns.map(col => <col key={col.key} style={{ width: col.width, minWidth: col.minWidth }} />)}
              </colgroup>
              <thead className="bg-[#f8f9fc] dark:bg-[#0d0f14] shadow-[0_1px_2px_rgba(0,0,0,0.05)] sticky top-0 z-30 h-[40px]">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className={\`px-3 py-2 font-bold text-muted-foreground uppercase tracking-wider border-b border-border/80 \${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}\`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {grouped.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-muted-foreground">
                      {filterText ? \`No \` + "${entityKey}" + \` matching "\${filterText}".\` : 'No portfolio records in current view.'}
                    </td>
                  </tr>
                ) : (
                  grouped.map(([bkt, items]) => {
                    const sub = items.reduce((acc, curr) => ({
                      collection: acc.collection + (curr.collection || 0),
                      count: acc.count + (curr.count || 0),
                      paid: acc.paid + (curr.paid || 0),
                      totalPOS: acc.totalPOS + (curr.totalPOS || 0),
                      paidPOS: acc.paidPOS + (curr.paidPOS || 0),
                      target: acc.target + (curr.target || 0),
                      dailyRequiredPOS: acc.dailyRequiredPOS + (curr.dailyRequiredPOS || 0),
                    }), { collection: 0, count: 0, paid: 0, totalPOS: 0, paidPOS: 0, target: 0, dailyRequiredPOS: 0 });
                    
                    const subPct = sub.totalPOS > 0 ? sub.paidPOS / sub.totalPOS : 0;
                    
                    return (
                      <React.Fragment key={bkt}>
                        {/* Sticky Bucket Subheader */}
                        <tr className="sticky top-[40px] z-20 bg-muted/95 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-border/60">
                          <td colSpan={2} className={\`\${cellPadding} font-bold text-foreground\`}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Bucket {bkt}
                              <span className="text-muted-foreground font-mono font-medium ml-1">({items.length} ${entityLabel}s)</span>
                            </div>
                          </td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-muted-foreground\`}>{fmtCur(sub.collection)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-muted-foreground\`}>{sub.count.toLocaleString()}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-muted-foreground\`}>{sub.paid.toLocaleString()}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-muted-foreground\`}>{fmtCur(sub.totalPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-600 dark:text-emerald-400\`}>{fmtCur(sub.paidPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-rose-600 dark:text-rose-400\`}>{fmtCur(sub.target)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold\`}>
                            <HeatBar pct={subPct} showBar={false} showBadge={true} />
                          </td>
                        </tr>
                        
                        {/* Bucket Rows */}
                        {items.map((item, i) => {
                          const rowPct = item.totalPOS > 0 ? item.paidPOS / item.totalPOS : 0;
                          const isAchieved = item.paidPOS >= item.targetPOS;
                          return (
                            <tr key={i} className="hover:bg-muted/30 transition-colors group">
                              <td className={\`\${cellPadding} text-center font-mono text-muted-foreground\`}>{item.globalRank}</td>
                              <td className={\`\${cellPadding}\`}>
                                <span ${entityCell} className="cursor-pointer hover:text-primary hover:underline text-left font-semibold text-foreground">
                                  {item.${entityKey}}
                                </span>
                              </td>
                              <td className={\`\${cellPadding} text-right font-mono font-semibold\`}>{fmtCur(item.collection)}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-muted-foreground\`}>{item.count.toLocaleString()}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold\`}>{item.paid.toLocaleString()}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-foreground\`}>{fmtCur(item.totalPOS)}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold\`}>{fmtCur(item.paidPOS)}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums\`}>
                                {isAchieved ? (
                                  <span className="text-[10px] font-bold text-emerald-500">Achieved</span>
                                ) : (
                                  <div className="flex flex-col items-end leading-tight">
                                    <span className="font-bold text-rose-600 dark:text-rose-400">{fmtCur(item.target)}</span>
                                    {item.dailyRequiredPOS > 0 && <span className="text-[9px] text-amber-600 dark:text-amber-400">DRR: ₹{fmtCur(item.dailyRequiredPOS)}</span>}
                                  </div>
                                )}
                              </td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums\`}>
                                <HeatBar pct={rowPct} showBar={false} showBadge={true} />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
              
              {/* Grand Total Footer */}
              {grouped.length > 0 && (
                <tfoot className="sticky bottom-0 z-30 bg-slate-900 dark:bg-[#070910] shadow-[0_-2px_10px_rgba(0,0,0,0.2)] border-t border-primary/40">
                  <tr>
                    <td className={\`\${cellPadding}\`}></td>
                    <td className={\`\${cellPadding} font-extrabold uppercase text-xs tracking-wider text-primary cursor-pointer hover:underline\`} onClick={() => navigateToExplorer({})}>Grand Total</td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-400\`}>{fmtCur(grandTotal.collection)}</td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold text-slate-200\`}>{grandTotal.count.toLocaleString()}</td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-400\`}>{grandTotal.paid.toLocaleString()}</td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold text-slate-200\`}>{fmtCur(grandTotal.totalPOS)}</td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-400\`}>{fmtCur(grandTotal.paidPOS)}</td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold text-rose-400\`}>
                      <div className="flex flex-col items-end leading-tight">
                        <span>{fmtCur(grandTotal.target)}</span>
                        <span className="text-[9px] text-amber-300 font-mono">DRR: ₹{fmtCur(grandTotal.dailyRequiredPOS)}</span>
                      </div>
                    </td>
                    <td className={\`\${cellPadding} text-right font-mono font-bold\`}>
                      <HeatBar pct={grandPct} showBar={false} showBadge={true} />
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}`;

  code = code.replace(fullGridRegex, newGrid);
  fs.writeFileSync(file, code);
}

processFile('src/pages/CityPivot.tsx', false);
processFile('src/pages/TeamPivot.tsx', true);

