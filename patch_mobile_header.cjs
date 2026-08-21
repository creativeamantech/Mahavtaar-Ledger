const fs = require('fs');
const file = 'src/components/layout/MobileHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('/exec-dashboard')) {
  content = content.replace(
    "'/dashboard': 'Dashboard',",
    "'/dashboard': 'Dashboard',\n  '/exec-dashboard': 'Exec Dashboard',"
  );
  fs.writeFileSync(file, content);
  console.log('MobileHeader patched');
}
