const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "import { useData } from '../contexts/DataContext';\\nimport { useNavigate } from 'react-router-dom';",
  "import { useData } from '../contexts/DataContext';\nimport { useNavigate } from 'react-router-dom';"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Fixed dashboard newline");
