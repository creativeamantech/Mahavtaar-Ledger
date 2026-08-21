const fs = require('fs');
const file = 'src/lib/fileParser.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "return rows.map(row => {\\n    const sfdc",
  "return rows.map(row => {\\n    const sfdc"
);

// For paid file
content = content.replace(
  "return {\\n      agreementid",
  "return {\\n      ...row,\\n      agreementid"
);

// For additional file
// Wait, additional file aggregates by agreementid, so row spreading doesn't work if there are multiple rows for one agreementid.
// It currently does:
// const aggregated: Record<string, { amount: number, dates: string[] }> = {};
// let's leave additional file or merge it correctly.

// For corrected file
content = content.replace(
  "return rows.map(row => ({\\n    agreementid",
  "return rows.map(row => ({\\n    ...row,\\n    agreementid"
);

fs.writeFileSync(file, content);
