const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
code = code.replace(/\\'Paid\\'/g, "'Paid'");
code = code.replace(/\\'Unpaid\\'/g, "'Unpaid'");
code = code.replace(/\\'-/g, "'-");
code = code.replace(/-\\'/g, "-'");
code = code.replace(/border-l border-border\/30\\'/g, "border-l border-border/30'");
code = code.replace(/\\'border-r/g, "'border-r");
code = code.replace(/\\'\\'/g, "''");
code = code.replace(/border-border\/30\\'/g, "border-border/30'");
code = code.replace(/\\'border-l/g, "'border-l");

// Just to be exhaustive, remove any backslashes before single quotes
code = code.replace(/\\'/g, "'");

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Fixed dashboard quotes");
