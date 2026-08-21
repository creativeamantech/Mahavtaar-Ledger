const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldModalStart = `<Sheet open={!!multiCaseModal} onOpenChange={(o) => !o && setMultiCaseModal(null)}>`;
const oldModalEnd = `</Sheet>
    </AppLayout>`;

const newModal = `{multiCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-7xl max-h-[90vh] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h2 className="text-xl font-heading font-bold text-foreground">{multiCaseModal.name || 'Multiple Cases'}</h2>
                <p className="font-sans font-medium text-sm text-muted-foreground">{multiCaseModal.records.length} Related Cases Found</p>
              </div>
              <button onClick={() => setMultiCaseModal(null)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-card">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur shadow-sm">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bucket</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">State</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">City</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Executive</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">POS</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">EMI</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">ECS</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">DAC</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="font-data text-[12px]">
                  {multiCaseModal.records.map((r, idx) => {
                    const c = calculateRow(r);
                    const isPaid = c.mainPaid === 1;
                    return (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-primary font-bold cursor-pointer hover:underline" onClick={() => { setMultiCaseModal(null); setSelectedRecord(r); }}>
                          {r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold">{r.bom_bkt}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.state || r.State || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.city || r.City || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.executive_name || r['Executive Name'] || '-'}</td>
                        <td className="px-4 py-3 text-right font-bold">{fmtCur(Number(r.principal_outstanding) || 0)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmtCur(Number(r.emi_amt) || 0)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmtCur(Number(r.ecs ?? r.ECS) || 0)}</td>
                        <td className="px-4 py-3 text-right text-info font-bold">{fmtCur(Number(r.dac ?? r.DAC) || 0)}</td>
                        <td className="px-4 py-3 text-right">
                          {isPaid 
                            ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success uppercase tracking-wider">Paid</span>
                            : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Unpaid</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>`;

const startIdx = content.indexOf(oldModalStart);
if (startIdx !== -1) {
  const endIdx = content.indexOf('</Sheet>', startIdx) + 8;
  const layoutEndIdx = content.indexOf('</AppLayout>', endIdx) + 12;
  
  if (layoutEndIdx !== -1) {
    const before = content.substring(0, startIdx);
    content = before + newModal + '\\n  );\\n}\\n';
    fs.writeFileSync(file, content);
    console.log("Successfully replaced multiCaseModal Sheet with table modal.");
  } else {
    console.log("Could not find layout end");
  }
} else {
  console.log("Could not find start index");
}
