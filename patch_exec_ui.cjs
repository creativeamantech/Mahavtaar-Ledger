const fs = require('fs');
const file = 'src/pages/ExecDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Header
content = content.replace(
  '<h1 className="text-3xl font-sans font-black tracking-tight mb-2">Operations Dashboard</h1>',
  '<h1 className="text-3xl font-sans font-black tracking-tight mb-2">Executive Overview</h1>'
);
content = content.replace(
  '<p className="text-muted-foreground text-sm max-w-2xl">',
  '<p className="text-muted-foreground text-sm max-w-2xl">Executive drill-down separated by Team Paid vs POS Paid Only. '
);

// Stat cards at top
const oldTopCards = `        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
              <Activity className="w-32 h-32 -mt-4 -mr-4" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">Total Recovered</span>
            </div>
            <div className="text-3xl font-bold text-primary">{fmtCur(stats.totalCollection)}</div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
              <Database className="w-32 h-32 -mt-4 -mr-4" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-destructive/10 rounded-lg text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">Total Allocation (POS)</span>
            </div>
            <div className="text-3xl font-bold text-destructive">{fmtCur(stats.bucketData.reduce((acc, b) => acc + b.pos, 0))}</div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-success/10 rounded-lg text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">PTP / Contacted</span>
            </div>
            <div className="text-3xl font-bold">{Math.floor(stats.totalCollection * 0.08).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Simulated PTP count based on collections</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-info/10 rounded-lg text-info">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">Active Teams</span>
            </div>
            <div className="text-3xl font-bold">{stats.cityData.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Cities with active allocations</p>
          </div>
        </div>`;

const newTopCards = `        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-success/10 rounded-lg text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">Team Paid (POS)</span>
            </div>
            <div className="text-3xl font-bold text-success">{fmtCur(stats.teamPaidPosSum)}</div>
            <p className="text-xs text-muted-foreground mt-2">POS recovered directly by team efforts</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-info/10 rounded-lg text-info">
                <Database className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">POS Paid Only</span>
            </div>
            <div className="text-3xl font-bold text-info">{fmtCur(stats.posPaidOnlyPosSum)}</div>
            <p className="text-xs text-muted-foreground mt-2">Accounts settled/cleared externally</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">Total Collection</span>
            </div>
            <div className="text-3xl font-bold text-primary">{fmtCur(stats.totalCollection)}</div>
            <p className="text-xs text-muted-foreground mt-2">Combined DAC/Collection amount</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2.5 bg-destructive/10 rounded-lg text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider">Total Allocation (POS)</span>
            </div>
            <div className="text-3xl font-bold text-destructive">{fmtCur(stats.bucketData.reduce((acc, b) => acc + b.pos, 0))}</div>
            <p className="text-xs text-muted-foreground mt-2">Overall open portfolio POS</p>
          </div>
        </div>`;
content = content.replace(oldTopCards, newTopCards);

// Charts
content = content.replace(
  '<Bar yAxisId="left" dataKey="pos" name="Total POS" fill="hsl(var(--primary)/0.7)" radius={[4, 4, 0, 0]} />',
  '<Bar yAxisId="left" dataKey="pos" name="Total POS" fill="hsl(var(--primary)/0.7)" radius={[4, 4, 0, 0]} />\n                <Bar yAxisId="right" dataKey="teamPaid" name="Team Paid Cases" fill="hsl(var(--success)/0.8)" radius={[4, 4, 0, 0]} />\n                <Bar yAxisId="right" dataKey="posPaidOnly" name="POS Paid Only Cases" fill="hsl(var(--info)/0.8)" radius={[4, 4, 0, 0]} />'
);

// Table 1 Header
content = content.replace(
  '<th className="px-4 py-2 font-semibold text-right">Paid</th>',
  '<th className="px-4 py-2 font-semibold text-right text-success">Team Paid</th>\n                  <th className="px-4 py-2 font-semibold text-right text-info">POS Paid Only</th>'
);
// Table 1 Rows
content = content.replace(
  '<td className="px-4 py-2 text-right text-success font-medium cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket, paid: \'Paid\' })}>{b.paid.toLocaleString()}</td>',
  '<td className="px-4 py-2 text-right text-success font-medium cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{b.teamPaid.toLocaleString()}</td>\n                    <td className="px-4 py-2 text-right text-info font-medium cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{b.posPaidOnly.toLocaleString()}</td>'
);
// Table 1 Footer
content = content.replace(
  '<td className="px-4 py-2 text-right text-success hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ paid: \'Paid\' }); }}>{stats.bucketData.reduce((a, b) => a + b.paid, 0).toLocaleString()}</td>',
  '<td className="px-4 py-2 text-right text-success font-bold">{stats.bucketData.reduce((a, b) => a + b.teamPaid, 0).toLocaleString()}</td>\n                  <td className="px-4 py-2 text-right text-info font-bold">{stats.bucketData.reduce((a, b) => a + b.posPaidOnly, 0).toLocaleString()}</td>'
);

// Table 2 City Bucket Pivot (removing Unpaid and replacing Paid with TeamPaid / PosPaidOnly)
content = content.replace(
  '<th className="px-2 py-2 font-semibold text-center border-b border-border bg-card">Paid</th>',
  '<th className="px-2 py-2 font-semibold text-center border-b border-border bg-card text-success">Team<br/>Paid</th>'
);
content = content.replace(
  '<th className="px-2 py-2 font-semibold text-center border-b border-border border-r bg-card">Unpaid</th>',
  '<th className="px-2 py-2 font-semibold text-center border-b border-border border-r bg-card text-info">POS Paid<br/>Only</th>'
);

const oldCityBucketRow = `const bData = c.buckets[b.bucket] || { paid: 0, unpaid: 0 };
                      return (
                        <React.Fragment key={b.bucket}>
                          <td className="px-2 py-2 text-center text-success font-medium bg-success/5 cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Paid' })}>{bData.paid > 0 ? bData.paid : '-'}</td>
                          <td className="px-2 py-2 text-center text-muted-foreground border-r border-border/50 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Unpaid' })}>{bData.unpaid > 0 ? bData.unpaid : '-'}</td>
                        </React.Fragment>
                      );`;

const newCityBucketRow = `const bData = c.buckets[b.bucket] || { teamPaid: 0, posPaidOnly: 0 };
                      return (
                        <React.Fragment key={b.bucket}>
                          <td className="px-2 py-2 text-center text-success font-medium bg-success/5 cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket })}>{bData.teamPaid > 0 ? bData.teamPaid : '-'}</td>
                          <td className="px-2 py-2 text-center text-info font-medium bg-info/5 border-r border-border/50 cursor-pointer hover:bg-info/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket })}>{bData.posPaidOnly > 0 ? bData.posPaidOnly : '-'}</td>
                        </React.Fragment>
                      );`;
content = content.replace(oldCityBucketRow, newCityBucketRow);

const oldCityBucketFooter = `<td className="px-2 py-2 text-center text-success cursor-pointer hover:bg-success/20 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ bucket: b.bucket, paid: 'Paid' }); }}>{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.paid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center border-r border-border/50 text-muted-foreground cursor-pointer hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ bucket: b.bucket, paid: 'Unpaid' }); }}>{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.unpaid || 0), 0).toLocaleString()}</td>`;

const newCityBucketFooter = `<td className="px-2 py-2 text-center text-success font-bold bg-success/5">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.teamPaid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center font-bold bg-info/5 border-r border-border/50 text-info">{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.posPaidOnly || 0), 0).toLocaleString()}</td>`;
content = content.replace(oldCityBucketFooter, newCityBucketFooter);

fs.writeFileSync(file, content);
console.log('ExecDashboard UI patched');
