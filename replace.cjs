const fs = require('fs');
let content = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

const target = `const STANDARD_KEYS = [
  'agreementid', 'agreement_no',
  'customer_name', 'CUSTOMERNAME', 'Customer Name', 'CUSTOMER_NAME', 'customername',
  'bom_bkt',
  'state', 'State',
  'city', 'City',
  'executive_name', 'Executive Name',
  'principal_outstanding',
  'emi_amt',
  'ecs',
  'provisional_dac', 'dac',
  'mainPaid', 'emiCount'];`;

const replacement = `const STANDARD_KEYS = [
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
];`;

fs.writeFileSync('src/pages/DataExplorer.tsx', content.replace(target, replacement));
