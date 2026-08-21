const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// The problematic lines:
// <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
// ...
// <div className="ml-auto shrink-0">
//   <button ...> Clear Secondary </button>
//   <div className="flex items-center ml-2 border-l border-border pl-4 gap-2">

content = content.replace(
  /className="flex items-center gap-4 overflow-x-auto no-scrollbar"/g,
  'className="flex flex-wrap items-center gap-4"'
);

// fix the nested div
content = content.replace(
  /<div className="ml-auto shrink-0">([\s\S]*?)<\/button>\s*<div className="flex items-center ml-2 border-l border-border pl-4 gap-2">/g,
  `<div className="flex flex-wrap items-center gap-2 shrink-0 lg:ml-auto">
    $1</button>
    <div className="flex flex-wrap items-center border-l border-border pl-4 gap-2">`
);

fs.writeFileSync(file, content);
