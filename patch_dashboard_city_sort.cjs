const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// The line is currently:
// const cityData = Object.keys(byCity).map(k => ({ city: k, ...byCity[k] })).sort((a,b) => b.pos - a.pos);
// Let's replace it back to sort by cases descending, then POS descending.
const target = "const cityData = Object.keys(byCity).map(k => ({ city: k, ...byCity[k] })).sort((a,b) => b.pos - a.pos);";
const replacement = "const cityData = Object.keys(byCity).map(k => ({ city: k, ...byCity[k] })).sort((a,b) => b.cases !== a.cases ? b.cases - a.cases : b.pos - a.pos);";

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched dashboard city sort");
