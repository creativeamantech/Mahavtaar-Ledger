const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// First Table (Bucket)
code = code.replace(
  /<td className="px-4 py-2 font-medium">\{b\.bucket\}<\/td>/g,
  '<td className="px-4 py-2 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{b.bucket}</td>'
);
code = code.replace(
  /<td className="px-4 py-2 text-right">\{b\.cases\.toLocaleString\(\)\}<\/td>/g,
  '<td className="px-4 py-2 text-right cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{b.cases.toLocaleString()}</td>'
);
code = code.replace(
  /<td className="px-4 py-2 text-right">\{fmtCur\(b\.pos\)\}<\/td>/g,
  '<td className="px-4 py-2 text-right cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{fmtCur(b.pos)}</td>'
);
code = code.replace(
  /<td className="px-4 py-2 text-right text-success font-medium">\{b\.paid\.toLocaleString\(\)\}<\/td>/g,
  '<td className="px-4 py-2 text-right text-success font-medium cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket, paid: \\\'Paid\\\' })}>{b.paid.toLocaleString()}</td>'
);
code = code.replace(
  /<td className="px-4 py-2 text-right text-muted-foreground">\{b\.unpaid\.toLocaleString\(\)\}<\/td>/g,
  '<td className="px-4 py-2 text-right text-muted-foreground cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket, paid: \\\'Unpaid\\\' })}>{b.unpaid.toLocaleString()}</td>'
);

// Second Table: the Grand Total line 1
const tfootBucketMatch = `<tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = globalBucket === 'ALL' ? '/explorer' : \`/explorer?bucket=\${globalBucket}\`}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.bucketData.reduce((a, b) => a + b.cases, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{fmtCur(stats.bucketData.reduce((a, b) => a + b.pos, 0))}</td>
                  <td className="px-4 py-2 text-right text-success">{stats.bucketData.reduce((a, b) => a + b.paid, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{stats.bucketData.reduce((a, b) => a + b.unpaid, 0).toLocaleString()}</td>
                </tr>
              </tfoot>`;
const tfootBucketRep = `<tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigateToExplorer({})}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.bucketData.reduce((a, b) => a + b.cases, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{fmtCur(stats.bucketData.reduce((a, b) => a + b.pos, 0))}</td>
                  <td className="px-4 py-2 text-right text-success hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ paid: 'Paid' }); }}>{stats.bucketData.reduce((a, b) => a + b.paid, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ paid: 'Unpaid' }); }}>{stats.bucketData.reduce((a, b) => a + b.unpaid, 0).toLocaleString()}</td>
                </tr>
              </tfoot>`;
code = code.replace(tfootBucketMatch, tfootBucketRep);

// Top Cities footer tfoot wrapper update
code = code.replace(
  /<tfoot className="bg-primary\/10 font-bold sticky bottom-0 z-10 shadow-\[0_-2px_10px_rgba\(0,0,0,0\.05\)\] cursor-pointer hover:bg-primary\/20 transition-colors" onClick=\{[^\}]+\}>/,
  '<tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigateToExplorer({})}>'
);

// Third Table (City by Bucket Paid/Unpaid Drilldown)
// We already matched some of it.
code = code.replace(
  /<td className="px-4 py-2 font-medium">\{c\.city\}<\/td>\s*<td className="px-4 py-2 text-right border-r border-border font-semibold">\{c\.cases\.toLocaleString\(\)\}<\/td>/g,
  '<td className="px-4 py-2 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: c.city })}>{c.city}</td><td className="px-4 py-2 text-right border-r border-border font-semibold cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ city: c.city })}>{c.cases.toLocaleString()}</td>'
);

code = code.replace(
  /<td className="px-2 py-2 text-center text-success font-medium bg-success\/5">\{bData\.paid > 0 \? bData\.paid : '-'}<\/td>\s*<td className="px-2 py-2 text-center text-muted-foreground border-r border-border\/50">\{bData\.unpaid > 0 \? bData\.unpaid : '-'}<\/td>/g,
  '<td className="px-2 py-2 text-center text-success font-medium bg-success/5 cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: \\\'Paid\\\' })}>{bData.paid > 0 ? bData.paid : \\\'-\\\'}</td><td className="px-2 py-2 text-center text-muted-foreground border-r border-border/50 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: \\\'Unpaid\\\' })}>{bData.unpaid > 0 ? bData.unpaid : \\\'-\\\'}</td>'
);

// Tfoot for Third Table
const tfootCityBucketMatch = `                  <td className="px-4 py-2 text-right">{stats.cityData.reduce((a, c) => a + c.cases, 0).toLocaleString()}</td>
                  {stats.bucketData.map(b => (
                      <Fragment key={'ft2'+b.bucket}>
                          <td className="px-2 py-2 text-center text-success">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.paid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center border-r border-border/50 text-muted-foreground">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.unpaid || 0), 0).toLocaleString()}</td>
                      </Fragment>
                  ))}
                </tr>
              </tfoot>`;
const tfootCityBucketRep = `                  <td className="px-4 py-2 text-right">{stats.cityData.reduce((a, c) => a + c.cases, 0).toLocaleString()}</td>
                  {stats.bucketData.map(b => (
                      <Fragment key={'ft2'+b.bucket}>
                          <td className="px-2 py-2 text-center text-success cursor-pointer hover:bg-success/20 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ bucket: b.bucket, paid: 'Paid' }); }}>{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.paid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center border-r border-border/50 text-muted-foreground cursor-pointer hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ bucket: b.bucket, paid: 'Unpaid' }); }}>{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.unpaid || 0), 0).toLocaleString()}</td>
                      </Fragment>
                  ))}
                </tr>
              </tfoot>`;
code = code.replace(tfootCityBucketMatch, tfootCityBucketRep);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Updated other tables in dashboard");
