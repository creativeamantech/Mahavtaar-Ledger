const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `className={\`text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors \${!customFilterValues[col] || customFilterValues[col] === 'All' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}\`}`;
const replacement1 = `className={\`text-left px-2 py-2 shrink-0 text-xs rounded hover:bg-muted transition-colors \${!customFilterValues[col] || customFilterValues[col] === 'All' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}\`}`;

const target2 = `className={\`text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors truncate \${customFilterValues[col] === o ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}\`}`;
const replacement2 = `className={\`text-left px-2 py-2 shrink-0 text-xs rounded hover:bg-muted transition-colors truncate \${customFilterValues[col] === o ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}\`}`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Patched target1");
} else {
  console.log("Could not find target1");
}

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Patched target2");
} else {
  console.log("Could not find target2");
}

fs.writeFileSync(file, content);
