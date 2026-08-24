const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace allExtraKeys.filter(col => (visibleExtraColumns || []).includes(col)) 
// with (visibleExtraColumns || []).filter(col => allExtraKeys.includes(col))
// This allows visibleExtraColumns to dictate the order!
content = content.replace(
    /\(allExtraKeys\.filter\(col => \(visibleExtraColumns \|\| \[\]\)\.includes\(col\)\)\)/g,
    "(visibleExtraColumns || []).filter(col => allExtraKeys.includes(col))"
);

// We need to add Drag & Drop logic to the column headers in the table.
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed column order resolution');
