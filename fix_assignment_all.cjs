const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. We remove viewMode stuff and replace the toggles
content = content.replace(
  /<div className="flex bg-muted\/50 p-1 rounded-lg border border-border">[\s\S]*?<div className="h-6 w-px bg-border hidden sm:block mx-1"><\/div>/,
  `
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent">
                <LayoutList className="h-4 w-4" /> Live Stats & Reports
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl bg-card p-0 border-l border-border flex flex-col h-full z-[100]">
              <SheetHeader className="p-6 border-b border-border bg-muted/10">
                <SheetTitle className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                  <LayoutList className="h-5 w-5 text-primary" /> Reports Sidebar
                </SheetTitle>
                <SheetDescription className="font-sans text-sm font-medium">
                  Live Executive Allocations & Daily History
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {/* Live Stats */}
                  <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[500px]">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-5 w-5 text-info" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Current Live Allocations</h2>
                      </div>
                    </div>
                    <div className="overflow-y-auto scrollbar-thin">
                      {execStatsList.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12 text-sm">No allocated executives found.</div>
                      ) : (
                        <table className="w-full text-xs text-left whitespace-nowrap">
                          <thead className="bg-muted/30 text-muted-foreground uppercase tracking-widest text-[10px] sticky top-0 border-b border-border">
                            <tr>
                              <th className="px-4 py-3 font-bold">Executive</th>
                              <th className="px-4 py-3 font-bold">City</th>
                              <th className="px-4 py-3 font-bold text-center">Count</th>
                              <th className="px-4 py-3 font-bold text-center hidden md:table-cell">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {execStatsList.map((row, i) => {
                              const isFirstForExec = i === 0 || execStatsList[i - 1].exec !== row.exec;
                              return (
                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                  <td className="px-4 py-3 font-medium text-foreground">
                                    {isFirstForExec ? row.exec : ''}
                                  </td>
                                  <td className="px-4 py-3 font-semibold">{row.city}</td>
                                  <td className="px-4 py-3 text-center font-bold">{row.count}</td>
                                  <td className={\`px-4 py-3 text-center font-black hidden md:table-cell \${isFirstForExec ? 'text-primary bg-primary/5 rounded-md' : 'text-transparent'}\`}>
                                    {isFirstForExec ? row.execTotal : ''}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Daily Report */}
                  <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[500px]">
                    <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-warning" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Daily History</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date:</span>
                        <input 
                          type="date"
                          value={reportDate}
                          onChange={e => setReportDate(e.target.value)}
                          className="h-9 px-3 rounded bg-background border border-border text-sm outline-none focus:border-primary shadow-sm cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="overflow-auto scrollbar-thin">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-muted/50 border-b border-border sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Executive</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Assigned</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right hidden sm:table-cell">Total POS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                          {dailyReport.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No assignments recorded on this date.</td></tr>
                          ) : (
                            dailyReport.map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 font-semibold text-foreground">{row.exec}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.city}</td>
                                <td className="px-4 py-3 text-center font-bold text-primary">{row.count}</td>
                                <td className="px-4 py-3 text-right font-medium text-info hidden sm:table-cell">{fmtCur(row.pos)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>`
);

// 2. We remove the {viewMode === 'LIVE' && ... and } wrapping
content = content.replace(/\{viewMode === 'LIVE' && \(\n\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">/, '<div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">');

// 3. We remove lg:col-span-2 from the main city grid
content = content.replace(/<div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">/, '<div className="w-full bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">');

// 4. We remove the right sidebars (Live and Daily) that were in the page body
content = content.replace(/<\!-- Sidebar: Executive Matrix -->[\s\S]*?\{viewMode === 'DAILY' && \([\s\S]*?<\/div>\n\s*<\/div>\n\s*\)}/, '');

// 5. Unhide City and Total columns in City grid, they were accidentally hidden on sm in an earlier script.
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">City<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">City</th>'
);
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell">Total<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Total</th>'
);
content = content.replace(
  /<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-primary hidden sm:table-cell">Allocated<\/th>/,
  '<th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-primary">Allocated</th>'
);

// Remove the one closing div and parenthesis that was from {viewMode === 'LIVE' && (
// It's located right before {/* Assignment Modal overlay */}
content = content.replace(/<\/div>\n\s*\)\}\n\s*\{\/\* Assignment Modal overlay \*\/\}/, '</div>\n\n      {/* Assignment Modal overlay */}');


fs.writeFileSync(file, content);
