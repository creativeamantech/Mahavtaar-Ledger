const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

code = code.replace(
  "const STANDARD_KEYS = [\n  'agreementid', 'agreement_no',\n  'customer_name', 'CUSTOMERNAME', 'Customer Name', 'CUSTOMER_NAME', 'customername',\n  'bom_bkt',\n  'state', 'State',\n  'city', 'City',\n  'executive_name', 'Executive Name',\n  'principal_outstanding',\n  'emi_amt',\n  'ecs',\n  'provisional_dac', 'dac',\n  'mainPaid', 'emiCount'];",
  `const STANDARD_KEYS = [
  'agreementid', 'agreement_no', 'AGREEMENTID', 'AGREEMENTNO', 'AGREEMENT_NO', 'Agreement No', 'loan_id', 'Loan ID',
  'customer_name', 'CUSTOMERNAME', 'Customer Name', 'CUSTOMER_NAME', 'customername',
  'bom_bkt',
  'state', 'State',
  'city', 'City',
  'executive_name', 'Executive Name', 'Final EX. Name', 'Final EX. name', 'Final EX.NAME', 'EX. Name', 'EX. name', 'EX.NAME', 'Final Executive Name', 'final_executive_name', 'Final Executive', 'final_executive', 'Executive', 'executive',
  'principal_outstanding',
  'emi_amt',
  'ecs', 'ECS',
  'provisional_dac', 'dac', 'DAC',
  'mainPaid', 'emiCount'
];`
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
