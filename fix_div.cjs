const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<\/div>\s*\{\/\* Assignment Modal overlay \*\/\}/,
  '</div>\n      </div>\n\n      {/* Assignment Modal overlay */}'
);

fs.writeFileSync(file, content);
