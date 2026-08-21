const fs = require('fs');

const path = 'src/pages/CityPivot.tsx';
let code = fs.readFileSync(path, 'utf-8');

// 1. Add Link import if missing
if (!code.includes("import { Link }")) {
    code = code.replace(
        "import { Download } from 'lucide-react';",
        "import { Download } from 'lucide-react';\nimport { Link } from 'react-router-dom';"
    );
}

// 2. Add sorting by count descending
code = code.replace(
    "return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));",
    "return Object.entries(groups)\n      .map(([bkt, items]) => [bkt, items.sort((a, b) => b.count - a.count)] as [string, any[]])\n      .sort(([a], [b]) => Number(a) - Number(b));"
);

// 3. Make City clickable
code = code.replace(
    "<td className=\"px-3 py-2 pl-6 font-medium\">{item.city}</td>",
    "<td className=\"px-3 py-2 pl-6 font-medium\">\n                        <Link to={`/explorer?city=${encodeURIComponent(item.city)}`} className=\"text-primary hover:underline\">\n                          {item.city}\n                        </Link>\n                      </td>"
);

fs.writeFileSync(path, code);
console.log('Fixed city sorting and added link in CityPivot');
