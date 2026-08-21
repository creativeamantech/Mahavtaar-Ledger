const fs = require('fs');

function fixSyntax(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}

fixSyntax('src/components/layout/DesktopHeader.tsx');
fixSyntax('src/components/layout/MobileHeader.tsx');
