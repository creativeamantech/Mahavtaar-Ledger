const fs = require('fs');
const path = require('path');

const componentsToInject = [
  'src/pages/Dashboard.tsx',
  'src/pages/ExecDashboard.tsx',
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/BandExplorer.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/Ledger.tsx',
  'src/pages/Assignment.tsx'
];

componentsToInject.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already injected
  if (content.includes('BucketFilter')) return;

  // Add import
  const importStatement = "import { BucketFilter } from '../components/BucketFilter';\n";
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
  } else {
    content = importStatement + content;
  }

  // Find the start of the layout wrapper/return statement 
  // Most pages return <AppLayout>
  const returnAppLayout = /<AppLayout[^>]*>/;
  if (returnAppLayout.test(content)) {
    content = content.replace(returnAppLayout, match => {
      return `${match}\n      <div className="mb-4"><BucketFilter /></div>`;
    });
  } else {
      // Find return ( <div
      const returnDiv = /return \(\s*<div[^>]*>/;
      if (returnDiv.test(content)) {
          content = content.replace(returnDiv, match => {
              return `${match}\n      <div className="mb-4 p-4"><BucketFilter /></div>`;
          });
      }
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Injected BucketFilter into ${file}`);
});
