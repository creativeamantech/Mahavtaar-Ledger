const fs = require('fs');
const file = 'src/pages/ExecDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Table 1 CSV Export
content = content.replace(
  "const csv = ['Bucket,Cases,POS Amount,Team Paid,POS Paid Only', ...stats.bucketData.map(b => \`\"$\{b.bucket}\",$\{b.cases},$\{b.pos},$\{b.teamPaid},$\{b.posPaidOnly}\`)].join('\\n');",
  "const csv = ['Bucket,Cases,POS Amount,Team Paid,POS Paid Only,Unpaid', ...stats.bucketData.map(b => \`\"$\{b.bucket}\",$\{b.cases},$\{b.pos},$\{b.teamPaid},$\{b.posPaidOnly},$\{b.unpaid}\`)].join('\\n');"
);

// 2. Fix Table 2 Head
content = content.replace(
  "                  <th key={b.bucket} colSpan={2} className=\"px-4 py-2 font-semibold text-center border-b border-border border-r bg-muted/80\">",
  "                  <th key={b.bucket} colSpan={3} className=\"px-4 py-2 font-semibold text-center border-b border-border border-r bg-muted/80\">"
);

// 3. Fix Table 2 Sub-Headers
const oldSubHeaders = `<Fragment key={b.bucket}>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border bg-card text-success">Team<br/>Paid</th>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border border-r bg-card text-info">POS Paid<br/>Only</th>
                  </Fragment>`;
const newSubHeaders = `<Fragment key={b.bucket}>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border bg-card text-success">Team<br/>Paid</th>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border bg-card text-info">POS Paid<br/>Only</th>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border border-r bg-card text-muted-foreground">Unpaid</th>
                  </Fragment>`;
content = content.replace(oldSubHeaders, newSubHeaders);

// 4. Fix Table 2 Body Rows
const oldBodyRows = `                  {stats.bucketData.map(b => {
                    const bData = c.buckets[b.bucket] || { paid: 0, unpaid: 0 };
                    return (
                      <Fragment key={b.bucket}>
                        <td className="px-2 py-2 text-center text-success font-medium bg-success/5 cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Paid' })}>{bData.paid > 0 ? bData.paid : '-'}</td><td className="px-2 py-2 text-center text-muted-foreground border-r border-border/50 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Unpaid' })}>{bData.unpaid > 0 ? bData.unpaid : '-'}</td>
                      </Fragment>
                    );
                  })}`;
const newBodyRows = `                  {stats.bucketData.map(b => {
                    const bData = c.buckets[b.bucket] || { teamPaid: 0, posPaidOnly: 0, unpaid: 0 };
                    return (
                      <Fragment key={b.bucket}>
                        <td className="px-2 py-2 text-center text-success font-medium bg-success/5 cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket })}>{bData.teamPaid > 0 ? bData.teamPaid : '-'}</td>
                        <td className="px-2 py-2 text-center text-info font-medium bg-info/5 cursor-pointer hover:bg-info/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket })}>{bData.posPaidOnly > 0 ? bData.posPaidOnly : '-'}</td>
                        <td className="px-2 py-2 text-center text-muted-foreground border-r border-border/50 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Unpaid' })}>{bData.unpaid > 0 ? bData.unpaid : '-'}</td>
                      </Fragment>
                    );
                  })}`;
content = content.replace(oldBodyRows, newBodyRows);

// 5. Fix Table 2 Footer
const oldFooter = `                  {stats.bucketData.map(b => (
                      <Fragment key={'ft2'+b.bucket}>
                          <td className="px-2 py-2 text-center text-success font-bold bg-success/5">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.teamPaid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center font-bold bg-info/5 border-r border-border/50 text-info">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.posPaidOnly || 0), 0).toLocaleString()}</td>
                      </Fragment>
                  ))}`;
const newFooter = `                  {stats.bucketData.map(b => (
                      <Fragment key={'ft2'+b.bucket}>
                          <td className="px-2 py-2 text-center text-success font-bold bg-success/5">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.teamPaid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center font-bold bg-info/5 text-info">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.posPaidOnly || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center font-bold bg-muted/10 border-r border-border/50 text-muted-foreground">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.unpaid || 0), 0).toLocaleString()}</td>
                      </Fragment>
                  ))}`;
content = content.replace(oldFooter, newFooter);

// 6. Fix Table 2 CSV
const oldCsvBlock = `                 let headerRow = 'City,Total Cases,' + stats.bucketData.map(b => \`Bkt \${b.bucket} Paid,Bkt \${b.bucket} Unpaid\`).join(',');
                 const csv = [headerRow, ...stats.cityData.map(c => \`"\${c.city}",\${c.cases},\${stats.bucketData.map(b => (c.buckets[b.bucket]?.paid || 0) + ',' + (c.buckets[b.bucket]?.unpaid || 0)).join(',')}\`)].join('\\n');`;

const newCsvBlock = `                 let headerRow = 'City,Total Cases,' + stats.bucketData.map(b => \`Bkt \${b.bucket} Team Paid,Bkt \${b.bucket} POS Paid Only,Bkt \${b.bucket} Unpaid\`).join(',');
                 const csv = [headerRow, ...stats.cityData.map(c => \`"\${c.city}",\${c.cases},\${stats.bucketData.map(b => (c.buckets[b.bucket]?.teamPaid || 0) + ',' + (c.buckets[b.bucket]?.posPaidOnly || 0) + ',' + (c.buckets[b.bucket]?.unpaid || 0)).join(',')}\`)].join('\\n');`;
content = content.replace(oldCsvBlock, newCsvBlock);

// 7. Fix Table 1 (Bucket Table) CSV which was not completely changed in previous version
const t1CsvOld = "const csv = ['Bucket,Cases,POS Amount,Paid,Unpaid', ...stats.bucketData.map(b => \`\"${b.bucket}\",${b.cases},${b.pos},${b.paid},${b.unpaid}\`)].join('\\n');";
const t1CsvNew = "const csv = ['Bucket,Cases,POS Amount,Team Paid,POS Paid Only,Unpaid', ...stats.bucketData.map(b => \`\"${b.bucket}\",${b.cases},${b.pos},${b.teamPaid},${b.posPaidOnly},${b.unpaid}\`)].join('\\n');";
if (content.includes(t1CsvOld)) {
  content = content.replace(t1CsvOld, t1CsvNew);
}

fs.writeFileSync(file, content);
console.log('ExecDashboard tables fixed!');
