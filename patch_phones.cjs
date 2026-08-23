const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomerDetail.tsx', 'utf8');

const newPhonesLogic = `
  const phones = useMemo(() => {
    if (!record) return [];
    const extracted: { number: string, source: string, name?: string }[] = [];
    
    const customerName = record.customer_name || record.CUSTOMERNAME || record['Customer Name'] || record.CUSTOMER_NAME || record.customername || 'Customer';

    Object.entries(record).forEach(([key, val]) => {
      const kLow = key.toLowerCase();
      // Skip CRN, Agreement, Loan IDs as they are often 10-12 digits but not phone numbers
      if (kLow.includes('crn') || kLow.includes('agreement') || kLow.includes('loan') || kLow.includes('pos')) return;

      const sVal = String(val).replace(/[^0-9]/g, '');
      if (sVal.length >= 10 && sVal.length <= 12) {
        
        let assocName = customerName;
        
        // If it's a reference or guarantor, try to find their specific name
        if (kLow.includes('ref') || kLow.includes('guar') || kLow.includes('relat')) {
          assocName = 'Reference';
          const match = kLow.match(/\\d+/);
          const num = match ? match[0] : '';
          
          const nameKey = Object.keys(record).find(k => {
            const kl = k.toLowerCase();
            return kl.includes('name') && (kl.includes('ref') || kl.includes('guar') || kl.includes('relat')) && (num ? kl.includes(num) : true) && kl !== kLow;
          });
          
          if (nameKey && record[nameKey]) {
            assocName = String(record[nameKey]);
          }
        }

        if (!extracted.some(e => e.number === sVal)) {
          extracted.push({ number: sVal, source: key, name: assocName });
        }
      }
    });
    return extracted;
  }, [record]);
`;

code = code.replace(/const phones = useMemo\(\(\) => \{[\s\S]*?return extracted;\n  \}, \[record\]\);/, newPhonesLogic);

// Replace UI mapping
const oldUIMapping = `<span className="font-mono font-bold text-lg">{p.number}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{p.source.replace(/_/g, ' ')}</Badge>`;
                      
const newUIMapping = `<div>
                        <span className="font-mono font-bold text-lg block leading-none mb-1">{p.number}</span>
                        {p.name && <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{p.name}</span>}
                      </div>
                      <Badge variant="secondary" className="text-[10px] capitalize max-w-[100px] text-center">{p.source.replace(/_/g, ' ')}</Badge>`;

code = code.replace(oldUIMapping, newUIMapping);

fs.writeFileSync('src/pages/CustomerDetail.tsx', code);
