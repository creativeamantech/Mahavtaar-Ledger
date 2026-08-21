const fs = require('fs');

function unhideColumns(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ hidden (sm|md|lg):table-cell/g, '');
  fs.writeFileSync(file, content);
}

unhideColumns('src/pages/TeamPivot.tsx');
unhideColumns('src/pages/CityPivot.tsx');
unhideColumns('src/pages/BandExplorer.tsx');
unhideColumns('src/pages/DataExplorer.tsx');
unhideColumns('src/pages/DataEntry.tsx');
