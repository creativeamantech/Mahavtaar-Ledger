const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "import { useData } from '../contexts/DataContext';",
  "import { useData } from '../contexts/DataContext';\\nimport { useNavigate } from 'react-router-dom';"
);

code = code.replace(
  "export default function Dashboard() {",
  "export default function Dashboard() {\\n  const navigate = useNavigate();"
);

code = code.replace(
  "window.location.href = `/explorer?${params.toString()}`;",
  "navigate(`/explorer?${params.toString()}`);"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Updated to useNavigate");
