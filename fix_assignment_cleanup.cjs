const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to find where the grid ends.
// Let's remove everything from {/* Sidebar: Executive Matrix */} to the end of the viewMode === 'DAILY' block.
content = content.replace(/\{\/\* Sidebar: Executive Matrix \*\/\}[\s\S]*?\{viewMode === 'DAILY' && \([\s\S]*?<\/div>\n\s*<\/div>\n\s*\)\}/, '');

fs.writeFileSync(file, content);
