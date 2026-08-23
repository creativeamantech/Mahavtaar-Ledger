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
          
          let num = '';
          const digitMatch = kLow.match(/\\d+/);
          if (digitMatch) num = digitMatch[0];
          else if (kLow.includes('one')) num = 'one';
          else if (kLow.includes('two')) num = 'two';
          else if (kLow.includes('three')) num = 'three';
          else if (kLow.includes('first')) num = 'first';
          else if (kLow.includes('second')) num = 'second';
          
          const nameKey = Object.keys(record).find(k => {
            const kl = k.toLowerCase();
            if (kl === kLow) return false;
            return kl.includes('name') && 
                   (kl.includes('ref') || kl.includes('guar') || kl.includes('relat')) && 
                   (num ? kl.includes(num) : true);
          });
          
          if (nameKey && record[nameKey]) {
            assocName = String(record[nameKey]);
          } else {
            // Fallback: looking for a field without 'no'/'number'/'phone'
            const fallbackKey = Object.keys(record).find(k => {
              const kl = k.toLowerCase();
              if (kl === kLow) return false;
              const hasRef = kl.includes('ref') || kl.includes('guar') || kl.includes('relat');
              const hasNum = num ? kl.includes(num) : true;
              const isNotNumberField = !kl.includes('no') && !kl.includes('num') && !kl.includes('phone') && !kl.includes('mob');
              return hasRef && hasNum && isNotNumberField;
            });
            if (fallbackKey && record[fallbackKey]) {
              assocName = String(record[fallbackKey]);
            }
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

fs.writeFileSync('src/pages/CustomerDetail.tsx', code);
