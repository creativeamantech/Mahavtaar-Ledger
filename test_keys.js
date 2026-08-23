const record = {
  "Reference One Name": "John Doe",
  "Reference One": "9876543210",
  "Reference Two Name": "Jane Doe",
  "Reference Two": "8765432109"
};

const customerName = "Test Cust";

const extracted = [];
Object.entries(record).forEach(([key, val]) => {
  const kLow = key.toLowerCase();
  if (kLow.includes('crn') || kLow.includes('agreement') || kLow.includes('loan') || kLow.includes('pos')) return;

  const sVal = String(val).replace(/[^0-9]/g, '');
  if (sVal.length >= 10 && sVal.length <= 12) {
    let assocName = customerName;
    
    if (kLow.includes('ref') || kLow.includes('guar') || kLow.includes('relat')) {
      assocName = 'Reference';
      
      let num = '';
      const digitMatch = kLow.match(/\d+/);
      if (digitMatch) num = digitMatch[0];
      else if (kLow.includes('one')) num = 'one';
      else if (kLow.includes('two')) num = 'two';
      else if (kLow.includes('three')) num = 'three';
      else if (kLow.includes('first')) num = 'first';
      else if (kLow.includes('second')) num = 'second';
      
      console.log(`Checking key: ${key}, num: ${num}`);

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
    extracted.push({ number: sVal, source: key, name: assocName });
  }
});
console.log(extracted);
