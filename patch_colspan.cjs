const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<td colSpan={11} className="p-8 text-center text-muted-foreground">',
  '<td colSpan={11 + (visibleExtraColumns || []).length} className="p-8 text-center text-muted-foreground">'
);

fs.writeFileSync(file, content);
