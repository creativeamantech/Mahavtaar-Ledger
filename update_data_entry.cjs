const fs = require('fs');
const file = 'src/pages/DataEntry.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "{ key: 'executive_name', label: 'Executive', width: '100px' },",
  "{ key: 'executive_name', label: 'Executive', width: '100px', hideBelow: 'sm' as const },"
);
content = content.replace(
  "{ key: 'city', label: 'City', width: '80px' },",
  "{ key: 'city', label: 'City', width: '80px', hideBelow: 'sm' as const },"
);
content = content.replace(
  "{ key: 'emi_amt', label: 'EMI', align: 'right' as const, render: (v: number) => fmtCur(v) },",
  "{ key: 'emi_amt', label: 'EMI', align: 'right' as const, hideBelow: 'md' as const, render: (v: number) => fmtCur(v) },"
);
content = content.replace(
  "{ key: 'principal_outstanding', label: 'POS', align: 'right' as const, render: (v: number) => fmtCur(v) },",
  "{ key: 'principal_outstanding', label: 'POS', align: 'right' as const, hideBelow: 'lg' as const, render: (v: number) => fmtCur(v) },"
);
content = content.replace(
  "key: 'provisional_dac', label: 'Prov DAC', align: 'right' as const, width: '90px',",
  "key: 'provisional_dac', label: 'Prov DAC', align: 'right' as const, width: '90px', hideBelow: 'sm' as const,"
);
content = content.replace(
  "key: 'ecs', label: 'ECS', align: 'right' as const, width: '90px',",
  "key: 'ecs', label: 'ECS', align: 'right' as const, width: '90px', hideBelow: 'sm' as const,"
);
content = content.replace(
  "key: 'special', label: 'Special', align: 'right' as const, width: '90px',",
  "key: 'special', label: 'Special', align: 'right' as const, width: '90px', hideBelow: 'sm' as const,"
);
content = content.replace(
  "key: '_emiCount', label: 'EMI#', align: 'center' as const, sortable: false,",
  "key: '_emiCount', label: 'EMI#', align: 'center' as const, sortable: false, hideBelow: 'sm' as const,"
);
content = content.replace(
  "key: '_mainPaid', label: 'Status', sortable: false,",
  "key: '_mainPaid', label: 'Status', sortable: false, hideBelow: 'sm' as const,"
);

fs.writeFileSync(file, content);
