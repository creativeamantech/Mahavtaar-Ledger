const fs = require('fs');
const file = 'src/lib/fileParser.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "return rows.map(row => ({\\n    agreementid",
  "return rows.map(row => ({\\n    ...row,\\n    agreementid"
);

fs.writeFileSync(file, content);
