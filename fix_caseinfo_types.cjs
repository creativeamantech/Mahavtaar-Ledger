const fs = require('fs');

let code = fs.readFileSync('src/components/CaseInformationTable.tsx', 'utf-8');

code = code.replace(/}: any\) \{/, "}: { records: import('../types/domain').LoanRecord[]; onAssignmentChange: (id: string, exec: string) => void; executives: string[] }) {");
code = code.replace(/\(r:any\)/g, "(r: import('../types/domain').LoanRecord)");
code = code.replace(/\(c:any\)/g, "(c: string)");
code = code.replace(/\(b:any\)/g, "(b: string)");
code = code.replace(/\(e:any\)/g, "(e: string)");

fs.writeFileSync('src/components/CaseInformationTable.tsx', code);
