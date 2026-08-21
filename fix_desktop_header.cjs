const fs = require('fs');
const file = 'src/components/layout/DesktopHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<p className="font-sans text-sm text-muted-foreground mt-1">{info.subtitle}</p>\n      </div>',
  '<p className="font-sans text-sm text-muted-foreground mt-1">{info.subtitle}</p>\n      </div>\n      </div>'
);
fs.writeFileSync(file, content);
