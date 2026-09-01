const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

code = code.replace(
  /virtualItems\.length > 0 && virtualItems\[0\]\.start > 0 && \(/,
  `<>
                {virtualItems.length > 0 && virtualItems[0].start > 0 && (`
);

code = code.replace(
  /\}\)\n\s*\}\n\s*\{\n\s*virtualItems\.length > 0 && virtualItems\[virtualItems\.length - 1\]\.end < rowVirtualizer\.getTotalSize\(\) && \(/,
  `})
              }
              {
                virtualItems.length > 0 && virtualItems[virtualItems.length - 1].end < rowVirtualizer.getTotalSize() && (`
);

code = code.replace(
  /<\/tr>\n\s*\)\n\s*\}\n\s*\)\}\n\s*<\/tbody>/,
  `</tr>
                )
              }
              </>
            )}
            </tbody>`
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
