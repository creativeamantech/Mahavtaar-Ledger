const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "navigate(`/explorer?${params.toString()}`);\n  };\n\\n  if (isLoading) {",
  "navigate(`/explorer?${params.toString()}`);\n  };\n\n  if (isLoading) {"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Fixed dashboard newline 3");
