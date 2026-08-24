const fs = require('fs');

const files = [
  'src/pages/Assignment.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" \/><Filter className="h-3 w-3 ml-1" \/><\/span>/g, '');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done reverting Assignment headers');
