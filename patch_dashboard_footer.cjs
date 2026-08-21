const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Add Download import if not there
if (!code.includes('Download,')) {
    code = code.replace("Filter } from 'lucide-react';", "Filter, Download } from 'lucide-react';");
}

const table1Target = `              </tbody>
            </table>
          </div>
        </div>`;
const table1Footer = `              </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = '/explorer'}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.bucketData.reduce((a, b) => a + b.cases, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{fmtCur(stats.bucketData.reduce((a, b) => a + b.pos, 0))}</td>
                  <td className="px-4 py-2 text-right text-success">{stats.bucketData.reduce((a, b) => a + b.paid, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{stats.bucketData.reduce((a, b) => a + b.unpaid, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-3 border-t border-border bg-muted/10 text-right">
             <button onClick={() => {
                 const csv = ['Bucket,Cases,POS Amount,Paid,Unpaid', ...stats.bucketData.map(b => \`"\${b.bucket}",\${b.cases},\${b.pos},\${b.paid},\${b.unpaid}\`)].join('\\n');
                 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'Bucket_Performance.csv'; a.click();
             }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
               <Download className="h-3.5 w-3.5" /> Export Data
             </button>
          </div>
        </div>`;
code = code.replace(table1Target, table1Footer);

const table2Target = `              </tbody>
            </table>
          </div>
          {stats.cityData.length > 50 && (`;
const table2Footer = `              </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = '/explorer'}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.cityData.reduce((a, c) => a + c.cases, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{fmtCur(stats.cityData.reduce((a, c) => a + c.pos, 0))}</td>
                  {stats.sortedBands.map((band, idx) => (
                      <td key={'ft'+band} className="px-2 py-2 text-center">
                          {stats.cityData.reduce((a, c) => a + (c.bands[band] || 0), 0).toLocaleString()}
                      </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-3 border-t border-border bg-muted/10 flex justify-between items-center">
             <span className="text-xs text-muted-foreground">{stats.cityData.length > 50 ? \`Showing top 50 of \${stats.cityData.length} cities\` : \`Showing all \${stats.cityData.length} cities\`}</span>
             <button onClick={() => {
                 const csv = ['City,Cases,Total POS,' + stats.sortedBands.join(','), ...stats.cityData.map(c => \`"\${c.city}",\${c.cases},\${c.pos},\${stats.sortedBands.map(b => c.bands[b] || 0).join(',')}\`)].join('\\n');
                 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'City_Bandwise.csv'; a.click();
             }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
               <Download className="h-3.5 w-3.5" /> Export Full Data
             </button>
          </div>
          {false && (`;
code = code.replace(table2Target, table2Footer);

const table3Target = `              </tbody>
          </table>
        </div>
      </div>`;
const table3Footer = `              </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = '/explorer'}>
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
code = code.replace(table3Target, table3Footer);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Dashboard footers and exports");
