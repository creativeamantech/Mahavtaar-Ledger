const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

// 1. We replace the ResponsiveFilter section and the Table headers/body.
// We can just construct a completely new UI part starting from `return (` inside `if (isLoading)` and `return (` at the end.

const newContent = `
  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-10 w-48 bg-muted rounded-md mb-4" />
          <div className="h-20 w-full bg-card border border-border rounded-xl" />
          <div className="h-[500px] w-full bg-card border border-border rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Data Explorer
          </h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">Raw record inspection and drill-down analysis</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm shrink-0">
          {filteredRecords.length.toLocaleString()} Records Found
        </div>
      </div>

      {/* Primary Bucket Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Primary Bucket:</span>
        {availableBuckets.map(b => (
          <button
            key={b}
            onClick={() => setSelectedBucket(b)}
            className={\`px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-wider rounded-full transition-all border \${
              selectedBucket === b 
                ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' 
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }\`}
          >
            {b === 'All' ? 'All Buckets' : \`Bucket \${b}\`}
          </button>
        ))}
      </div>

      {/* Consolidated Secondary Filters */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-3 mb-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Paid Status</span>
            <select value={selectedPaidStatus} onChange={e => setSelectedPaidStatus(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              <option value="All">All Cases</option>
              <option value="Paid">Main Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">State</span>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">City</span>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableCities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Executive</span>
            <select value={selectedExecutive} onChange={e => setSelectedExecutive(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableExecutives.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ml-auto shrink-0">
            <button 
              onClick={() => {
                setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All');
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider underline underline-offset-2 transition-colors"
            >
              Clear Secondary
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Name</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bucket</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">State</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">City</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Executive</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">POS</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">EMI</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">ECS</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">DAC</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="font-data text-[11px]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs">No records match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r: any, idx: number) => {
                  const c = calculateRow(r);
                  const isPaid = c.mainPaid === 1;
                  return (
                    <tr key={r.id || idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-1.5 text-primary font-bold cursor-pointer hover:underline" onClick={() => setSelectedRecord(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}</td>
                      <td className="px-2 py-1.5 text-primary cursor-pointer hover:underline font-semibold" onClick={() => setSelectedRecord(r)}>{r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}</td>
                      <td className="px-2 py-1.5 text-foreground font-bold">{r.bom_bkt}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{r.state || r.State || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{r.city || r.City || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{r.executive_name || r['Executive Name'] || '-'}</td>
                      <td className="px-2 py-1.5 text-right font-bold text-foreground">{fmtCur(Number(r.principal_outstanding) || 0)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{fmtCur(Number(r.emi_amt) || 0)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{fmtCur(Number(r.ecs ?? r.ECS) || 0)}</td>
                      <td className="px-2 py-1.5 text-right text-info font-bold">{fmtCur(Number(r.dac ?? r.DAC) || 0)}</td>
                      <td className="px-2 py-1.5 text-right">
                        {isPaid 
                          ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-success/20 text-success uppercase tracking-wider">Paid</span>
                          : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Unpaid</span>
                        }
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-card border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-card border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={!!selectedRecord} onOpenChange={(o) => !o && setSelectedRecord(null)}>
        <SheetContent className="w-full sm:max-w-md bg-card p-0 border-l border-border flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border bg-muted/10">
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-xl font-heading font-bold text-foreground">
                  {selectedRecord?.customer_name || selectedRecord?.CUSTOMERNAME || '-'}
                </SheetTitle>
                <SheetDescription className="font-data font-medium text-primary mt-1">
                  Aggr: {selectedRecord?.agreementid || selectedRecord?.agreement_no || '-'}
                </SheetDescription>
              </div>
              <Badge variant="outline" className="uppercase font-bold tracking-wider">{selectedRecord?.bom_bkt ? \`BKT \${selectedRecord.bom_bkt}\` : ''}</Badge>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</p>
                  <p className="font-sans text-sm font-semibold">{selectedRecord?.state || selectedRecord?.State || '-'}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City</p>
                  <p className="font-sans text-sm font-semibold">{selectedRecord?.city || selectedRecord?.City || '-'}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Executive</p>
                  <p className="font-sans text-sm font-semibold">{selectedRecord?.executive_name || selectedRecord?.['Executive Name'] || '-'}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                  <p className="font-sans text-sm font-semibold">
                    {calculateRow(selectedRecord || {}).mainPaid === 1 ? <span className="text-success flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success"></span>Paid</span> : <span className="text-muted-foreground flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>Unpaid</span>}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border"></span>
                  Financial Summary
                  <span className="h-px flex-1 bg-border"></span>
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">Principal Outstanding (POS)</span>
                    <span className="font-data font-bold text-foreground">{fmtCur(Number(selectedRecord?.principal_outstanding) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">EMI Amount</span>
                    <span className="font-data font-bold">{fmtCur(Number(selectedRecord?.emi_amt) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">Collection (DAC)</span>
                    <span className="font-data font-bold text-info">{fmtCur(Number(selectedRecord?.dac ?? selectedRecord?.DAC) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">ECS</span>
                    <span className="font-data font-bold text-info">{fmtCur(Number(selectedRecord?.ecs ?? selectedRecord?.ECS) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">Special</span>
                    <span className="font-data font-bold text-info">{fmtCur(Number(selectedRecord?.special ?? selectedRecord?.Special) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors border-t border-border mt-2 pt-4">
                    <span className="text-muted-foreground font-semibold">Total Cleared</span>
                    <span className="font-data font-bold text-success">
                      {fmtCur(calculateRow(selectedRecord || {}).totalCleared)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
`;

const startIndex = code.indexOf('if (isLoading) {');
if (startIndex !== -1) {
    code = code.slice(0, startIndex) + newContent;
    fs.writeFileSync(path, code);
    console.log("Successfully replaced DataExplorer UI block");
} else {
    console.log("Could not find start index");
}

