const fs = require('fs');

function rewritePage(file, isTeam) {
  let code = fs.readFileSync(file, 'utf-8');

  // Replace columns width and minWidth
  code = code.replace(/width: \d+,/g, (m) => m.replace(/\d+/, '0'))
             .replace(/minWidth: \d+,/g, (m) => m.replace(/\d+/, '0'));
  
  // Actually, I'll just replace the whole columns array and the rendering part
  const columnsPattern = /const columns: PivotColumn\[\] = useMemo\(\(\) => \[[\s\S]*?\]\, \[\]\);/;
  
  const entityLabel = isTeam ? 'Executive' : 'City';
  const entityKey = isTeam ? 'exec' : 'city';
  
  const newColumns = `const columns: PivotColumn[] = useMemo(() => [
    { key: 'globalRank', label: '#', align: 'center', width: 45, minWidth: 45 },
    { key: '${entityKey}', label: '${entityLabel}', align: 'left', width: 140, minWidth: 140 },
    { key: 'collection', label: 'Coll.', align: 'right', width: 90, minWidth: 90 },
    { key: 'count', label: 'Cases', align: 'right', width: 60, minWidth: 60 },
    { key: 'paid', label: 'Paid', align: 'right', width: 60, minWidth: 60 },
    { key: 'posPaidOnlyCount', label: 'POS-Pd', align: 'right', width: 60, minWidth: 60 },
    { key: 'totalPOS', label: 'Tot POS', align: 'right', width: 90, minWidth: 90 },
    { key: 'paidPOS', label: 'Pd POS', align: 'right', width: 90, minWidth: 90 },
    { key: 'target', label: 'Needed', align: 'right', width: 100, minWidth: 100 },
    { key: 'posPaidOnlyPOS', label: 'POS-Pd POS', align: 'right', width: 90, minWidth: 90 },
    { key: 'pct', label: 'Rec %', align: 'right', width: 100, minWidth: 100 },
  ], []);`;
  
  code = code.replace(columnsPattern, newColumns);
  
  // Replace the rendering grid
  const gridPattern = /\{\/\* Enterprise Data Grid Container[\s\S]*?\{\/\* Sticky Grand Total Footer[\s\S]*?<\/tfoot>\s*<\/table>\s*<\/div>\s*<\/div>/;
  
  const entityCell = isTeam 
    ? `onClick={() => navigateToExplorer({ exec: item.exec, bucket: bkt })}
       className="cursor-pointer hover:text-primary hover:underline text-left font-semibold text-foreground"`
    : `onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}
       className="cursor-pointer hover:text-primary hover:underline text-left font-semibold text-foreground"`;

  const newGrid = `{/* Bucket Wise Tables */}
        <div className="flex flex-col gap-6 overflow-y-auto min-h-0 flex-1 scrollbar-thin pr-1 pb-4">
          {grouped.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-xl border border-border shadow-xs text-muted-foreground">
              {filterText ? \`No \` + "${entityKey}" + \` matching "\${filterText}".\` : 'No portfolio records in current bucket view.'}
            </div>
          ) : (
            grouped.map(([bkt, items]) => {
              const sub = items.reduce((acc, curr) => ({
                collection: acc.collection + (curr.collection || 0),
                count: acc.count + (curr.count || 0),
                paid: acc.paid + (curr.paid || 0),
                posPaidOnlyCount: acc.posPaidOnlyCount + (curr.posPaidOnlyCount || 0),
                totalPOS: acc.totalPOS + (curr.totalPOS || 0),
                paidPOS: acc.paidPOS + (curr.paidPOS || 0),
                target: acc.target + (curr.target || 0),
                posPaidOnlyPOS: acc.posPaidOnlyPOS + (curr.posPaidOnlyPOS || 0),
              }), { collection: 0, count: 0, paid: 0, posPaidOnlyCount: 0, totalPOS: 0, paidPOS: 0, target: 0, posPaidOnlyPOS: 0 });
              
              const subPct = sub.totalPOS > 0 ? sub.paidPOS / sub.totalPOS : 0;
              
              return (
                <div key={bkt} className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col">
                  {/* Bucket Header */}
                  <div className="px-4 py-3 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Bucket {bkt}
                    </h2>
                    <div className="text-xs font-mono font-medium text-muted-foreground">
                      {items.length} ${entityLabel}s
                    </div>
                  </div>
                  
                  {/* Bucket Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse font-sans min-w-[800px] text-xs">
                      <thead className="bg-[#f8f9fc] dark:bg-[#0d0f14] border-b border-border">
                        <tr>
                          {columns.map(col => (
                            <th key={col.key} className={\`\${cellPadding} font-bold text-muted-foreground uppercase tracking-wider \${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}\`}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {items.map((item, i) => {
                          const rowPct = item.totalPOS > 0 ? item.paidPOS / item.totalPOS : 0;
                          const isAchieved = item.paidPOS >= item.targetPOS;
                          return (
                            <tr key={i} className="hover:bg-muted/30 transition-colors group">
                              <td className={\`\${cellPadding} text-center font-mono text-muted-foreground\`}>{item.globalRank}</td>
                              <td className={\`\${cellPadding}\`}>
                                <span ${entityCell}>
                                  {item.${entityKey}}
                                </span>
                              </td>
                              <td className={\`\${cellPadding} text-right font-mono font-semibold\`}>{fmtCur(item.collection)}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-muted-foreground\`}>{item.count.toLocaleString()}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold\`}>{item.paid.toLocaleString()}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-blue-600 dark:text-blue-400\`}>{item.posPaidOnlyCount}</td>
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
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums text-muted-foreground\`}>{fmtCur(item.posPaidOnlyPOS)}</td>
                              <td className={\`\${cellPadding} text-right font-mono tabular-nums\`}>
                                <HeatBar pct={rowPct} showBar={false} showBadge={true} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-muted/40 border-t border-border/80">
                        <tr>
                          <td></td>
                          <td className={\`\${cellPadding} font-bold text-xs uppercase text-muted-foreground\`}>Subtotal</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold\`}>{fmtCur(sub.collection)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold\`}>{sub.count.toLocaleString()}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-600 dark:text-emerald-400\`}>{sub.paid.toLocaleString()}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-blue-600 dark:text-blue-400\`}>{sub.posPaidOnlyCount}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold\`}>{fmtCur(sub.totalPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-600 dark:text-emerald-400\`}>{fmtCur(sub.paidPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-rose-600 dark:text-rose-400\`}>{fmtCur(sub.target)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-muted-foreground\`}>{fmtCur(sub.posPaidOnlyPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold\`}>
                             <HeatBar pct={subPct} showBar={false} showBadge={true} />
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Global Grand Total Card */}
          {grouped.length > 0 && (
             <div className="mt-2 rounded-xl border border-primary/40 bg-slate-900 dark:bg-[#070910] shadow-[0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse font-sans min-w-[800px] text-xs">
                      <colgroup>
                        {columns.map(col => <col key={col.key} style={{ width: col.width, minWidth: col.minWidth }} />)}
                      </colgroup>
                      <tbody>
                        <tr>
                          <td className={\`\${cellPadding}\`}></td>
                          <td className={\`\${cellPadding} font-extrabold uppercase text-xs tracking-wider text-primary cursor-pointer hover:underline\`} onClick={() => navigateToExplorer({})}>Grand Total</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-400\`}>{fmtCur(grandTotal.collection)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-slate-200\`}>{grandTotal.count.toLocaleString()}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-400\`}>{grandTotal.paid.toLocaleString()}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-blue-400\`}>{grandTotal.posPaidOnlyCount}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-slate-200\`}>{fmtCur(grandTotal.totalPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-emerald-400\`}>{fmtCur(grandTotal.paidPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-rose-400\`}>
                            <div className="flex flex-col items-end leading-tight">
                              <span>{fmtCur(grandTotal.target)}</span>
                              <span className="text-[9px] text-amber-300 font-mono">DRR: ₹{fmtCur(grandTotal.dailyRequiredPOS)}</span>
                            </div>
                          </td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold text-slate-400\`}>{fmtCur(grandTotal.posPaidOnlyPOS)}</td>
                          <td className={\`\${cellPadding} text-right font-mono font-bold\`}>
                            <HeatBar pct={grandPct} showBar={false} showBadge={true} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                </div>
             </div>
          )}
        </div>`;
        
  code = code.replace(gridPattern, newGrid);
  
  // also fix some alignment issues
  fs.writeFileSync(file, code);
}

rewritePage('src/pages/CityPivot.tsx', false);
rewritePage('src/pages/TeamPivot.tsx', true);
