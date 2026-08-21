const fs = require('fs');
const file = 'src/lib/fileParser.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "return Object.entries(aggregated).map(([agreementid, data]) => ({\\n    ...data.firstRow,",
  "return Object.entries(aggregated).map(([agreementid, data]) => ({\n    ...data.firstRow,"
);

fs.writeFileSync(file, content);
