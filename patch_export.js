const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

code = code.replace(
  "const headers = ['Agreement Number', 'Customer Name', 'State', 'City', 'Executive', 'Bucket', 'POS', 'EMI', 'DAC', 'ECS', 'Paid Status'];",
  "const extraHeaders = allExtraKeys.filter(col => (visibleExtraColumns || []).includes(col));\n    const headers = ['Agreement Number', 'Customer Name', 'State', 'City', 'Executive', 'Bucket', 'POS', 'EMI', 'DAC', 'ECS', 'Paid Status', ...extraHeaders];"
);

code = code.replace(
  "isPaid ? 'Paid' : 'Unpaid'\n        ].join(',');",
  "isPaid ? 'Paid' : 'Unpaid',\n          ...extraHeaders.map(col => `\"${String(r[col] || '').replace(/\"/g, '\"\"')}\"`)\n        ].join(',');"
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
