const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "export default function Dashboard() {\\n  const navigate = useNavigate();",
  "export default function Dashboard() {\n  const navigate = useNavigate();"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Fixed dashboard newline 2");
