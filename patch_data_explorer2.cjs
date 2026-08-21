const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{visibleExtraColumns.map(col => (',
  '{(visibleExtraColumns || []).map(col => ('
);

content = content.replace(
  '{visibleExtraColumns.map(col => (',
  '{(visibleExtraColumns || []).map(col => ('
);

fs.writeFileSync(file, content);
