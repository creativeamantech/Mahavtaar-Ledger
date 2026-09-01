const fs = require('fs');

let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf-8');

code = code.replace(/records: any\[\];/g, "records: import('../types/domain').LoanRecord[];");
code = code.replace(/filteredRecords: any\[\];/g, "filteredRecords: import('../types/domain').LoanRecord[];");
code = code.replace(/useState<any\[\]>\(\[\]\);/g, "useState<import('../types/domain').LoanRecord[]>([]);");
code = code.replace(/\(r: any\)/g, "(r: import('../types/domain').LoanRecord)");
code = code.replace(/value: any/g, "value: unknown");

fs.writeFileSync('src/contexts/DataContext.tsx', code);
