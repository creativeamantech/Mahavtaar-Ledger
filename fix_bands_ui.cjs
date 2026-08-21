const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf-8');

// The Table UI for the bands

const oldTableUI = `<table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold bg-muted/90">City</th>
                  <th className="px-4 py-3 font-semibold text-right bg-muted/90">Cases</th>
                  <th className="px-4 py-3 font-semibold text-right bg-muted/90">Total POS</th>
                  <th className="px-4 py-3 font-semibold text-center bg-muted" colSpan={4}>POS Bands (Cases)</th>
                </tr>
                <tr className="border-t border-border/50 text-[10px]">
                  <th colSpan={3} className="bg-muted/90"></th>
                  <th className="px-2 py-1 text-center font-medium bg-muted border-l border-border/30">&lt; 1k</th>
                  <th className="px-2 py-1 text-center font-medium bg-muted">1k-10k</th>
                  <th className="px-2 py-1 text-center font-medium bg-muted">10k-50k</th>
                  <th className="px-2 py-1 text-center font-medium bg-muted border-r border-border/30">&gt; 50k</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.cityData.slice(0, 50).map(c => (
                  <tr key={c.city} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{c.city}</td>
                    <td className="px-4 py-2 text-right">{c.cases.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtCur(c.pos)}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10 border-l border-border/30">{c.bands['<1k'] > 0 ? c.bands['<1k'] : '-'}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10">{c.bands['1k-10k'] > 0 ? c.bands['1k-10k'] : '-'}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10">{c.bands['10k-50k'] > 0 ? c.bands['10k-50k'] : '-'}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10 border-r border-border/30">{c.bands['50k+'] > 0 ? c.bands['50k+'] : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>`;

const newTableUI = `<table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold bg-muted/90">City</th>
                  <th className="px-4 py-3 font-semibold text-right bg-muted/90">Cases</th>
                  <th className="px-4 py-3 font-semibold text-right bg-muted/90">Total POS</th>
                  <th className="px-4 py-3 font-semibold text-center bg-muted" colSpan={stats.sortedBands.length}>POS Bands (Cases)</th>
                </tr>
                <tr className="border-t border-border/50 text-[10px]">
                  <th colSpan={3} className="bg-muted/90"></th>
                  {stats.sortedBands.map((band, idx) => (
                      <th key={band} className={\`px-2 py-1 text-center font-medium bg-muted \${idx === 0 ? 'border-l border-border/30' : ''} \${idx === stats.sortedBands.length - 1 ? 'border-r border-border/30' : ''}\`}>
                          {band}
                      </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.cityData.slice(0, 50).map(c => (
                  <tr key={c.city} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{c.city}</td>
                    <td className="px-4 py-2 text-right">{c.cases.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtCur(c.pos)}</td>
                    {stats.sortedBands.map((band, idx) => {
                        const val = c.bands[band];
                        return (
                          <td key={band} className={\`px-2 py-2 text-center text-xs bg-muted/10 \${idx === 0 ? 'border-l border-border/30' : ''} \${idx === stats.sortedBands.length - 1 ? 'border-r border-border/30' : ''}\`}>
                              {val > 0 ? val : '-'}
                          </td>
                        )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>`;

code = code.replace(oldTableUI, newTableUI);

fs.writeFileSync(path, code);
console.log('Fixed bands UI in Dashboard');
