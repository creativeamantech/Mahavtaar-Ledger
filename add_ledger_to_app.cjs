const fs = require('fs');

// Add to routing (App.tsx)
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appCode.includes('Ledger')) {
  appCode = appCode.replace(
    "import DataExplorer from './pages/DataExplorer';", 
    "import DataExplorer from './pages/DataExplorer';\nimport Ledger from './pages/Ledger';"
  );
  appCode = appCode.replace(
    '<Route path="/explorer" element={<DataExplorer />} />',
    '<Route path="/explorer" element={<DataExplorer />} />\n                <Route path="/ledger" element={<Ledger />} />'
  );
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('Added Ledger to routing');
}

// Add to sidebar (AppLayout.tsx)
let layoutCode = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf-8');
if (!layoutCode.includes('href: "/ledger"')) {
  layoutCode = layoutCode.replace(
    '{ name: "Data Explorer", href: "/explorer", icon: Database },',
    '{ name: "Data Explorer", href: "/explorer", icon: Database },\n  { name: "Case Ledger", href: "/ledger", icon: FileText },'
  );
  layoutCode = layoutCode.replace(
    'import { Database, Target, UploadCloud, Users, LayoutDashboard, Menu, X, LogOut, ChevronDown, Check }',
    'import { Database, Target, UploadCloud, Users, LayoutDashboard, Menu, X, LogOut, ChevronDown, Check, FileText }'
  );
  fs.writeFileSync('src/components/layout/AppLayout.tsx', layoutCode);
  console.log('Added Ledger to sidebar');
}

