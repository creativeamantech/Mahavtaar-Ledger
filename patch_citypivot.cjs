const fs = require('fs');
let code = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');

code = code.replace(
  "import { useData } from '../contexts/DataContext';",
  "import { useData } from '../contexts/DataContext';\nimport { useNavigate } from 'react-router-dom';"
);

code = code.replace(
  "export default function CityPivot() {",
  "export default function CityPivot() {\n  const navigate = useNavigate();\n  const navigateToExplorer = (filters: { city?: string, bucket?: string, paid?: string }) => {\n    const params = new URLSearchParams();\n    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);\n    if (filters.bucket) params.set('bucket', filters.bucket);\n    if (filters.city) params.set('city', filters.city);\n    if (filters.paid) params.set('paid', filters.paid);\n    navigate(`/explorer?${params.toString()}`);\n  };"
);

// We need to replace the cells for the individual city rows:
// The row looks like:
// <tr key={item.city} className="border-b border-border transition-colors hover:bg-muted">
//   <td className="px-3 py-2 pl-6 font-medium">{item.city}</td>
//   <td className="px-3 py-2 text-right">{fmtCur(item.collection)}</td>
//   <td className="px-3 py-2 text-right">{item.count}</td>
//   <td className="px-3 py-2 text-right text-success">{item.paid}</td>

const itemRowMatch = `<td className="px-3 py-2 pl-6 font-medium">{item.city}</td>
                      <td className="px-3 py-2 text-right">{fmtCur(item.collection)}</td>
                      <td className="px-3 py-2 text-right">{item.count}</td>
                      <td className="px-3 py-2 text-right text-success">{item.paid}</td>`;

const itemRowRep = `<td className="px-3 py-2 pl-6 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{item.city}</td>
                      <td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{fmtCur(item.collection)}</td>
                      <td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{item.count}</td>
                      <td className="px-3 py-2 text-right text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>{item.paid}</td>`;
code = code.replace(itemRowMatch, itemRowRep);

// We should also look at the subtotal / footer?
// Subtotal is not immediately clear, let me look at the whole file.

fs.writeFileSync('src/pages/CityPivot.tsx', code);
console.log("Patched CityPivot (Part 1)");
