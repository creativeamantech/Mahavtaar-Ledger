const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const t3match = `            </tbody>\n          </table>\n        </div>\n      </div>`;

if (code.includes(t3match)) {
const t3rep = `            </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = globalBucket === 'ALL' ? '/explorer' : \`/explorer?bucket=\${globalBucket}\`}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.cityData.reduce((a, c) => a + c.cases, 0).toLocaleString()}</td>
                  {stats.bucketData.map(b => (
                      <Fragment key={'ft2'+b.bucket}>
                          <td className="px-2 py-2 text-center text-success">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.paid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center border-r border-border/50 text-muted-foreground">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.unpaid || 0), 0).toLocaleString()}</td>
                      </Fragment>
                  ))}
                </tr>
              </tfoot>
          </table>
        </div>
        <div className="p-3 border-t border-border bg-muted/10 text-right">
             <button onClick={() => {
                 let headerRow = 'City,Total Cases,' + stats.bucketData.map(b => \`Bkt \${b.bucket} Paid,Bkt \${b.bucket} Unpaid\`).join(',');
                 const csv = [headerRow, ...stats.cityData.map(c => \`"\${c.city}",\${c.cases},\${stats.bucketData.map(b => (c.buckets[b.bucket]?.paid || 0) + ',' + (c.buckets[b.bucket]?.unpaid || 0)).join(',')}\`)].join('\\n');
                 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'City_Bucket_Drilldown.csv'; a.click();
             }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
               <Download className="h-3.5 w-3.5" /> Export Data
             </button>
        </div>
      </div>`;
    code = code.replace(t3match, t3rep);
    fs.writeFileSync('src/pages/Dashboard.tsx', code);
    console.log("Fixed table 3");
} else {
    console.log("Could not find table 3 match");
}
