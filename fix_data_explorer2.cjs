const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

code = code.replace(
  /<tr \n\s*key=\{r\.id \|\| idx\}/,
  `<tr 
                      ref={rowVirtualizer.measureElement}
                      data-index={virtualRow.index}
                      key={r.id || idx}`
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
