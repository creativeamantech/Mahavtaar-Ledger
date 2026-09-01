const fs = require('fs');

let code = fs.readFileSync('src/pages/DataEntry.tsx', 'utf-8');

code = code.replace(/_v: number, row: any/g, "_v: number, row: import('../types/domain').LoanRecord");
code = code.replace(/_: any, row: any/g, "_: unknown, row: import('../types/domain').LoanRecord");
code = code.replace(/row: any/g, "row: import('../types/domain').LoanRecord");

fs.writeFileSync('src/pages/DataEntry.tsx', code);
