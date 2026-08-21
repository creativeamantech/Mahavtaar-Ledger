const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

const nameStatsInject = `
  const nameStats = useMemo(() => {
    const stats: Record<string, { count: number, totalPos: number }> = {};
    baseRecords.forEach((r: any) => {
      const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
      const name = String(rawName).trim().toUpperCase();
      if (name && name !== '-') {
        if (!stats[name]) stats[name] = { count: 0, totalPos: 0 };
        stats[name].count += 1;
        stats[name].totalPos += Number(r.principal_outstanding) || 0;
      }
    });
    return stats;
  }, [baseRecords]);
`;

if (!content.includes('const nameStats = useMemo')) {
  content = content.replace(
    "const availableExecutives = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim()).filter(Boolean))).sort()], [baseRecords]);",
    "const availableExecutives = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim()).filter(Boolean))).sort()], [baseRecords]);\n" + nameStatsInject
  );
}

const oldTd = `<td className="px-2 py-1.5 text-primary cursor-pointer hover:underline font-semibold" onClick={() => setSelectedRecord(r)}>{r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}</td>`;

const newTd = `                      <td className="px-2 py-1.5 cursor-pointer group" onClick={() => {
                        const cName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-';
                        if (cName !== '-') {
                          setSearchQuery(cName);
                          // Clear other filters so the user sees all matches
                          setSelectedState('All');
                          setSelectedCity('All');
                          setSelectedExecutive('All');
                          setSelectedPaidStatus('All');
                          setCustomFilterValues({});
                          setActiveCustomFilters([]);
                        }
                      }}>
                        <div className="flex flex-col">
                          <span className="text-primary group-hover:underline font-semibold">
                            {r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}
                          </span>
                          {(() => {
                            const cName = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '').trim().toUpperCase();
                            const stats = nameStats[cName];
                            if (stats && stats.count > 1) {
                              return (
                                <span className="text-[9px] font-bold text-muted-foreground mt-0.5 bg-muted/50 px-1 py-0.5 rounded w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  {stats.count} CASES • {fmtCur(stats.totalPos)}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>`;

if (content.includes(oldTd)) {
  content = content.replace(oldTd, newTd);
  console.log("Patched td successfully");
} else {
  console.log("Could not find td to patch");
}

fs.writeFileSync(file, content);
