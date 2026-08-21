const fs = require('fs');
const file = 'src/lib/fileParser.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const aggregated: Record<string, { amount: number, dates: string[] }> = {};',
  'const aggregated: Record<string, { amount: number, dates: string[], firstRow: any }> = {};'
);

content = content.replace(
  'if (!aggregated[agreementid]) aggregated[agreementid] = { amount: 0, dates: [] };',
  'if (!aggregated[agreementid]) aggregated[agreementid] = { amount: 0, dates: [], firstRow: row };'
);

content = content.replace(
  'return Object.entries(aggregated).map(([agreementid, data]) => ({',
  'return Object.entries(aggregated).map(([agreementid, data]) => ({\\n    ...data.firstRow,'
);

fs.writeFileSync(file, content);
