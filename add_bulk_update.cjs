const fs = require('fs');

let ctxCode = fs.readFileSync('src/contexts/DataContext.tsx', 'utf-8');

// Add bulkUpdateRecords to the interface
const interfacePoint = `  updateRecord: (agreementid: string, field: string, value: any, userName: string) => Promise<void>;`;
const newInterface = `  updateRecord: (agreementid: string, field: string, value: any, userName: string) => Promise<void>;
  bulkUpdateRecords: (updates: {agreementid: string, field: string, value: any}[], userName: string) => Promise<void>;`;

ctxCode = ctxCode.replace(interfacePoint, newInterface);

// Add the implementation of bulkUpdateRecords
const implPoint = `  const setTarget = useCallback(async (key: string, pct: number, _userName: string) => {`;
const bulkImpl = `
  const bulkUpdateRecords = useCallback(async (updates: {agreementid: string, field: string, value: any}[], userName: string) => {
    let newAudits: AuditEntry[] = [];
    const updateMap = new Map();
    
    updates.forEach(u => {
      if (!updateMap.has(u.agreementid)) {
        updateMap.set(u.agreementid, {});
      }
      updateMap.get(u.agreementid)[u.field] = u.value;
      updateMap.get(u.agreementid)[\`\${u.field}_source\`] = 'MANUAL';
    });

    let updatedRecords: any[] = [];

    setRecords(prev => {
      const next = prev.map(r => {
        if (updateMap.has(r.agreementid)) {
          const u = updateMap.get(r.agreementid);
          
          Object.keys(u).forEach(key => {
            if (!key.endsWith('_source')) {
              newAudits.push({
                id: crypto.randomUUID(),
                agreementid: r.agreementid,
                field: key,
                oldValue: String(r[key] ?? ''),
                newValue: String(u[key]),
                changedBy: userName,
                createdAt: new Date().toISOString(),
                source: 'MANUAL',
              });
            }
          });
          
          updatedRecords.push({ ...r, ...u });
          return { ...r, ...u };
        }
        return r;
      });
      return next;
    });

    setAuditLog(a => [...newAudits, ...a]);

    await db.loan_records.bulkPut(updatedRecords);
    await db.audit_log.bulkPut(newAudits);
  }, []);

`;

ctxCode = ctxCode.replace(implPoint, bulkImpl + implPoint);

const exportPoint = `loadCorrectedFile, updateRecord, setTarget, globalBucket, setGlobalBucket }}>`;
const newExport = `loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, globalBucket, setGlobalBucket }}>`;

ctxCode = ctxCode.replace(exportPoint, newExport);

fs.writeFileSync('src/contexts/DataContext.tsx', ctxCode);
console.log("Added bulkUpdateRecords to DataContext");
