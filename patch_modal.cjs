const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update addressKey logic
const oldAddressKey = "addressKey: schema.find(k => k.toLowerCase().includes('address') || k.toLowerCase() === 'add1' || k.toLowerCase().includes('add_1') || k.toLowerCase().includes('res_add')) || null";
const newAddressKey = "addressKey: schema.find(k => k.toLowerCase() === 'mailingaddress') || schema.find(k => k.toLowerCase().includes('address') || k.toLowerCase() === 'add1' || k.toLowerCase().includes('add_1') || k.toLowerCase().includes('res_add')) || null";

if (content.includes(oldAddressKey)) {
  content = content.replace(oldAddressKey, newAddressKey);
  console.log("Patched addressKey");
}

// 2. Add multiCaseModal state
const stateHook = "const [selectedRecord, setSelectedRecord] = useState<any | null>(null);";
const newStateHook = "const [selectedRecord, setSelectedRecord] = useState<any | null>(null);\n  const [multiCaseModal, setMultiCaseModal] = useState<{name: string, records: any[]} | null>(null);";

if (content.includes(stateHook) && !content.includes('multiCaseModal')) {
  content = content.replace(stateHook, newStateHook);
  console.log("Patched multiCaseModal state");
}

// 3. Update the td onClick logic
const oldTdLogic = `setExactCustomerFingerprint(fingerprint);
                          setSearchQuery(''); // clear fuzzy search
                          // Clear other filters so the user sees all matches
                          setSelectedState('All');
                          setSelectedCity('All');
                          setSelectedExecutive('All');
                          setSelectedPaidStatus('All');
                          setCustomFilterValues({});
                          setActiveCustomFilters([]);`;

const newTdLogic = `const stats = customerStats[fingerprint];
                          if (stats && stats.count > 1) {
                            const matched = baseRecords.filter((rec: any) => {
                              const rRawName = rec.customer_name || rec.CUSTOMERNAME || rec['Customer Name'] || rec.CUSTOMER_NAME || rec.customername || '';
                              const rName = String(rRawName).trim().toUpperCase();
                              const rAddr = addressKey ? String(rec[addressKey] || '').trim().toUpperCase() : '';
                              const rCont = contactKey ? String(rec[contactKey] || '').trim().toUpperCase() : '';
                              return \`\${rName}||\${rCont}||\${rAddr}\` === fingerprint;
                            });
                            setMultiCaseModal({ name: name, records: matched });
                          } else {
                            setSelectedRecord(r);
                          }`;

if (content.includes(oldTdLogic)) {
  content = content.replace(oldTdLogic, newTdLogic);
  console.log("Patched td onClick logic");
}

// 4. Add the new Sheet right before the final closing tags
const multiCaseSheetCode = `
      <Sheet open={!!multiCaseModal} onOpenChange={(o) => !o && setMultiCaseModal(null)}>
        <SheetContent className="w-full sm:max-w-2xl bg-card p-0 border-l border-border flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border bg-muted/10">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-xl font-heading font-bold text-foreground">
                {multiCaseModal?.name || 'Multiple Cases'}
              </SheetTitle>
              <SheetDescription className="font-sans font-medium text-muted-foreground mt-1">
                {multiCaseModal?.records.length} Related Cases Found
              </SheetDescription>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-4">
              {multiCaseModal?.records.map((rec, i) => {
                const c = calculateRow(rec);
                const isPaid = c.mainPaid === 1;
                return (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-primary font-heading cursor-pointer hover:underline" onClick={() => {
                          setMultiCaseModal(null);
                          setSelectedRecord(rec);
                        }}>
                          {rec.agreementid || rec.agreement_no || rec.AGREEMENTNO || rec.AGREEMENTID || '-'}
                        </h4>
                        <p className="text-xs text-muted-foreground font-sans mt-1">BKT {rec.bom_bkt} • {rec.state || rec.State} • {rec.city || rec.City}</p>
                      </div>
                      {isPaid 
                        ? <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-success/20 text-success uppercase tracking-wider">Paid</span>
                        : <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-muted-foreground/20 text-muted-foreground uppercase tracking-wider">Unpaid</span>
                      }
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">POS</p>
                        <p className="text-xs font-bold font-data text-foreground">{fmtCur(Number(rec.principal_outstanding) || 0)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">EMI</p>
                        <p className="text-xs font-bold font-data text-foreground">{fmtCur(Number(rec.emi_amt) || 0)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">ECS</p>
                        <p className="text-xs font-bold font-data text-foreground">{fmtCur(Number(rec.ecs ?? rec.ECS) || 0)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">DAC</p>
                        <p className="text-xs font-bold font-data text-info">{fmtCur(Number(rec.dac ?? rec.DAC) || 0)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
`;

if (!content.includes('open={!!multiCaseModal}')) {
  // Replace the closing tags
  content = content.replace("    </AppLayout>\n  );\n}", multiCaseSheetCode);
  console.log("Patched Sheet UI");
}

fs.writeFileSync(file, content);
