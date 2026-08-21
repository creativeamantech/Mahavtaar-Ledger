const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('\\n  );\\n}\\n', '\n  );\n}\n');
fs.writeFileSync(file, content);
