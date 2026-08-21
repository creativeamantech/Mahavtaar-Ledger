const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("calculateRow")) {
  content = content.replace(
    "import { fmtCur } from '../lib/formatters';",
    "import { fmtCur } from '../lib/formatters';\nimport { calculateRow } from '../lib/calculations';"
  );
}

content = content.replace(
  `      if (excludePaid) {
        const status = String(r.status || '').toUpperCase();
        const isPaid = status.includes('PAID') || status.includes('SETTLED') || (Number(r.amount_collected) > 0 && Number(r.amount_collected) >= Number(r.principal_outstanding));
        if (isPaid) return false;
      }`,
  `      if (excludePaid) {
        const c = calculateRow(r);
        if (c.mainPaid === 1) return false;
      }`
);

fs.writeFileSync(file, content);
